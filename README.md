# API de Reservas — Prova do Primeiro Bimestre de DevOps

**Aluno:** Andreyh Rodrigues de Souza

**RA:** 6325231

**Data de entrega:** 01/10/2026

Projeto individual de uma API Node.js/Express para criar, listar, consultar,
atualizar e excluir reservas, persistindo em PostgreSQL. A entrega final terá
Docker/Compose local e EC2/RDS no AWS Academy Learner Lab, usando Terraform
modularizado com state S3 e locking DynamoDB, evidências reais e relatório.

A URL configurada no origin local é
`https://github.com/Andreyh117/prova-primeiro-bimestre-devops.git`.
Existência, acesso público e identidade do proprietário do remote ainda não
foram verificados. Nome completo, RA e data de entrega acima foram informados
pelo aluno em 28/09/2026.

## Estado real

Em 28/09/2026, T01–T14 foram verificadas. O commit inicial `21cb5f0` está em
`main` e o desenvolvimento segue em `feat/api-reservas`. CRUD completo, /health
e o script de verificação estão implementados. A suíte passou 51 testes com
PostgreSQL 16.15 real: 27 HTTP nativos, 3 de indisponibilidade, 3 de script/restart,
15 de banco e 3 de configuração. O script passou com exit 0; erro SQL controlado
retornou exit 1, limpando apenas a reserva própria e preservando outra existente.
A reserva sobreviveu ao encerramento da API e foi consultada por SQL durante a
parada e por GET em outro processo na mesma porta. APIs encerradas e zero
containers de teste ao final. Datas JSON mantidas em DD-MM-YYYY.

Express 5.2.1 e pg 8.23.0 estão fixados no package.json/lockfile. A imagem oficial
PostgreSQL foi fixada por digest em `app/test/postgres-image.txt`. T09 foi o sexto
commit real (`93d313c`); merge preservando a feature continua em T32.
T10 construiu a imagem da API com Node 24.21.0 fixado por digest, USER node/UID
1000 e dependências instaladas via lockfile. Teste Docker passou duas vezes, com
contexto filtrado, health/CRUD/SQL reais e encerramento/limpeza confirmados.
T11 validou Compose v5.5.1, API/db saudáveis, rede bridge, volume nomeado,
bootstrap SQL, dependência de saúde e CRUD/SQL reais. .env.example está disponível;
config sem senha retornou 1 esperado. Fixture/ambiente de teste foram limpos.
T10 foi o sétimo commit real (49dbd5e); merge continua em T32. Infraestrutura AWS
e relatório permanecem pendentes.
T12 comprovou a reserva após recriar api/db, com novos IDs e mesmo volume;
HTTP/SQL preservaram 01-10-2026/DATE 2026-10-01. Verificador retornou 0 no caso
válido e 1 nos negativos, limpando apenas seus dados e mantendo a sentinela.
A primeira execução falhou antes do Docker por uso incorreto de Path.open;
foi corrigida e as saídas anteriores foram preservadas.
T13 confirmou identidade/região e opções AWS por consultas de leitura. O aluno
confirmou Learner Lab, US$0 usados de US$50 e acesso API só do seu IP /32.
Terraform1.16.2/providerAWS6.65.0 passaram init/validate/schema em sonda isolada;
backend S3 e recursos do projeto ainda não existem. Falhas/correções registradas.
T14 implementou o bootstrap em infra/backend com state local separado, versões
fixas e lockfile real. fmt/init/validate passaram; plano revisado propõe cinco
criações, zero alterações/exclusões em us-east-1. Bucket/tabela seguem ausentes
nas consultas após o plano. Falhas de init comum foram preservadas; instalação
direct temporária passou na mesma versão, causa da diferença não comprovada.
Próxima tarefa: T15, revisar recursos/custo e autorizar especificamente o bootstrap;
apply/conferência efetiva ficam em T16. Locking principal ainda pendente T21.

## Contrato aprovado para implementação

Reserva: `id` gerado pelo PostgreSQL, `cliente`, `data` e `status`.
`cliente`, `data` e `status` são obrigatórios em POST e PUT; PUT substitui todos
os campos editáveis. Status aceitos: `pendente`, `confirmada`, `cancelada`.

POST e PUT recebem `data` como **`DD-MM-YYYY`**, com dia/mês de dois dígitos
e ano de quatro dígitos, sem horário. POST, PUT e GET devolvem esse mesmo formato.
O banco mantém `DATE`; a aplicação converte por componentes para ISO interno e
formata explicitamente por SQL. Datas válidas/bissextas foram confirmadas;
datas impossíveis, ISO externo, tipos incorretos e espaços foram rejeitados.
Cliente é texto Unicode válido, sem NUL, de 1 a 120 caracteres após trim.
O corpo deve conter exatamente cliente, data e status; PUT parcial retorna 400.

```json
{"cliente":"Cliente de teste","data":"15-10-2026","status":"pendente"}
```

Rotas disponíveis: POST/GET `/reservas`, GET/PUT/DELETE `/reservas/:id` e GET
`/health`. POST retorna 201/Location; GET retorna 200 (lista ordenada por ID);
PUT completo retorna 200 mantendo ID; DELETE retorna 204 sem corpo. ID ausente
retorna 404. Entrada inválida retorna 400, corpo acima de 16 KiB retorna 413 e
Content-Type inadequado retorna 415, com erro JSON. Falha de conexão retorna
503 BANCO_INDISPONIVEL; erro inesperado retorna 500 genérico. /health consulta
SELECT 1 com prazo de 2s e retorna 200 ou 503, somente com status/database.
Contrato completo em [specs/design.md](specs/design.md).

## Documentação e acompanhamento

- [AGENTS.md](AGENTS.md): regras de execução e comandos de validação por etapa.
- [Requisitos](specs/requirements.md): critérios do professor e do aluno, com matriz de aceite.
- [Design](specs/design.md): decisões revisadas, contratos, arquitetura e limpeza.
- [Tarefas](specs/tasks.md): dependências, estado real e próximo passo.
- [Diário de IA](docs/diario-ia.md): prompts, decisões, correções e resultados reais.
- [Evidência T04](evidencias/segredos-checklist.txt): verificação local das proteções Git/documentação.
- [Evidência T05](evidencias/git-workflow-inicial.txt): commit inicial e criação da feature branch, com saídas reais.
- [Dependências T06](evidencias/t06-dependencias.txt): instalação, npm ci e versões reais.
- [PostgreSQL T06](evidencias/t06-postgres-local.txt): migração e 18 testes com banco real.
- [Falha controlada T06](evidencias/t06-falha-controlada.txt): código não zero e limpeza confirmada.
- [HTTP e PostgreSQL local](evidencias/api-local.txt): T07 com 35 testes, T08 com 48, T09 com 51 e trecho HTTP/SQL do Compose T11, sem apagar histórico.
- [Persistência T09](evidencias/postgres-local.txt): script com exit 0/1, sentinela preservada e SQL/GET antes, durante e após reiniciar a API nativa.
- [Saúde T08](evidencias/health-local.txt): pause/unpause/stop reais do banco exclusivo, respostas HTTP e limpeza.
- [Execução T07](evidencias/t07-execucao.txt): falhas esperadas de npm start e limpeza.
- [Build Docker T10](evidencias/docker-build.txt): duas execuções reais, contexto exportado, digest, instalação e UID 1000.
- [Execução Docker T10](evidencias/docker-run.txt): PID 1 não-root, PostgreSQL real, health/CRUD/SQL, SIGTERM e limpeza.
- [Compose ps T11](evidencias/compose-ps.txt): config, caso negativo sem senha, build/subida e serviços healthy.
- [Compose rede/saúde T11](evidencias/compose-rede-saude.txt): ordem real, rede/volume/portas, CRUD/SQL, defaults do exemplo e limpeza.
- [Persistência Compose T12](evidencias/compose-persistencia.txt): falha inicial/correção, HTTP/SQL antes/depois, IDs/volume, negativos, checkpoint e limpeza reais.
- [Preflight AWS T13](evidencias/aws-preflight.txt): consultas reais, versões/schema isolados, falhas/correções e decisões humanas; sem criação de recursos.
- [Validação bootstrap T14](evidencias/backend-validate.txt): fmt/init/validate reais, falhas de instalação/correção e rejeição de nome S3 reservado.
- [Plano bootstrap T14](evidencias/backend-plan.txt): cinco criações propostas, revisão do JSON sanitizada e consultas antes/depois sem recursos criados.
- [Auditoria Git](evidencias/git-auditoria.txt): snapshot anterior a T08 em dbcd6a1, com 4 commits reais/convencionais, feature comprovada e merge pendente; próximos marcos em specs/tasks.md.

## Executar os testes disponíveis

Dependências: Node 24, npm, Python 3 (validado 3.12.3) e Docker local com daemon
acessível. Python usa apenas stdlib; não requer pip. Execute na raiz:

```bash
npm --prefix app ci --ignore-scripts --no-fund
npm --prefix app test
```

O runner cria seu container PostgreSQL, publica porta dinâmica em 127.0.0.1,
gera senha em memória, aplica o schema e roda `node:test`. A suíte HTTP inicia
a API nativa em porta livre e verifica requisições/SQL; limpa somente seus IDs
e encerra a API. T09 executa o script Python contra esse servidor nativo, induz
um CHECK temporário para testar exit 1/limpeza e reinicia somente a API,
conferindo os dados por outra conexão SQL. A última suíte confere UUID/labels/porta do banco e o pausa,
retoma e encerra para verificar 503 real. Ao terminar, o runner confirma remoção
do container/dados tmpfs; se ainda estiver pausado na falha, retoma antes da limpeza.
A primeira execução pode baixar a imagem fixada por digest. Não é necessário
criar .env ou informar senha para essa suíte. Falhas resultam em exit code não zero.

O schema está em [app/sql/001-reservas.sql](app/sql/001-reservas.sql), o pool em
[app/src/db.js](app/src/db.js), e os testes reais em
[app/test/database.test.js](app/test/database.test.js) e
[app/test/api.test.js](app/test/api.test.js); indisponibilidade real em
[app/test/z-unavailable.test.js](app/test/z-unavailable.test.js); script/restart em
[app/test/persistence.test.js](app/test/persistence.test.js), que usa
[app/test/helpers/native-api.js](app/test/helpers/native-api.js) para processos reais.
Rotas em [app/src/app.js](app/src/app.js),
validação em [app/src/validation.js](app/src/validation.js) e inicialização em
[app/src/server.js](app/src/server.js). O SQL inicial pode ser reaplicado sem
apagar linhas; mudanças de estrutura exigirão novas migrações.

Para aplicar o schema em um banco já configurado para a tarefa, com as variáveis
PG* disponíveis no ambiente, execute `npm --prefix app run db:migrate`.
PGHOST, PGDATABASE, PGUSER, PGPASSWORD e PGSSL são obrigatórios; PGPORT assume
5432 se omitido. `PGSSL=true` exige PGSSLROOTCERT com a CA. A configuração TLS
foi testada; handshake e conexão com RDS só serão validados na etapa AWS.

Para executar a API nativa em banco próprio já configurado/migrado:

```bash
npm --prefix app start
```

O comando usa PG* do ambiente e PORT (padrão 3000), escutando em 0.0.0.0.
Não carrega .env automaticamente. Com configuração incompleta, encerra com
código 1 e mensagem sem credenciais. Com API em execução, pode conferir a lista:

```bash
curl --fail --silent --show-error http://127.0.0.1:3000/reservas
curl --fail --silent --show-error http://127.0.0.1:3000/health
```

Para verificar o CRUD de uma API já iniciada e com banco configurado:

```bash
python3 scripts/verify-api.py --base-url http://127.0.0.1:3000
```

[verify-api.py](scripts/verify-api.py) usa urllib/json/argparse da biblioteca padrão.
Cria uma reserva com marcador UUID e confere POST, lista, GET, PUT completo,
DELETE, campos ausentes, data impossível, PUT parcial e 404. O timeout padrão
por requisição é 5s; pode definir `--timeout 10`. Aceita HTTP/HTTPS sem credenciais
na URL, query ou fragmento; não segue redirecionamentos. Não requer Docker para
verificar uma API existente e não inicia serviços nem modifica infraestrutura.

A limpeza roda em finally, consulta ID e marcador antes de excluir e confirma
404. A execução retorna 0 somente com verificação e limpeza concluídas; falha
retorna 1, argumentos inválidos retornam 2. Se a comunicação impedir a limpeza,
registra os IDs pendentes; um POST sem resposta exige conferir o marcador mostrado
no início. Dados de outras reservas não são impressos nem removidos. Use um banco
próprio de teste e confira a URL antes de executar.

A persistência nativa é reproduzida por `npm --prefix app test`: POST, consulta
SQL, SIGTERM/exit 0, consulta SQL enquanto a API está parada, novo PID na mesma
porta e GET/SQL idênticos. O banco permanece ativo. A persistência de volume
após recriar containers foi verificada em T12; RDS será validado na etapa AWS.

`git status --short --branch` permite conferir o trabalho local. `.gitignore`
evita inclusão acidental de arquivos locais, mas não protege arquivos já
rastreados nem substitui a revisão antes de cada commit. Exemplos e evidências
públicas devem permanecer sem segredos.

## Imagem Docker e teste com banco real

[app/Dockerfile](app/Dockerfile) usa dois estágios: instala somente dependências
de produção por `npm ci` com lockfile e copia node_modules/manifests/src/sql para
o runtime. A base oficial Node 24.21.0 bookworm-slim está fixada pelo digest
`sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6`.
O runtime executa `node src/server.js` como `node` (UID 1000), com PORT 3000 e
NODE_ENV production. PostgreSQL permanece em serviço separado.
[app/.dockerignore](app/.dockerignore) permite somente manifests, src e sql,
excluindo também .env/PEM/chaves/artefatos dentro dos diretórios permitidos.
Dockerfile/.dockerignore são lidos pelo builder; não são copiados para a imagem.

Na raiz, pode construir e conferir o usuário:

```bash
docker build -t prova-reservas:local app
docker run --rm --entrypoint id prova-reservas:local -u
```

Para repetir a validação completa de T10:

```bash
npm --prefix app run test:docker
```

Depende de Node 24/Python 3 na máquina, Docker com daemon/BuildKit/buildx
acessíveis e rede para baixar base/imagens/dependências na primeira execução.
Não precisa instalar dependências Node no host para esse runner. A imagem
construída fica disponível como `prova-reservas:local`, sem push para registry.

[app/test/run-docker.js](app/test/run-docker.js) exporta um contexto real com
COPY ., inclui marcadores sem credenciais em .env/PEM e verifica sua exclusão.
Cria rede e PostgreSQL exclusivos por UUID/labels, sem publicar a porta do banco,
com dados tmpfs e senha efêmera em memória/ambiente. Aplica schema com a própria
imagem e inicia API em porta dinâmica de loopback. Confere UID do PID 1,
/health, verify-api.py e uma linha por SQL, preservando DD-MM-YYYY/DATE.
Depois limpa as reservas, testa SIGTERM/exit 0 e remove somente seus containers,
rede e marcadores. Falhas retornam código não zero. Não imprime Docker inspect
completo nem variáveis contendo senhas. Logs anteriores ficam como evidências
históricas; executar o runner não altera os logs versionados automaticamente.

O teste Docker é separado dos 51 testes nativos de T09 e do Compose T11 abaixo.
T12 comprovou persistência ao recriar containers mantendo o volume. RDS/TLS
continuam futuros.

## Executar API e PostgreSQL com Compose

Na raiz, prepare seu ambiente local:

```bash
cp .env.example .env
chmod 600 .env
```

Edite `.env` e substitua `SUBSTITUA_POR_SENHA_LOCAL` por uma senha própria.
PORT publica a API em 127.0.0.1:3000 por padrão; POSTGRES_DB/USER/PASSWORD
inicializam o banco. O Compose deriva PGDATABASE/PGUSER/PGPASSWORD desses mesmos
valores e define PGHOST=db, PGPORT=5432 e PGSSL=false. A API usa PORT=3000 dentro
do container. Não é necessário duplicar credenciais em PG* no .env do Compose.

Inicie os dois serviços com um comando:

```bash
docker compose config --quiet
docker compose up --build --wait
docker compose ps
python3 scripts/verify-api.py --base-url http://127.0.0.1:3000
```

Se mudar PORT no .env, use essa porta na URL de verificação. Depende de Docker,
BuildKit e Compose com suporte a start_interval (>=2.20.2; validado v5.5.1).
O Compose constrói a API e usa PostgreSQL 16.15 fixado por digest. O banco não
publica 5432 no host. Ambos usam a rede bridge lógica `reservas-net`; nomes reais
recebem prefixo do projeto. O healthcheck db usa pg_isready via TCP; a API aguarda
service_healthy e seu healthcheck Node consulta /health/SELECT 1. Não requer curl
na imagem. SQL de bootstrap é montado read-only no entrypoint do PostgreSQL;
só roda ao inicializar um volume vazio.

O volume nomeado lógico `reservas-data` está em /var/lib/postgresql/data. Para
parar/remover containers e rede mantendo o volume do seu projeto:

```bash
docker compose down
```

A criação e o mount desse volume foram verificados em T11; a retenção de uma
reserva após recriar api/db foi comprovada em T12. Não usar down -v nesse teste.
Em volume existente, mudança de schema exige migração explícita; alterar
POSTGRES_* no .env não reinicializa nem troca a senha do banco já criado.

Para repetir o teste isolado de T11, sem preparar/alterar seu .env:

```bash
npm --prefix app run test:compose
```

[app/test/run-compose.js](app/test/run-compose.js) requer Node 24/Python 3 e
Docker/Compose. Usa projeto UUID e ambiente temporário 0600 em /tmp, senha
aleatória não impressa e porta dinâmica de loopback. Confere config sem senha
(exit 1 esperado), config válido em memória, create/build com containers parados,
up --build --wait, ps, horários de health/início, rede/volume/portas/UID e
CRUD/SQL. Após remover as linhas, encerra seu projeto sem down -v e remove
separadamente somente o volume novo/exclusivo com labels conferidos. Limpa env
privado; mantém .env e volumes de outros projetos. Falhas retornam não zero;
o runner não atualiza evidências versionadas nem realiza AWS/recriação T12.

## Verificar persistência do Compose

O volume nomeado guarda dados fora do ciclo de vida do container. T12 conferiu
IDs diferentes para api/db, mesmo nome/data de criação do volume e reserva
idêntica por GET e SQL. JSON permaneceu DD-MM-YYYY e PostgreSQL manteve DATE.
[Documentação Docker sobre volumes](https://docs.docker.com/engine/storage/volumes/).

Para reproduzir o teste isolado, sem configurar ou alterar seu .env:

```bash
npm --prefix app run test:persistence
```

[run-persistence.py](app/test/run-persistence.py) usa Python 3 stdlib, Docker,
BuildKit e Compose (validado 3.12.3/v5.5.1), além de npm para esse atalho. Não
requer pip nem dependências Node no host. Cria projeto UUID e env privado 0600
em /tmp, publica porta dinâmica em loopback e usa as imagens fixadas existentes.
Confere SQL/HTTP, recria somente api/db desse projeto com --force-recreate,
retendo o volume, verifica um negativo com status alterado somente na linha
própria, rejeita prova sem recriação e confere checkpoint/cancelamento. Uma
sentinela de outro marcador deve sobreviver a todas as limpezas do verificador.

Ao final, o runner remove sua sentinela, confirma SQL total 0, confere labels,
encerra seu projeto sem -v e remove separadamente o volume novo/exclusivo vazio.
Env/checkpoints temporários são removidos. Se a limpeza não puder ser comprovada,
retorna 1 e mantém fixture/env/checkpoint para recuperação. A imagem local fica
disponível; volumes e .env de outros projetos são preservados. Executar o teste
não atualiza evidências versionadas automaticamente nem acessa AWS.

[verify-persistence.py](scripts/verify-persistence.py) verifica um Compose já
iniciado. Ele não executa up/down nem remove containers/volumes; o aluno ou
runner controla a recriação. Reutiliza o cliente HTTP de verify-api.py e executa
SQL por psql já presente no db. Descobre a porta atual em loopback, inclusive
se mudar após recriação. Usa o env-file explícito, removendo só as variáveis
herdadas do shell que alterariam a configuração Compose desse projeto.

Exemplo manual na raiz, depois de preparar .env conforme a seção anterior:

```bash
persist_project=prova-reservas-persistencia-manual
persist_checkpoint_dir=$(mktemp -d /tmp/prova-reservas-check-XXXXXX)
docker compose --project-name "$persist_project" --env-file .env up --build --wait
python3 scripts/verify-persistence.py prepare --project-name "$persist_project" --env-file .env --checkpoint "$persist_checkpoint_dir/reserva.json"
docker compose --project-name "$persist_project" --env-file .env up --no-build --force-recreate --wait
python3 scripts/verify-persistence.py check --project-name "$persist_project" --env-file .env --checkpoint "$persist_checkpoint_dir/reserva.json"
rmdir "$persist_checkpoint_dir"
```

Prepare cria marcador/ID próprios e checkpoint exclusivo 0600, registra SQL e
IDs/volume; exit 0 nessa fase significa apenas que a linha está pronta para a
recriação. Não sobrescreve checkpoint existente. Check exige novos IDs de ambos
os containers e mesmo volume, compara GET/SQL e limpa seu ID em finally, após
confirmar o marcador por GET; SQL deve contar zero linhas próprias antes de
remover checkpoint. Retorna 0 somente com verificação/limpeza completas, 1 na
falha e 2 para CLI inválida. Não excluir o checkpoint entre prepare e check.

Para cancelar depois de prepare, sem afirmar persistência:

```bash
python3 scripts/verify-persistence.py cleanup --project-name "$persist_project" --env-file .env --checkpoint "$persist_checkpoint_dir/reserva.json"
```

Cleanup remove só a reserva/checkpoint próprios; mantém Compose e volume. Se
HTTP/SQL impedir a limpeza, o script informa marcador/IDs pendentes e retém o
checkpoint. POST com resposta incerta requer conferir o marcador no banco;
nenhuma exclusão geral é feita. As três fases têm comandos limitados por prazo
(HTTP 5s, Docker 30s, SQL 5s), sem imprimir credenciais/config expandida.

## Configuração do ambiente

[.env.example](.env.example) contém somente quatro variáveis e senha placeholder.
.env e variantes locais continuam ignorados. PG* para API nativa/RDS são fornecidos
no ambiente do processo; Node não carrega .env automaticamente.

| Variável | Uso |
|---|---|
| PORT | .env Compose: porta publicada no host (3000 padrão); API nativa: porta de escuta. No container Compose permanece 3000. |
| POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD | Inicialização do PostgreSQL Compose; origem das variáveis equivalentes de conexão da API. |
| PGHOST, PGPORT | No Compose: db/5432; API nativa/RDS: host/porta fornecidos pelo ambiente. |
| PGDATABASE, PGUSER, PGPASSWORD | Derivados de POSTGRES_* no Compose; banco/autenticação explícitos na API nativa/RDS. |
| PGSSL, PGSSLROOTCERT | Compose local: false, sem CA; RDS futuro: true com CA oficial. |

Node 24.21.0, Express 5.2.1, pg 8.23.0 e PostgreSQL 16.15 foram validados
localmente em T06. T13 confirmou RDS 16.15 com db.t3.micro/gp3 e validou a compatibilidade local de
Terraform 1.16.2/provider AWS 6.65.0. AWS: somente Learner Lab, `us-east-1`, credenciais
temporárias com token e LabRole/LabInstanceProfile existentes, sem IAM próprio.

## AWS e entrega

Provisionamento e destruição exigem plano revisado e autorização específica.
A implantação futura usará RDS privado/encriptado para a API na EC2; a limpeza
principal acontecerá
antes da limpeza do backend. T13 realizou consultas de leitura AWS; não há implantação do projeto.

Preflight consulta identidade, disponibilidade e parâmetros antes de escrever
um plano. Assim os módulos usam opções realmente ofertadas pela conta/região.
T13 selecionou AZs us-east-1a/us-east-1b, EC2 t2.micro, RDS PostgreSQL 16.15/
db.t3.micro/gp3/20GiB, key pair existente vockey e LabInstanceProfile/LabRole.
Encriptação é suportada; RDS privado/SG/locking só serão comprovados depois.
A key pair retornada não comprova posse da chave privada ou conexão SSH.

`infra/preflight.local.json` guarda conta/IP/CIDRs e
opções locais em 0600, ignorado; não deve ser publicado. Não contém credenciais
nem chave privada e não é arquivo Terraform de variáveis/state. O aluno confirmou
no painel US$0 usados de US$50; esse saldo não foi medido pela API. Os CIDRs definidos para SSH/API
são o IP atual /32 por decisão dele; as regras serão implementadas em T18.
Reconsultar IP, STS e opções
antes de plan/apply: validade observada agora não garante token válido depois.

Com credenciais temporárias do Lab já configuradas, pode conferir sem criar:

```bash
aws sts get-caller-identity --region us-east-1 --query Account --output text
aws ec2 describe-availability-zones --region us-east-1 --query 'AvailabilityZones[].ZoneName' --output json
aws rds describe-orderable-db-instance-options --engine postgres --engine-version 16.15 --db-instance-class db.t3.micro --vpc --region us-east-1 --query 'OrderableDBInstanceOptions[].{version:EngineVersion,class:DBInstanceClass,storage:StorageType,encryption:SupportsStorageEncryption}' --output json
aws ec2 describe-key-pairs --region us-east-1 --query 'KeyPairs[].KeyName' --output json
aws iam get-instance-profile --instance-profile-name LabInstanceProfile --region us-east-1 --query 'InstanceProfile.Roles[].RoleName' --output json
```

A saída de conta fica no seu terminal privado; evidências versionadas a mascaram.
Não imprimir arquivo de credenciais nem dumps de ambiente. Sonda T13 em /tmp
usou init -backend=false/validate/schema com provider fixo e sem credenciais;
logs/lockfile real estão em aws-preflight.txt. Isso não é validate dos módulos
infra futuros nem teste de locking. O argumento dynamodb_table permanece
suportado/depreciado no Terraform 1.16.2 e será usado conforme a prova.
[Backend S3 oficial](https://developer.hashicorp.com/terraform/language/backend/s3).
O [lockfile do bootstrap](infra/backend/.terraform.lock.hcl) foi gerado e conferido
em T14; o lockfile principal será criado em T21. Nenhuma atualização de versão
foi feita para acrescentar commits.

### Bootstrap Terraform disponível — T14

O [bootstrap](infra/backend/main.tf) cria o destino do state principal antes de
esse backend ser usado. Seu próprio state usa backend local em
infra/backend/terraform.tfstate e permanece separado. O plano atual contém:

- Bucket S3 e três configurações: versionamento Enabled, SSE-S3 AES256 e quatro
  flags de bloqueio público ativadas.
- Tabela DynamoDB PAY_PER_REQUEST, chave de partição LockID do tipo String.

São cinco recursos Terraform e dois serviços AWS. Tags Project/Environment/Owner
estão no bucket/tabela; configurações do bucket não têm tags próprias. Provider
restringe região a us-east-1 e conta à conferida por STS; não cria IAM/KMS.
force_destroy=false conserva a revisão da limpeza de versões para T29/T30.
[Backend local oficial](https://developer.hashicorp.com/terraform/language/backend/local).

Na primeira configuração, copie o exemplo sem substituir arquivo existente:

```bash
umask 077
cp --no-clobber infra/backend/terraform.tfvars.example infra/backend/terraform.tfvars
chmod 600 infra/backend/terraform.tfvars
```

Edite somente o arquivo local: conta real do Lab, perfil com credenciais
temporárias e nomes exclusivos com sufixo aleatório; todos os placeholders
precisam ser substituídos. Nomes não contêm conta/IP. O arquivo é ignorado;
credenciais e session token ficam no perfil AWS fora do repositório.

Execute na raiz, com Terraform 1.16.2 e conta/região conferidas. Nesta máquina,
init comum falhou duas vezes ao localizar a versão, embora o Registry a liste.
Este procedimento direct temporário passou com provider 6.65.0 assinado,
sem alterar configuração global ou versões:

```bash
bootstrap_cli_config=$(mktemp /tmp/prova-backend-cli-XXXXXX.tfrc)
printf 'provider_installation {\n  direct {}\n}\n' > "$bootstrap_cli_config"
TF_CLI_CONFIG_FILE="$bootstrap_cli_config" terraform -chdir=infra/backend init -input=false -no-color -lockfile=readonly
rm -- "$bootstrap_cli_config"
terraform fmt -check -recursive infra
terraform -chdir=infra/backend validate -no-color
terraform -chdir=infra/backend plan -input=false -no-color -detailed-exitcode -out=backend.tfplan
```

Mantenha umask 077 também ao gerar planos/state. O lockfile versionado garante
os hashes/versão; -lockfile=readonly impede atualização nessa reprodução.
Com -detailed-exitcode, 2 indica plano com mudanças, 0 nenhuma mudança e 1 erro.
[Referência de plan](https://developer.hashicorp.com/terraform/cli/commands/plan).
O negativo com state_bucket_name=prova-6325231-an retornou 1 esperado pela
validação; o plano válido salvo manteve seu hash. Nomes com esse sufixo são
reservados para outro namespace, conforme [regras S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html).

O plano binário e o JSON bruto podem conter variáveis sensíveis em texto claro;
não publique nenhum deles. Plano/tfvars/metadados estão ignorados e 0600 nesta
execução. Evidências públicas contêm saída revisada e resumo dos atributos,
com conta mascarada. Backend local inicializado não comprova recursos criados:
terraform.tfstate do bootstrap ainda está ausente; a criação ocorrerá em T16.
O output backend_config aparece somente como proposta no plano; valores
aplicados serão usados em T21 após conferência T16. Root remoto principal ainda
não foi implementado/inicializado. [Cuidados com show JSON](https://developer.hashicorp.com/terraform/cli/commands/show).

Preserve o plano atual para T15. Antes de apply, revalide credenciais/conta,
reconfira o plano/nomes/custo e obtenha autorização específica. Mudança no código
ou variáveis exige novo plano/revisão. A consulta filtrada confirmou ausência do
bucket nesta conta; a disponibilidade global do nome só se confirma na criação.

A submissão da disciplina ficará somente em
`entregas/provaPrimeiroBi/6325231/entrega.md` no fork separado. A data de entrega
informada é 01/10/2026. Um único PR deve ser
aberto presencialmente no dia confirmado da prova, sem commits posteriores no PR.
O relatório será escrito com base no diário e na experiência real do aluno.
