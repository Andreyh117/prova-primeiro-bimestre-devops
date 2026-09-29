# Design revisado — API de Reservas

Este documento descreve como cumprir R01–R32 de [requirements.md](requirements.md).
As decisões D01–D15 são nossas escolhas, não regras adicionais atribuídas ao
professor. Em 28/09/2026, o aluno revisou as specs e alterou o formato externo de
data para `DD-MM-YYYY`; a decisão D02 foi atualizada. T06 implementou schema/
conexão; T07 implementou POST/GET. T08 completou CRUD e health/503 com 48 testes
locais aprovados. T09 verificou script/restart nativo com 51 testes. T10 validou
build/contexto/UID/CRUD/SQL em imagem Docker. T11 validou Compose, saúde/ordem,
rede/volume/ambiente e CRUD/SQL. T12 comprovou persistência após recriar api/db
mantendo o volume nomeado, com HTTP/SQL e negativos reais. Infraestrutura é futura.
Planos AWS e destruição continuam sujeitos a revisão/autorização.

## Arquitetura e estrutura

```mermaid
flowchart LR
  L[Cliente local] -->|localhost:3000| A[API Express em container]
  A -->|bridge customizada / 5432| P[(PostgreSQL local)]
  P --> V[Volume nomeado]
  U[Cliente autorizado] -->|CIDR permitido / 3000| E[EC2 t2.micro em subnet pública]
  E -->|SG EC2 / 5432 / TLS| R[(RDS PostgreSQL db.t3.micro privado)]
  T[Terraform na máquina do aluno] --> S[State S3 versionado e encriptado]
  T --> D[DynamoDB LockID]
```

D01: manter a organização do enunciado. A futura estrutura inclui `app/src/`,
`app/package.json`, lockfile npm, `app/Dockerfile`, `app/.dockerignore`,
`docker-compose.yml`, `.env.example`, `.gitignore`, `README.md`, `relatorio.md`,
`infra/{main,variables,outputs,providers}.tf`, os quatro módulos e `infra/backend/`.
Acrescentar `app/sql/001-reservas.sql`, testes em `app/test/`, `scripts/` de
verificação, `docs/diario-ia.md` e `evidencias/`. Esses complementos organizam a
validação; não constituem entregas extras exigidas pelo professor.

## Contrato HTTP e dados

D02 (revisada em 28/09/2026): `data` é uma data civil sem horário, recebida e
devolvida em JSON como string `DD-MM-YYYY`, com dois dígitos para dia/mês e
quatro para ano (0001–9999). Exemplo: `15-10-2026`. Validar o calendário e anos
bissextos antes de gravar; não impor data futura. Não aceitar formato ISO no
contrato externo, dia/mês sem zero à esquerda, horário ou normalização automática
que transforme data impossível em outro dia.

PostgreSQL mantém o tipo `DATE`. A aplicação separa dia/mês/ano explicitamente,
valida os componentes e envia `YYYY-MM-DD` como parâmetro SQL interno; nas
consultas/RETURNING, formatar a data para `DD-MM-YYYY`, por exemplo com
`to_char(data, 'DD-MM-YYYY') AS data`. Não usar `new Date(texto)` para interpretar
esse formato nem depender de DateStyle/localidade/fuso. O ISO é apenas uma
representação interna para a escrita SQL, nunca a resposta da API.

Casos T07 executados por HTTP/SQL: aceitar `29-02-2024` e extremos 0001/9999;
rejeitar `29-02-2025`, `29-02-1900`, `31-04-2026`, `2026-10-15`, `1-2-2026`,
horário e whitespace adicional. POST, GET de lista e GET por ID devolveram a
mesma data válida em `DD-MM-YYYY`; entradas rejeitadas não inseriram linhas.
T08 validou o mesmo contrato no PUT completo, mantendo ID e dados intactos nas rejeições.

D03: `cliente` é string com espaços externos removidos, entre 1 e 120 caracteres
Unicode; rejeitar null, valores não string, texto vazio, NUL e sequências
Unicode malformadas (surrogates isolados). A restrição de texto foi explicitada
em T07 para evitar erro de PostgreSQL ou substituição silenciosa na codificação.
`status` é obrigatório,
exatamente `pendente`, `confirmada` ou `cancelada`. Não há status padrão nem
transições de estado especiais. São escolhas simples para validação previsível.

D04: POST e PUT recebem objeto JSON contendo exatamente `cliente`, `data` e
`status`, todos obrigatórios; rejeitar campos desconhecidos, inclusive `id`.
PUT substitui integralmente os três campos editáveis, preservando o ID; não há
PATCH nem atualização parcial. `id` é inteiro positivo gerado pelo banco
(1–2147483647); parâmetro de rota inválido retorna 400 antes de executar SQL.
JSON malformado/campos inválidos retornam 400; Content-Type inadequado retorna
415, corpo acima de 16 KiB retorna 413. Não acrescentar autenticação nesta prova.

Exemplo de corpo válido (dados fictícios de teste):

```json
{"cliente":"Cliente de teste","data":"15-10-2026","status":"pendente"}
```

| Método / rota | Sucesso e resposta | Falha prevista |
|---|---|---|
| POST `/reservas` | 201; objeto com os quatro campos; `Location: /reservas/<id>`. | 400/413/415; nenhuma linha inserida quando rejeitado. |
| GET `/reservas` | 200; array de objetos ordenado por ID crescente, inclusive `[]`. | 503 se banco indisponível. |
| GET `/reservas/:id` | 200; objeto com os quatro campos. | 400 ID inválido; 404 inexistente. |
| PUT `/reservas/:id` | 200; objeto atualizado; uma linha alterada, mesmo ID. | 400/413/415; 404 inexistente; sem alterações na falha. |
| DELETE `/reservas/:id` | 204, sem corpo; remoção física. | 400 ID inválido; 404 inexistente, inclusive segundo DELETE. |
| GET `/health` | 200 `{"status":"ok","database":"ok"}` se `SELECT 1` funcionar. | 503 `{"status":"unavailable","database":"unavailable"}` se banco falhar. |

D05: `/health` verifica conexão real ao banco com timeout curto; não expõe
endpoint/usuário/senha. Erros das outras rotas usam
`{"erro":{"codigo":"ENTRADA_INVALIDA","mensagem":"..."}}`, com códigos estáveis
para 400, 404, 413, 415 e 503. Falhas inesperadas retornam 500 com mensagem
genérica. Não devolver SQL, stack trace nem credenciais. Se ID e corpo do PUT
forem válidos, mas a linha não existir, responder 404.

### Esquema PostgreSQL

D06: tabela única `reservas`, sem campos adicionais de domínio:

| Coluna | Tipo e restrição | Finalidade |
|---|---|---|
| `id` | INTEGER GENERATED ALWAYS AS IDENTITY, PRIMARY KEY. | ID do banco, independente de memória da API. |
| `cliente` | VARCHAR(120), NOT NULL, CHECK de texto não vazio após trim. | Campo obrigatório validado também no banco. |
| `data` | DATE, NOT NULL. | Data civil; converter explicitamente para `DD-MM-YYYY` no JSON. |
| `status` | VARCHAR(10), NOT NULL, CHECK na lista de D03. | Impedir valores fora do contrato. |

Usar `pg` com pool e SQL parametrizado; criar/atualizar/excluir com `RETURNING`
para obter resultado da própria operação e determinar 404 sem consulta separada.
GET sempre consulta o banco. Script SQL inicial idempotente não apaga dados.
Mudanças posteriores de schema terão migração explícita: não depender de
`CREATE TABLE IF NOT EXISTS` para modificar uma tabela existente.

T06: schema em `app/sql/001-reservas.sql`, pool em `app/src/db.js` e CLI em
`app/src/migrate.js`. `PGSSL` é explícito; modo true exige CA e mantém verificação
de certificado. O pool limita a cinco conexões e aplica timeouts. O runner
`app/test/run-postgres.js` cria banco Docker exclusivo por UUID, em loopback,
com senha só em memória e dados tmpfs. Executa migração e node:test; limpa apenas
seu container por label. A suíte tem 3 testes de configuração e 15 de banco real.
A evidência T06 isolada não comprova CRUD HTTP nem TLS/RDS.

T07: `app/src/app.js` implementa POST e GET com parâmetros e RETURNING;
`validation.js` valida dados antes do SQL; `errors.js` responde erros JSON;
`server.js` inicia o servidor e fecha HTTP/pool ao receber SIGTERM/SIGINT.
`npm start` usa PORT 3000 por padrão e exige PG*; schema é aplicado separadamente.
`app/test/api.test.js` inicia o servidor nativo em subprocesso e confirma o
estado do banco por um pool independente, incluindo alteração SQL refletida
no GET. A suíte completa tem 35 testes: 17 HTTP, 15 de banco e 3 de configuração.
Evidências em `evidencias/api-local.txt` e `evidencias/t07-execucao.txt`.
400/404/413/415 estão cobertos; PUT/DELETE/health/503 são T08; restart/persistência
é T09. TLS/RDS permanecem sem execução.

T08: PUT usa a mesma validação/corpo do POST e UPDATE parametrizado com
RETURNING; DELETE usa DELETE ... RETURNING id para decidir 204/404 sem consulta
prévia. Sem corpo em 204. /health executa SELECT 1 com query_timeout 2000 ms e
prazo total 2000 ms incluindo fila/conexão; não guarda resultado em cache.
A consulta de saúde é somente leitura e pode terminar em segundo plano quando
o prazo total antecede a aquisição da conexão, limitada pelos timeouts do pool.
Falhas conhecidas de rede, classe SQLSTATE 08, encerramento/capacidade do servidor
e timeouts do driver viram 503 BANCO_INDISPONIVEL. Erros inesperados mantêm 500
com mensagem genérica; SQL/stack/credenciais não são devolvidos. Os textos de
timeout foram conferidos na versão pg fixa; revalidar ao atualizar dependências.

A suíte tem 48 testes: 27 HTTP em servidor nativo, 3 HTTP de falha real do banco,
15 de PostgreSQL e 3 de configuração. A última suíte inspeciona apenas labels/
porta, confirma o UUID de propriedade e executa pause/unpause/stop no container
exclusivo. Health ficou 503 em 2008 ms e recuperou 200; stop resultou em 503 nas
cinco rotas CRUD. Renomear/restaurar a tabela exclusiva induziu erro SQL real
para verificar o fallback 500. São falhas planejadas, não mocks/defeitos observados.
Evidências: api-local.txt completo e health-local.txt com trechos da mesma execução.
O runner retoma container próprio pausado antes de limpar, se necessário.

Referências T08: [pg Pool](https://node-postgres.com/apis/pool),
[pg Client/timeouts](https://node-postgres.com/apis/client),
[SQLSTATE PostgreSQL 16](https://www.postgresql.org/docs/16/errcodes-appendix.html),
[UPDATE/RETURNING](https://www.postgresql.org/docs/16/sql-update.html) e
[Docker pause](https://docs.docker.com/reference/cli/docker/container/pause/).

Referências T07: [Express 5](https://expressjs.com/en/5x/api/),
[erros assíncronos Express](https://expressjs.com/en/guide/error-handling/) e
[parâmetros pg](https://node-postgres.com/features/queries).

Referências consultadas para T06: [conexões pg](https://node-postgres.com/features/connecting),
[parâmetros SQL](https://node-postgres.com/features/queries),
[TLS pg](https://node-postgres.com/features/ssl) e
[constraints PostgreSQL 16](https://www.postgresql.org/docs/16/ddl-constraints.html).

## Runtime, configuração e ambiente local

D07: Node 24 LTS e Express 5, cliente `pg`, testes de integração com `node:test`
e PostgreSQL real. Node 24.21.0 está instalado; a [lista oficial de releases](https://nodejs.org/en/about/previous-releases)
identifica a linha 24 como LTS. T06 instalou Express 5.2.1 e pg 8.23.0 com versões
exatas e lockfile; `npm ci` e a integração passaram. T10 fixou a base oficial
Node 24.21.0 bookworm-slim pelo digest
`sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6`,
resolvido por docker buildx imagetools inspect; runtime validado em linux/amd64. O teste local usou PostgreSQL 16.15, imagem oficial fixa
por digest em `app/test/postgres-image.txt`; consultar separadamente a engine
minor disponível no RDS de us-east-1 antes do plano. Não presumir disponibilidade
no RDS somente porque uma versão Docker foi validada.

| Configuração futura | Local | EC2/RDS |
|---|---|---|
| `PORT` | .env Compose controla publicação loopback no host (3000 padrão); dentro do container permanece 3000. API nativa usa PORT de escuta. | 3000; processo escuta `0.0.0.0` no container. |
| `PGHOST`, `PGPORT` | Serviço `db`, 5432 no Compose; host/porta próprios ao testar app nativa. | Endpoint RDS, 5432. |
| `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Compose deriva de POSTGRES_DB/USER/PASSWORD do .env ignorado; exemplo contém somente placeholders. API nativa usa PG* do ambiente. | Arquivo protegido na EC2; valores nunca no repositório/user-data. |
| `PGSSL` | `false`, no bridge local. | `true`; validar certificado e hostname do RDS. |
| `PGSSLROOTCERT` | Não necessário. | Caminho do bundle CA oficial montado somente para leitura. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Serviço PostgreSQL recebe os mesmos valores de conexão do app. | Não iniciar serviço PostgreSQL na EC2. |

D08: container API não-root, cópia somente dos arquivos necessários, `npm ci`
com lockfile e dependências de produção no runtime; multi-stage adotado para
separar instalação de dependências e execução da API. `.dockerignore` exclui segredos, node_modules,
Git, evidências e testes desnecessários ao runtime. Nada sensível em build args.

T10 implementou dois estágios dependencies/runtime na mesma base fixada. Primeiro
npm ci --omit=dev --ignore-scripts --no-audit --no-fund; depois COPY seletivo com
chown node:node, USER node e CMD exec node src/server.js. O entrypoint da base
executou Node como PID 1/UID 1000, verificado por /proc e id; SIGTERM encerrou/0.
Não há build args nem senhas na imagem. As recomendações oficiais fundamentam
[estágios, USER e digest](https://docs.docker.com/build/building/best-practices/) e
[contexto/.dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files).

.dockerignore nega o contexto geral, reabre manifests/src/sql e exclui segredos/
artefatos também nesses diretórios. Auditoria real exportou COPY . via FROM
scratch e confirmou 10 arquivos, sem node_modules/testes ou marcadores .env/PEM.
Esses marcadores não continham credenciais e foram removidos após a conferência.
run-docker.js cria rede bridge e PostgreSQL separados com UUID/labels conferidos,
senha em memória e dados tmpfs; somente a API publica loopback. Migração pela
mesma imagem, verify-api.py, health e SQL/DATE passaram; zero linhas e recursos
temporários ao final. Imagem local preservada. Esse teste não implementa Compose
nem comprova volume persistente. O aviso Docker --time da primeira execução foi
corrigido para --timeout no novo runner; segunda execução passou sem o aviso.

Compose: serviços `api` e `db`, rede bridge `reservas-net`, volume nomeado
`reservas-data` em `/var/lib/postgresql/data`. Publicar API apenas em
`127.0.0.1:3000:3000`; banco sem porta publicada no Compose final. `pg_isready`
no healthcheck do banco; `depends_on: db: condition: service_healthy` para API;
healthcheck HTTP da API chama `/health` usando Node, sem depender de curl na imagem.
O [controle de inicialização do Compose](https://docs.docker.com/compose/how-tos/startup-order/)
explica a condição de saúde. A aplicação também trata reconexão/falha do banco;
`depends_on` sozinho não resolve queda posterior. Documentar setup `.env` e
comando único `docker compose up --build --wait`.

T11 implementou docker-compose.yml/.env.example e runner test:compose. Base db
é o mesmo digest PostgreSQL 16.15 dos testes; API usa build app/USER node.
Healthcheck db usa TCP -h 127.0.0.1, evitando tratar o servidor temporário de
bootstrap Unix como pronto; API verifica HTTP 200/status/database via Node.
Intervalos 3s, timeout 3s, start_period 5s/start_interval 1s; Compose >=2.20.2,
validado v5.5.1. .env.example define PORT/POSTGRES_DB/USER/PASSWORD, senha
placeholder. PG* da API são derivados/constantes, sem segunda senha para divergir.
[Interpolação](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/)
usou obrigatórios :?; senha ausente deu exit 1 e config válido exit 0, sem dump.
[Healthchecks](https://docs.docker.com/reference/compose-file/services/#healthcheck)
e [entrypoint PostgreSQL](https://hub.docker.com/_/postgres) fundamentam readiness
e bootstrap só em volume vazio. Volume/rede recebem prefixo do projeto para
isolar stacks. down mantém volume; [referência CLI](https://docs.docker.com/reference/cli/docker/compose/down/).

Teste real: criou api/db parados, up --build --wait e ps healthy; db health exit 0
terminou às 22:41:56.797 -03:00 e API iniciou 22:41:57.175 -03:00. Bridge com ambos,
banco sem publicação e API loopback, volume/mount read-only e UID 1000 conferidos.
CRUD/SQL/DD-MM-YYYY/DATE passaram. Projeto UUID e env 0600 /tmp temporários;
cleanup sem down -v e remoção separada do volume novo, só após conferir labels;
zero linhas/recursos. Não há teste de recriação/persistência nessa tarefa.

T11 montou o SQL inicial read-only em `docker-entrypoint-initdb.d` para volume novo.
Volumes existentes não recebem novamente esses scripts: aplicar migração
explicitamente quando necessário. Testes locais antes do Compose usarão uma
instância PostgreSQL de teste com porta apenas no loopback e banco exclusivo.
Persistência: criar linha, conferir SQL, recriar API/banco preservando o volume,
buscar novamente e limpar somente o registro criado pelo teste. Nunca `down -v`
para testar persistência. Testes de erro exercitam ausentes, vazios, tipos errados,
datas impossíveis, status desconhecido, IDs inválidos e 404.

### T12 — decisão e implementação da verificação

verify-persistence.py usa duas fases para manter verificação e recriação local
separadas: prepare grava linha via HTTP, confere SQL e salva checkpoint 0600
exclusivo; check exige IDs diferentes de api/db, mesmo nome/data de criação do
volume e linha idêntica por GET/SQL. Reutiliza Verifier de verify-api.py, stdlib
Python e psql do db. Inspects limitados a IDs/labels/state/mounts/CreatedAt;
nenhum ambiente/senha/config expandido é publicado. ID inteiro e marcador UUID
validados limitam as consultas SQL; cleanup HTTP confere marcador antes de DELETE.
Check limpa a linha própria em finally mesmo na divergência, confirma SQL count
0 e remove checkpoint. Cleanup separado permite cancelar prepare; não declara
persistência. Falha de limpeza mantém checkpoint e informa IDs/marcador; POST
sem resposta exige conferência. Nunca faz up/down nem remoção de volumes.

run-persistence.py/test:persistence cria fixture local UUID e env 0600 fora do
repo. Mantém sentinela para comprovar que limpezas do verificador não excluem
outro registro. Recria api/db via up --no-build --force-recreate --wait, retendo
volume; IDs/CreatedAt e HTTP/SQL são reais. Negativo altera somente status da
linha própria por SQL e deve retornar 1; outro negativo sem recriação também
retorna 1. Proteção contra sobrescrita e cancelamento são verificados. Ao final,
remove sentinela, exige total SQL 0 e labels próprias antes de down sem -v e
remoção separada do volume novo vazio. Em falha de cleanup, preserva fixture/env
para recuperação. Não usa recurso AWS nem dados/volumes de outros projetos.

Fontes primárias consultadas em 28/09/2026:
[up/force-recreate preserva volumes montados](https://docs.docker.com/reference/cli/docker/compose/up/),
[down sem --volumes](https://docs.docker.com/reference/cli/docker/compose/down/),
[ciclo de vida de volumes](https://docs.docker.com/engine/storage/volumes/).
A primeira execução falhou por Path.open(opener=...), corrigida para open da
stdlib; resultados de cada execução em compose-persistencia.txt/diário.
R10 local comprovado; não estender esse aceite a RDS/execução AWS.

## Rede AWS e contratos dos módulos

D09: uma VPC própria `10.20.0.0/16`, DNS habilitado, duas AZs disponíveis em
`us-east-1`; públicas `10.20.1.0/24` e `10.20.2.0/24`, privadas
`10.20.11.0/24` e `10.20.12.0/24`. Selecionar AZs efetivamente ofertadas na
conta. Públicas com Internet Gateway e rota `0.0.0.0/0`; privadas sem rota
para Internet Gateway. RDS usa duas privadas e tráfego local da VPC; não requer
NAT para o CRUD. Uma EC2 em uma pública basta; não propor ALB/NAT Gateway.

| Módulo | Entradas principais | Saídas / integração |
|---|---|---|
| `vpc` | Nome, CIDR, AZs, CIDRs de subnets, tags. | `vpc_id`, `public_subnet_ids`, `private_subnet_ids`; alimenta SG, EC2 e RDS. |
| `security-group` | `vpc_id`, `ssh_cidr`, `api_allowed_cidrs`, tags. | `ec2_sg_id`, `rds_sg_id`; EC2 22/3000 restritas; RDS 5432 com SG EC2 como única origem. |
| `ec2` | Primeira pública, SG EC2, AMI, `t2.micro`, key pair existente, user-data sem segredos, profile existente opcional, tags. | ID e IP público; URL API composta no root. |
| `rds` | Privadas, SG RDS, engine version, `db.t3.micro`, nome do banco, credenciais sensíveis, tags. | Identifier, hostname e porta; alimenta configuração posterior do deploy na EC2. |

D10: SG EC2 restringe SSH ao `<SSH_CIDR>` confirmado (preferir IP atual /32)
e 3000 a `<API_ALLOWED_CIDRS>` necessários para aluno/professor. Não escolher
`0.0.0.0/0` automaticamente; consultar acesso da avaliação antes do plan.
Saída EC2 permite DNS VPC, HTTP/HTTPS para instalação/artefatos/serviços e
5432 ao SG RDS; revisar regras efetivas. RDS não ganha regra 5432 por CIDR.
RDS privado e encriptado, subnet group privado, armazenamento inicial 20 GiB
e Single-AZ propostos para o Lab; isso não remove a exigência de subnets em
duas AZs. Disco EC2 encriptado, IMDSv2 e key pair existente. Tags
`Project=prova-primeiro-bimestre-devops`, `Environment=learner-lab`, `Owner=6325231`
nos recursos que suportam tags; recursos sem tagging ficam documentados.

RDS security group e egress EC2 que o referencia precisam de ordem de criação
sem ciclo: criar SGs primeiro e regras separadas; não referenciar mutuamente
os SGs em regras inline. Tags em subnet group, tabela e bucket também contam.

### T13 — preflight observado e decisões

Consultas AWS read-only em 28/09/2026: default/us-east-1/assumed-role voclabs,
conta completa mantida privada; aluno confirmou Learner Lab da prova e painel
US$0 usados de US$50. Orçamento é relato do painel, não teste automatizado.
AZs us-east-1a/use1-az4 e us-east-1b/use1-az6 available/t2.micro ofertada.
RDS PostgreSQL16.15 disponível com db.t3.micro/gp3/VPC/mínimo20GiB/encriptação e
ambas AZs. Seleção Single-AZ encriptada/privada proposta; funcionamento e SGs
serão conferidos na AWS depois de apply autorizado. Única key pair no retorno
vockey/RSA; LabInstanceProfile já contém LabRole, sem criar IAM. Posse da chave
privada e SSH não testados; são pré-condições futuras do deploy.

IP IPv4 HTTPS observado, SSH e API limitados a esse /32 conforme resposta do
aluno. Não adicionar acesso público geral ou CIDR de professor não informado.
Conta/IP/opções em infra/preflight.local.json 0600, ignorado antes de criar,
sem credenciais/chave privada; não é tfvars/state/plan nem aprovação de apply.
Reconsultar token/identidade/IP/opções antes dos planos. T13 não criou recurso.

Primeiro init provider6.65.0 falhou apesar de Registry HTTPS listar a versão;
segunda tentativa direct isolada passou na mesma versão, causa inicial não
comprovada. Validate passou com sonda contendo dynamodb_table e tabela LockID S.
Leitura de schema exigiu backend S3 inicializado; corrigida só sonda em /tmp para
usar root sem declaração remota, mantendo S3 real pendente até bootstrap.
Schemas DynamoDB/RDS e lockfile passaram; caches temporários próprios removidos.
Fonte oficial Terraform1.16.2 mantém dynamodb_table String/depreciado e seu uso;
locking ativo será conferido T21, não inferido desses testes.

Evidências reais em aws-preflight.txt e diário, incluindo tentativas/erros,
redigindo conta/IP. Fontes primárias:
[release provider6.65.0](https://github.com/hashicorp/terraform-provider-aws/releases/tag/v6.65.0),
[catálogo Registry](https://registry.terraform.io/v1/providers/hashicorp/aws/versions),
[código backend Terraform1.16.2](https://github.com/hashicorp/terraform/blob/v1.16.2/internal/backend/remote-state/s3/backend.go),
[AZs](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-availability-zones.html),
[opções RDS](https://docs.aws.amazon.com/cli/latest/reference/rds/describe-orderable-db-instance-options.html),
[identidade STS](https://docs.aws.amazon.com/cli/latest/reference/sts/get-caller-identity.html),
[key pairs](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-key-pairs.html),
[instance profile existente](https://docs.aws.amazon.com/cli/latest/reference/iam/get-instance-profile.html).

## Terraform, bootstrap e state

D11: T13 validou Terraform `= 1.16.2` e provider hashicorp/aws `= 6.65.0` em
sonda isolada, init/validate/schema reais sem credenciais/backend remoto. Fixar
essas versões e versionar `.terraform.lock.hcl` em ambos os roots quando criados.
Não atualizar sem necessidade/revisão de compatibilidade. A sonda tem lockfile
real em /tmp/devops-t13-provider.lock.hcl; a configuração final gera seu próprio.
`infra/backend` usa state local ignorado e protegido, implementado em T14;
o root principal `infra` futuro terá backend S3 parcial em providers,
configurado por `backend.local.hcl` ignorado, somente após conferência T16.

S3 exclusivo com nome globalmente único, versionamento, encriptação SSE-S3
AES256 e bloqueio de acesso público. DynamoDB on-demand, chave de partição
`LockID` tipo String. Backend principal configura `bucket`, `key` próprio do
projeto, `region=us-east-1`, `encrypt=true`, `dynamodb_table`. Nenhuma credencial
em HCL/backend config. Não criar IAM ou KMS próprios para viabilizar acesso.

A [documentação S3 do Terraform 1.16](https://developer.hashicorp.com/terraform/language/backend/s3)
ainda documenta locking DynamoDB, mas informa sua depreciação e remoção futura.
Preservar DynamoDB conforme R20; não habilitar apenas `use_lockfile`. Verificar
init/validate/backend efetivo com a versão fixada antes do uso na AWS. Uma
atualização exige revisar essa compatibilidade, não simplesmente ignorar o aviso.

Ordem reproduzível, com autorizações separadas:

1. Confirmar ferramentas, credenciais/conta/região/Lab, versões, nomes e variáveis.
2. `infra/backend`: fmt, init, validate, plan; apresentar plano; após autorização,
   aplicar. Conferir bucket/versionamento/encriptação/bloqueio público e tabela.
3. Só então inicializar `infra` com backend real; fmt, validate e plan completo.
   Revisar IAM ausente, tipos, tags, SGs, RDS privado/encriptado e outputs.
4. Após autorização desse plano, provisionar; coletar estado efetivo AWS,
   provisionamento não basta para aceitar CRUD.

Testar locking sem apply: durante `terraform plan -lock-timeout=60s`, observar
o lock ativo na tabela com consulta somente leitura. Um segundo plan durante
essa janela deve esperar ou falhar por lock, não executar sem ele; tratar
janela curta inconclusiva como teste pendente e repetir de forma controlada.
Não inserir/remover itens manualmente nem simular contenção com state falso.

Credenciais temporárias permanecem na configuração AWS local fora do projeto,
com session token. Senha RDS via variável sensível local ignorada, sem outputs.
Mesmo variáveis `sensitive` podem aparecer no state/plano binário: ambos exigem
proteção, e nunca são evidências públicas. Documentar qualquer erro do Lab e
adaptar somente com verificação oficial e sem reduzir exigências da prova.

## Deploy reproduzível da EC2 e inicialização do RDS

D12: EC2 executa somente o container da API. User-data instala Docker e prepara
diretórios/serviço sem senha, token GitHub ou credenciais AWS. Escolher AMI x86_64
compatível com t2.micro e confirmar boot/instalação na execução real.

Proposta de deploy por SSH/SCP a partir da máquina do aluno, sem depender de
registry privado ou nova role:

1. Build da imagem x86_64 a partir do commit escolhido e lockfile. Salvar imagem
   em tar fora do Git; calcular checksum. Registrar commit/tag/checksum.
2. SCP de imagem, SQL e bundle CA público oficial; provisionar arquivo de ambiente
   por transferência protegida sem conteúdo em logs. Secret local e remoto com
   modo 0600 fora do repo; não colocar segredo em argumento de linha de comando.
3. Carregar a mesma imagem na EC2; executar comando de migração nela usando
   endpoint RDS privado. Iniciar API com Docker/systemd e política de restart.
4. Executar seis rotas pelo IP permitido. SQL pela EC2 confirma a linha em RDS,
   hostname configurado e TLS ativo; reiniciar container API e repetir leitura.
   Remover apenas registros próprios de teste ao concluir.
5. Conferir serviço iniciado após reboot e logs sem segredos; README registra
   sequência e comandos para reproduzir. Script de deploy será separado dos
   scripts de verificação, que nunca fazem provisionamento/destruição.

O cliente `pg` usará TLS com CA RDS e verificação habilitada na nuvem; não usar
`rejectUnauthorized=false`. A [documentação SSL do RDS PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html)
orienta a validação do certificado. CA é pública, chave privada SSH não.

## Evidências, histórico e relatório

D13: cada evidência textual registra data/hora reais, ambiente, tarefa/requisito,
comando sanitizado, resultado e exit code. Capturar stdout/stderr reais, revisar
e só então versionar. Não criar arquivos vazios com aparência de teste aprovado.
Evidências de falha permanecem identificadas como falha; validar novamente após
correção, mantendo explicação no diário. Imagens/screenshots são opcionais.

Python 3 usa stdlib para HTTP. Em T09, `scripts/verify-api.py` foi executado com
Python 3.12.3: urllib.request/HTTPError tratam respostas HTTP sem pip,
argparse/json cuidam de CLI e corpo. URL não admite credenciais/query/fragmento;
redirecionamentos são recusados e há timeout por requisição. Referências:
[urllib.request](https://docs.python.org/3.12/library/urllib.request.html) e
[urllib.error](https://docs.python.org/3.12/library/urllib.error.html).
Script cria marcador UUID, rastreia IDs devolvidos com esse marcador e limpa em
finally após confirmar propriedade por GET. Exit 0 só após verificar/limpar;
falha retorna 1 e CLI inválida 2. Em perda de resposta/limpeza, informa marcador
ou IDs pendentes, sem anunciar CRUD aprovado nem excluir dados gerais.
Teste real preservou uma sentinela, induziu CHECK temporário/PUT 500 e conferiu
exit 1 com limpeza por SQL. O teste persistence.test.js encerrou server.js,
iniciou outro PID na mesma porta e conferiu ID/DATE/campos por SQL durante a parada
e GET após reinício; pg_postmaster_start_time permaneceu igual. Isso comprova
persistência fora do processo nativo, não persistência de volume Compose/RDS.
`verify-aws.py` futuro também depende de AWS CLI e SSH e recebe identifiers/URL
sem senhas. Testes API usam PostgreSQL isolado; scripts criam IDs próprios e não
apagam dados gerais. Verificação de
segurança compara atributos AWS reais, não só a presença de strings em arquivos.
`verify-delivery.py` checa estrutura e metadados, mas não substitui revisão humana,
data presencial ou experiência do aluno. Todos retornam código não zero na falha.

Planejar ao menos seis commits sem fabricar histórico: documentação inicial,
API/schema/testes, Docker, Compose, backend, módulos, deploy e evidências/relatório
são marcos possíveis. Depois do primeiro commit, feature branch preservada e
merge com `--no-ff` documentam o fluxo; merge message também usa Conventional
Commits. Não marcar commit futuro como realizado.

Relatório: quatro respostas com pelo menos dez linhas de conteúdo cada, IA
identificada no início e narrativa baseada no diário/experiência do aluno.
Jornada relaciona 01 Git/Docker, 02 Compose/IA, 03 Terraform/IAM, 04 VPC/EC2,
05 RDS/state, 06 módulos, 07 decomposição/harness/specs. Confirmar o relato
com o aluno; não inventar que ele usou Kiro ou encontrou erros que não ocorreram.

## Teardown e submissão

D14: após coleta e revisão das evidências, preparar `terraform plan -destroy`
em `infra`, mostrar recursos/dados afetados e obter autorização. Não usar
auto-approve. Destruir principal enquanto S3/DynamoDB continuam operacionais;
confirmar state sem recursos e ausência de EC2/RDS/VPC/SG do projeto na AWS.

Antes de apagar RDS, definir explicitamente descarte de dados de teste e política
de snapshot final. Não criar snapshot retido silenciosamente. Se houver retenção
autorizada, registrá-la e seus custos; se houver limpeza integral autorizada,
conferir também snapshots/volumes/interfaces remanescentes pertencentes ao projeto.

Backend: manter uma cópia protegida do state principal final e do state bootstrap
fora do Git enquanto necessário; apresentar plano de limpeza separado e obter
autorização para as versões de state e o backend. Bucket versionado só fica vazio
após remover versões antigas e delete markers, não apenas objetos atuais. Sem
`force_destroy` automático para eliminar revisão. Limpar somente bucket/chave e
tabela próprios, após principal destruído e sem operações de lock em curso;
então destruir `infra/backend` usando seu state local. Confirmar resultado real.
Não apagar state local necessário para concluir ou recuperar uma limpeza falha.

D15: projeto/evidências ficam neste repositório; `entrega.md` é preparado apenas
em checkout/worktree isolado do fork da disciplina. Confirmar RA/data/identidade,
links públicos, seis commits, merge, quatro respostas e destroy antes do PR.
Diff deve conter exclusivamente `entregas/provaPrimeiroBi/6325231/entrega.md`.
Abrir uma única vez, presencialmente no dia confirmado; congelar o head do PR
sem commits posteriores. Esta etapa não publica nada.

## Decisões revisadas e revisões futuras

1. D02: data civil `DD-MM-YYYY`, conforme revisão do aluno em 28/09/2026; sem
   horário/fuso e sem exigir data futura; PostgreSQL continua usando DATE.
2. D03/D04: cliente 1–120 caracteres, status `pendente/confirmada/cancelada`,
   todos obrigatórios, PUT completo e exclusão física com 204.
3. D05: saúde depende do banco; banco indisponível causa 503.
4. D07–D12: Node 24, PostgreSQL 16 a confirmar no Lab, imagem fixada, deploy por
   SSH e RDS com TLS; arquitetura sem NAT/ALB e API restrita por CIDR.
5. D14/D15: AWS somente após plano/autorização; destruição com autorização
   específica e backend por último; entrega presencial única no dia correto.

Identidade e entrega foram informadas em 28/09/2026: Andreyh Rodrigues de Souza,
RA 6325231, entrega 01/10/2026. Os acessos AWS continuam pendentes até a etapa
correspondente. Mudanças futuras atualizam requisitos, design e tarefas antes de
código. A revisão das specs não autoriza provisionar/destruir nem abrir o PR.

## T14 — bootstrap implementado e plano revisado

infra/backend tem versions/providers/variables/main/outputs, tfvars.example
sem dados reais e .terraform.lock.hcl gerado neste root. Terraform=1.16.2 e
AWS=6.65.0 permanecem exatos. backend local path terraform.tfstate não usa S3;
state de recursos ainda ausente antes de apply. Provider allowed_account_ids
confere conta privada STS, região validada us-east-1; default_tags no bucket/tabela.

Cinco recursos: aws_s3_bucket.state (force_destroy=false), versioning Enabled,
server_side_encryption AES256, public_access_block quatro flags true e tabela
locks PAY_PER_REQUEST, hash_key LockID/String. Três configurações dependem do
bucket.id; outputs propõem bucket/key/region/encrypt/dynamodb_table do principal,
sem segredos. Sem IAM/KMS novos, credenciais em HCL, módulos principais ou
backend remoto implementado antes do bootstrap. Nomes reais próprios com sufixo
aleatório, sem conta/IP; unicidade global não comprovada antes da criação.

fmt/check/init direct/validate passaram 0. Init comum falhou 1 inicialmente e
com lockfile readonly; Registry listava 6.65.0. CLI config direct temporária
0600 passou nas duas tentativas, provider assinado; causa da diferença não
comprovada, sem config global/upgrade. Plano real retornou 2 esperado com
-detailed-exitcode: cinco create, zero update/delete. JSON conferido em memória
validou todos os atributos/vínculos e conta privada, sem publicar valores
sensíveis. Negativo de nome reservado -an retornou 1; plano válido preservado.
S3 filtrado []/0 e tabela ResourceNotFoundException/254 antes/depois, STS mesma
conta; nenhum recurso criado. Dados/plan/cache locais ignorados/0600,
lockfile não sensível versionável. Evidências backend-validate/backend-plan.

T14 verificada não significa R20 completo: S3/DynamoDB efetivos são T16, state
remoto/locking ativo T21. T15 revisa plano/custo e obtém autorização específica.
Nenhuma falha SCP/ObjectLock atual observada ou ajuste por CLI de criação.

Fontes primárias consultadas na versão fixada:
[provider AWS6.65.0](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/index.html.markdown),
[bucket](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/s3_bucket.html.markdown),
[versionamento](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/s3_bucket_versioning.html.markdown),
[encriptação](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/s3_bucket_server_side_encryption_configuration.html.markdown),
[DynamoDB](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/dynamodb_table.html.markdown),
[backend local](https://developer.hashicorp.com/terraform/language/backend/local),
[plan/exit codes](https://developer.hashicorp.com/terraform/cli/commands/plan),
[show JSON sensível](https://developer.hashicorp.com/terraform/cli/commands/show),
[nomes S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).
