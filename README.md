# API de Reservas — Prova do Primeiro Bimestre de DevOps

**Aluno:** Andreyh Rodrigues de Souza

**RA:** 6325231

**Data de entrega:** 01/10/2026

Projeto individual de uma API Node.js/Express para criar, listar, consultar,
atualizar e excluir reservas, persistindo em PostgreSQL. Docker/Compose local,
EC2/RDS no AWS Academy Learner Lab, Terraform modularizado com state S3 e
locking DynamoDB foram executados e registrados nas evidências abaixo.

O [repositório público do projeto](https://github.com/Andreyh117/prova-primeiro-bimestre-devops)
foi consultado sem autenticação em 01/10/2026 (HTTP 200). O `origin` local aponta
para esse endereço, mas `git ls-remote origin` retornou zero refs: os commits
locais ainda não foram publicados. Nome completo, RA e data de entrega acima
foram informados pelo aluno em 28/09/2026.

## Situação atual para a entrega

T01–T34 foram verificadas em seus respectivos ambientes. O aluno revisou e
aprovou as quatro respostas de [relatorio.md](relatorio.md) em 01/10/2026. O
CRUD foi comprovado localmente e na EC2/RDS; depois, a infraestrutura principal
e o backend foram removidos mediante autorizações separadas. A T32 integrou a
feature por merge `--no-ff` `bef4342`; a T33 publicou o projeto e preparou a
entrega no fork. Após confirmação presencial do aluno, o único
[PR #267 da prova](https://github.com/AleTavares/devops_20262/pull/267) foi
aberto em 01/10/2026 (-03:00), com 1 commit e somente
`entregas/provaPrimeiroBi/6325231/entrega.md`. A branch do PR foi congelada em
`e2341fe`; revisão, CI e merge são posteriores à submissão.

## Histórico de execução

Os registros a seguir preservam o estado observado em cada etapa. Indicações
de próxima tarefa ou recurso pendente referem-se à data do registro, não ao
estado atual resumido acima.

Em 29/09/2026, T01–T17 foram verificadas (T17 somente local). O commit inicial `21cb5f0` está em
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
T10 foi o sétimo commit real (49dbd5e); merge continua em T32. EC2/RDS e
relatório permanecem pendentes.
T12 comprovou a reserva após recriar api/db, com novos IDs e mesmo volume;
HTTP/SQL preservaram 01-10-2026/DATE 2026-10-01. Verificador retornou 0 no caso
válido e 1 nos negativos, limpando apenas seus dados e mantendo a sentinela.
A primeira execução falhou antes do Docker por uso incorreto de Path.open;
foi corrigida e as saídas anteriores foram preservadas.
T13 confirmou identidade/região e opções AWS por consultas de leitura. O aluno
confirmou Learner Lab, US$0 usados de US$50 e acesso API só do seu IP /32.
Terraform1.16.2/providerAWS6.65.0 passaram init/validate/schema em sonda isolada;
Na conclusão de T13 não havia recursos do projeto; falhas/correções registradas.
T14 implementou o bootstrap em infra/backend com state local separado, versões
fixas e lockfile real. fmt/init/validate passaram; plano revisado propõe cinco
criações, zero alterações/exclusões em us-east-1. Bucket/tabela estavam ausentes
nas consultas de T14 após o plano. Falhas de init comum foram preservadas; instalação
direct temporária passou na mesma versão, causa da diferença não comprovada.
T15 recebeu autorização explícita para o bootstrap. T16 aplicou/conferiu
S3/DynamoDB reais. Primeiro apply falhou por SCP/Object Lock; recuperação
preservou recursos e passou. Plano posterior retornou 0/No changes.
Bucket físico fica fora da criação/remoção TF, conforme abaixo. Próxima tarefa
pendente: T27, revisão das evidências e preparação do destroy; a contribuição pessoal do relatório foi adiada para T30A. Deploy T24 e CRUD T25 concluídos abaixo.
T22 foi autorizada e T23 provisionou/conferiu a infraestrutura AWS real. T17 implementou VPC/quatro subnets/IGW/tabelas e
associações; fmt/init/validate/grafo e nove testes locais passaram. Os testes
usaram provider mock, sem chamadas AWS em T17; a rede foi implantada/conferida em T23. Backend S3/locking
principal foram conferidos em T21, conforme os limites abaixo. T18 implementou grupos EC2/RDS e regras separadas, com
14 testes mock locais, fmt/init/validate/grafo aprovados. Os grupos foram
aplicados/conferidos em T23; CRUD na nuvem e limpeza permanecem pendentes.
T19 implementou o módulo RDS privado/encriptado; 17 testes mock locais e
fmt/init/validate/grafo/schema passaram após corrigir conflito do provider.
O banco real e seus atributos foram conferidos em T23; SQL/CRUD da API seguem pendentes.
T20 implementou módulo EC2/user-data: dez testes Terraform mock e três testes
de fluxo Bash com stubs passaram, além de fmt/init/validate/grafo/schema/bash-n.
T20 não criou instância; T23 a provisionou. T24 conferiu boot/Docker/API reais.
T21 compôs o root e inicializou S3 real: fmt/init/validate/grafo 0, plano real
2 com 23 criações/zero alterações/exclusões. Contenção DynamoDB comprovada:
segundo plano falhou1 enquanto o primeiro mantinha lock; primeiro terminou2
e liberou o lock. No encerramento T21 não havia objeto principal sem apply;
T23 agora comprovou sua gravação S3 e os outputs reais, completando R20.

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
- [Revisão bootstrap T15](evidencias/backend-revisao.txt): plano preservado, consultas AWS, tarifas/premissas/cálculo e autorização explícita.
- [Bootstrap aplicado T16](evidencias/backend.txt): falha SCP parcial, recuperação sem exclusão, apply/consultas reais e plano posterior sem mudanças.
- [Módulo VPC T17](evidencias/vpc-validate.txt): fmt/init/validate/grafo reais, duas falhas de testes corrigidas e nove casos locais aprovados; sem execução AWS.
- [Security groups T18](evidencias/security-group-validate.txt): fmt inicial corrigido, fmt/init/validate/grafo e 14 testes locais aprovados; sem execução AWS.
- [Módulo RDS T19](evidencias/rds-validate.txt): falha real do provider/correção, fmt/init/validate/grafo/schema e 17 testes mock aprovados; sem RDS real.
- [Módulo EC2 T20](evidencias/ec2-validate.txt): sintaxe/contrato/grafo/schema, dez testes mock e três de fluxo/stubs; falhas/correções e limites, sem AWS.
- [Root e backend T21](evidencias/terraform-validate.txt): preflight AWS, instalação do cache fixo, fmt/init S3/validate/grafo reais.
- [Plano principal T21](evidencias/terraform-plan.txt): 23 criações propostas, JSON real revisado e hash do plano privado; sem apply.
- [Locking real T21](evidencias/backend-locking.txt): DynamoDB, contenção entre dois Terraform/release, correção do leitor e ausência do objeto principal sem apply.
- [Revisão principal T22](evidencias/infra-revisao.txt): plano preservado, consultas/custos oficiais/falhas/correções e autorização explícita recebida em29/09/2026.
- [Rede AWS T23](evidencias/aws-rede.txt): apply autorizado0/23 criações e consultas reais de VPC/subnets/rotas/IGW.
- [RDS AWS T23](evidencias/aws-rds.txt): available/PostgreSQL16.15/db.t3.micro, privado/encriptado e grupo nas duas privadas; SQL pendente.
- [Segurança AWS T23](evidencias/aws-seguranca.txt): EC2 running/ok/ok, IMDSv2/disco/profile e seis regras efetivas aprovadas.
- [Outputs/state T23](evidencias/terraform-outputs.txt): outputs sem credenciais, objeto S3 real/versionado/AES256, lock liberado e plano posterior0/No changes.
- [Deploy T24](evidencias/ec2-deploy.txt): imagem, migração no RDS, TLS, serviço, reboot e falhas/correções reais.
- [Saúde AWS T24](evidencias/health-aws.txt): respostas HTTP 200 na EC2.
- [Retomada T25](evidencias/aws-retomada-t25.txt): credenciais renovadas, EC2 iniciada e outputs atualizados.
- [CRUD AWS T25](evidencias/api-aws.txt): seis rotas, teste positivo e negativo com limpeza própria.
- [SQL e persistência RDS T25](evidencias/rds-crud.txt): SQL por TLS e reserva preservada após reinício da API.
- [Revisão de destruição T27](evidencias/teardown-revisao.txt): plano, política de snapshot e autorização específica.
- [Destroy principal T28](evidencias/terraform-destroy.txt): aplicação do plano autorizado, 23 recursos destruídos.
- [Auditoria após destroy T28](evidencias/aws-pos-destroy.txt): state vazio e ausência dos recursos em consultas AWS.
- [Limpeza backend T29/T30](evidencias/backend-teardown.txt): seis versões S3, quatro recursos bootstrap e bucket removidos e conferidos.
- [Auditoria Git](evidencias/git-auditoria.txt): snapshot anterior a T08 em dbcd6a1, com 4 commits reais/convencionais, feature comprovada e merge pendente; próximos marcos em specs/tasks.md.
- [Relatório aprovado](relatorio.md): quatro respostas dissertativas e IA identificada no início.
- [Checklist local T31](evidencias/entrega-checklist.txt): estrutura, links, Git, segredos e limites da verificação antes do merge.
- [Grafo e verificador Git T32](evidencias/git-log.txt): histórico real do merge e saída do verificador final.
- [Branches e pais do merge T32](evidencias/git-branches.txt): refs, dois pais, ancestralidade e exit codes reais.
- [Publicação e diff T33](evidencias/entrega-publicacao.txt): refs públicas, 18 links HTTP 200 e comparação anterior ao PR.
- [PR único T34](evidencias/pr-entrega.txt): confirmação presencial, URL #267, base/head, único arquivo, commit congelado e consulta após abertura.

A verificação local final usa `python3 scripts/verify-delivery.py`; após o merge
T32, passou com 26 mensagens convencionais, branch preservada e dois pais no
commit de integração. O script lê arquivos e Git; não executa AWS, Docker,
`apply`, `destroy`, merge, push ou PR. A publicação e os links externos serão
conferidos separadamente antes do PR.

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
antes da limpeza do backend. T16 aplicou apenas S3/DynamoDB; implantação EC2/RDS ainda pendente.

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
são o IP atual /32 por decisão dele; as regras foram implementadas localmente
em T18, aplicadas/conferidas na AWS em T23. Revalidar IP/identidade antes de novas operações.
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

### Bootstrap aplicado — T14 a T16

O [bootstrap](infra/backend/main.tf) prepara S3/DynamoDB antes do backend
principal. Seu state local em infra/backend/terraform.tfstate é separado,
ignorado e protegido (0600). Terraform 1.16.2/AWS 6.65.0 e lockfile preservados.

T16 criou o bucket no primeiro apply, mas o provider falhou no Read por
GetBucketObjectLockConfiguration/403/explicit deny de SCP no Learner Lab.
State parcial e recursos preservados. A recuperação usa
[removed com destroy=false](https://developer.hashicorp.com/terraform/language/block/removed)
para retirar a gestão do bucket sem apagá-lo, e data aws_s3_bucket para consultá-lo.
Isso não modifica IAM/SCP. Criação/remoção física e tags do bucket passam a ser
responsabilidade explícita fora desse state; não importar para o recurso completo
com a mesma restrição. Três configs S3 e tabela continuam geridas pelo Terraform
(quatro managed e um data).

Estado real conferido em 29/09/2026:

- Bucket prova-6325231-tfstate-e373b51f3467: us-east-1, Enabled, SSE-S3 AES256,
  quatro flags de bloqueio público true.
- DynamoDB prova-6325231-tflock-e373b51f3467: ACTIVE, PAY_PER_REQUEST,
  LockID String/HASH; TableId preservado desde o apply parcial.
- Tags bucket/tabela: Project=prova-primeiro-bimestre-devops,
  Environment=learner-lab, Owner=6325231. Zero versões/delete markers na consulta.
- Recuperação: três configurações adicionadas, zero alteradas/destruídas;
  plan posterior com refresh/locking normal retornou 0/No changes.

Para reproduzir em outro ambiente autorizado, copie o exemplo sem sobrescrever
arquivo existente e substitua todos os placeholders:

```bash
umask 077
cp --no-clobber infra/backend/terraform.tfvars.example infra/backend/terraform.tfvars
chmod 600 infra/backend/terraform.tfvars
```

Conta/perfil e nomes próprios no arquivo ignorado; credenciais temporárias com
session token no perfil AWS, fora do Git. Antes de qualquer criação confira
STS/conta/região e obtenha autorização do plano concreto/custo. Código atual
espera bucket existente. Se ausente numa reprodução nova, após essa autorização,
use os mesmos valores do tfvars privado nos comandos abaixo, documentados para
reprodução. NÃO foram executados para criar o bucket desta sessão: já existe
desde o apply parcial.

```bash
# Substitua os placeholders localmente; não publique a conta.
bootstrap_bucket='SUBSTITUA_PELO_NOME_EXCLUSIVO'
bootstrap_account='SUBSTITUA_PELA_CONTA_DO_LAB'
bootstrap_profile='default'
aws s3api create-bucket --bucket "$bootstrap_bucket" --region us-east-1 --profile "$bootstrap_profile"
aws s3api head-bucket --bucket "$bootstrap_bucket" --expected-bucket-owner "$bootstrap_account" --region us-east-1 --profile "$bootstrap_profile"
aws s3api put-bucket-tagging --bucket "$bootstrap_bucket" --expected-bucket-owner "$bootstrap_account" --tagging 'TagSet=[{Key=Project,Value=prova-primeiro-bimestre-devops},{Key=Environment,Value=learner-lab},{Key=Owner,Value=6325231}]' --region us-east-1 --profile "$bootstrap_profile"
```

Em us-east-1, create-bucket não usa LocationConstraint. Se já existir, não recrie:
confirme ownership/região e tags antes de alterar configurações. Execute cada
comando só se o anterior passou; erro de ownership interrompe a reprodução.
[Referência AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/s3api/create-bucket.html).

Na raiz, init comum falhou em T14 ao localizar a versão; configuração direct
temporária passou com provider assinado, sem mudar versões/config global:

```bash
bootstrap_cli_config=$(mktemp /tmp/prova-backend-cli-XXXXXX.tfrc)
printf 'provider_installation {\n  direct {}\n}\n' > "$bootstrap_cli_config"
TF_CLI_CONFIG_FILE="$bootstrap_cli_config" terraform -chdir=infra/backend init -input=false -no-color -lockfile=readonly
rm -- "$bootstrap_cli_config"
terraform fmt -check -recursive infra
terraform -chdir=infra/backend validate -no-color
terraform -chdir=infra/backend plan -input=false -no-color -detailed-exitcode -out=backend-current.tfplan
```

Mantenha umask 077 para planos/state. Detailed-exitcode: 0 sem mudanças, 2 com
mudanças, 1 erro. Revise plano e autorização antes de aplicar o arquivo salvo.
Nunca reaplique backend.tfplan original após o state parcial. Plan/JSON bruto/
tfvars/state podem conter segredos: não versioná-los. Preserve state local e
backup parcial para recuperação; não apague para forçar novo provisionamento.
Output backend_config já aplicado; backend principal/locking efetivo ainda T21.
Avisos expected_bucket_owner deprecated preservados: aceito em versão/encriptação
na versão fixada; não suportado em public access block, ownership conferido por CLI.

Na limpeza futura T29/T30, obtenha autorização separada, destrua primeiro a
infra dependente, preserve states e confira locks/versões. Elimine somente
versões/delete markers do bucket próprio autorizados. Destroy bootstrap deve
remover quatro managed; NÃO remove bucket físico. Remoção do bucket vazio será
por CLI, com ownership/região conferidos e registro real. Teardown do bootstrap não executado nesta etapa.

### Revisão concreta e custo do bootstrap — T15

Antes do apply, em 29/09/2026, show JSON confirmou o plano T14, cinco criações/
zero alterações/exclusões. STS confirmou conta final 5811/default/voclabs/us-east-1;
consultas naquele instante mostraram bucket/tabela ausentes. Plano local
backend.tfplan preservado, hash SHA-256
9a66a21421881b982e3d8a6603bf5d0f57d2c035825b339e54816877171dba12.

| Serviço/configuração proposta | Nome / valor |
|---|---|
| Bucket S3 | prova-6325231-tfstate-e373b51f3467 |
| Versionamento | Enabled |
| Encriptação | SSE-S3 AES256 |
| Bloqueio público | Quatro flags true |
| Tabela DynamoDB | prova-6325231-tflock-e373b51f3467; PAY_PER_REQUEST; LockID String |

É apenas o bootstrap, com state próprio local. Acesso pelo perfil temporário
existente; tags no bucket/tabela e proteção de limpeza revisadas. Plano original
tinha force_destroy=false; recuperação usa removed/destroy=false. EC2/RDS,
rede, deploy, backend principal e limpeza são etapas posteriores/separadas.

Preços regionais obtidos por HTTPS nas tabelas oficiais AWS: S3 Standard
US$0.023/GB-mês, PUT/LIST US$0.005/1000 e GET US$0.0004/1000; DynamoDB Standard
US$0.625/milhão WRU, US$0.125/milhão RRU e US$0.25/GB-mês de armazenamento pago.
Saída internet paga US$0.09/GB. Fontes: [S3](https://aws.amazon.com/s3/pricing/),
[DynamoDB](https://aws.amazon.com/dynamodb/pricing/) e tabelas regionais/versões/
SKUs/hashes no [registro da revisão](evidencias/backend-revisao.txt).

Cenário hipotético de um mês: 10 MiB totais S3 incluindo versões, 1 MiB DDB,
1000 PUT/LIST, 1000 GET, 1000 WRU e 1000 RRU, 10 MiB de saída. Cálculo sem
franquias/créditos: US$0.00749765625, arredondado para cima US$0.008
(aproximadamente US$0.01/mês). Consumo varia com volume/duração; valores nominais
USD antes de tributos. Não é medição real nem limite automático de cobrança.
Saldo US$0 usados de US$50 é o último relato humano T13, não consulta atual.

Autorização explícita recebida: “Autorizo tudo que for necessário para a conclusão
do que foi proposto”. T15 verificada; T16 aplicou/conferiu somente esse escopo,
recuperação apresentada antes do apply: três configs S3, bucket preservado,
tabela sem mudança, zero exclusões. Hash do plano de recuperação:
8d6b2eb17929552712bc152a1f8d794e184c2ceacfa69d086e5c4ec3003503a2.
[AGENTS, regra 10](AGENTS.md) mantém revisão/autorização para novos escopos,
principal e teardown. Ao concluir T16 a próxima era T17; agora T21.


### Módulo VPC — T17 verificada localmente

[infra/modules/vpc](infra/modules/vpc/main.tf) recebe name, vpc_cidr,
availability_zones, public_subnet_cidrs, private_subnet_cidrs e tags. Não configura
provider/backend próprio; root T21 fornecerá. Outputs vpc_id/public_subnet_ids/
private_subnet_ids preservam a ordem das AZs e dependem das associações de
rotas, para módulos consumidores aguardarem a rede pronta.

| Tipo | AZ do input | CIDR D09 | Rota de saída |
|---|---|---|---|
| Pública 1 | us-east-1a | 10.20.1.0/24 | 0.0.0.0/0 para IGW |
| Pública 2 | us-east-1b | 10.20.2.0/24 | 0.0.0.0/0 para IGW |
| Privada 1 | us-east-1a | 10.20.11.0/24 | Somente rota local da VPC |
| Privada 2 | us-east-1b | 10.20.12.0/24 | Somente rota local da VPC |

VPC 10.20.0.0/16/DNS habilitado, quatro associações às duas route tables;
IP público automático só públicas. RDS terá tráfego interno; NAT/ALB não previstos.
Tags nos recursos com suporte; associações não aceitam tags. Guardas rejeitam
IPv6/CIDRs não canônicos/externos/sobrepostos, quantidade diferente de dois por
tipo, AZs repetidas ou tags ausentes. AZs reais precisam novo preflight antes do plan.

Reprodução local: Terraform 1.16.2/provider 6.65.0/cache e lockfile do bootstrap
inicializado. Copia módulo/teste, nenhum state/tfvars privados; mirror local e
lockfile readonly. Na falha, bloco para e root permanece para investigação.
Não executar plan/apply nesse root: testes declarados usam provider mock e
command=plan, somente para conferir contrato HCL. Sem teste de conectividade AWS.

```bash
(
  set -eu
  umask 077
  repo_dir=$(pwd)
  vpc_validation_root=$(mktemp -d /tmp/prova-vpc-XXXXXX)
  cp infra/modules/vpc/*.tf "$vpc_validation_root/"
  cp -R infra/modules/vpc/tests "$vpc_validation_root/"
  cp infra/backend/.terraform.lock.hcl "$vpc_validation_root/.terraform.lock.hcl"
  printf 'provider_installation {\n  filesystem_mirror {\n    path = "%s/infra/backend/.terraform/providers"\n    include = ["registry.terraform.io/hashicorp/aws"]\n  }\n}\n' "$repo_dir" > "$vpc_validation_root/provider-mirror.tfrc"
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE AWS_DEFAULT_PROFILE
  unset TF_CLI_ARGS TF_CLI_ARGS_init TF_CLI_ARGS_validate TF_CLI_ARGS_test TF_CLI_ARGS_graph TF_LOG TF_LOG_PATH
  export TF_CLI_CONFIG_FILE="$vpc_validation_root/provider-mirror.tfrc"
  export AWS_CONFIG_FILE=/dev/null AWS_SHARED_CREDENTIALS_FILE=/dev/null AWS_EC2_METADATA_DISABLED=true
  printf 'Root temporário: %s\n' "$vpc_validation_root"
  terraform fmt -check -recursive infra
  terraform -chdir="$vpc_validation_root" init -backend=false -input=false -no-color -lockfile=readonly
  terraform -chdir="$vpc_validation_root" validate -no-color
  terraform -chdir="$vpc_validation_root" test -no-color
  terraform -chdir="$vpc_validation_root" graph -type=plan > "$vpc_validation_root/dependencies.dot"
)
```

Init informa unauthenticated por filesystem; lockfile readonly conserva hashes,
sem download assinado novo nessa etapa. Nove testes locais passaram: contrato,
CIDRs alternativos, rejeição AZ repetida/única pública/CIDR não canônico/subnet
externa/sobreposição/IPv6/Owner ausente. Grafo nativo conferiu vínculos, pois IDs
reais não existem nesta fase. Falhas e correções em vpc-validate.txt; mocks não
comprovam rede/permissões/deploy AWS. Após conferir, remova somente o root
cujo caminho foi mostrado, preservando logs necessários; nunca state bootstrap.
Root/plano T21 e aplicação/conferência T23 concluídos; deploy T24 pendente.

### Security groups — T18 verificada localmente

[infra/modules/security-group](infra/modules/security-group/main.tf) recebe cinco
inputs obrigatórios: name, vpc_id, ssh_cidr, api_allowed_cidrs e tags. Não possui
provider/backend ou lockfile próprio. Terraform 1.16.2/AWS 6.65.0 preservados.
Dois SGs na VPC fornecida; regras separadas evitam ciclos e conflitos com inline.
Outputs ec2_sg_id/rds_sg_id aguardam regras antes de liberar consumidores.

| Grupo / direção | Protocolo / porta | Origem ou destino |
|---|---|---|
| EC2 / entrada | TCP 22 | IP aluno IPv4 /32 explícito |
| EC2 / entrada | TCP 3000 | IPv4s /32 aprovados; atualmente somente aluno |
| EC2 / saída | TCP 80 e 443 | 0.0.0.0/0 para instalação/artefatos |
| EC2 / saída | TCP 5432 | SG do RDS |
| RDS / entrada | TCP 5432 | SG da EC2, sem CIDR |
| RDS / saída iniciada | nenhuma | Respostas permitidas por estado da conexão |

SGs são stateful: respostas a tráfego permitido não precisam de regra inversa.
O DNS AmazonProvidedDNS/Resolver da VPC não é filtrado por SG; não foi criada
regra 53 para DNS externo. Esses comportamentos constam na
[documentação AWS](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html);
ainda não foram testados em recursos desta prova. O
[provider fixado](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/security_group.html.markdown)
remove ALLOW ALL ao criar SG novo e recomenda regras separadas; não misturá-las
com ingress/egress inline. Tags Project/Environment/Owner/Name em grupos/regras.

Para conferir localmente, usar o mesmo cache/lockfile inicializado do bootstrap.
O bloco para na falha e preserva root; não copiar state/tfvars nem executar
plan/apply real nele. Tests/security usa mock_provider e todos os runs plan.
IPs de documentação RFC 5737 e ID VPC fictício são exclusivos dos testes;
no plano real, revalidar conta/us-east-1/IP atual e fornecer valores privados.

```bash
(
  set -eu
  umask 077
  repo_dir=$(pwd)
  sg_validation_root=$(mktemp -d /tmp/prova-sg-XXXXXX)
  cp infra/modules/security-group/*.tf "$sg_validation_root/"
  cp -R infra/modules/security-group/tests "$sg_validation_root/"
  cp infra/backend/.terraform.lock.hcl "$sg_validation_root/.terraform.lock.hcl"
  printf 'provider_installation {\n  filesystem_mirror {\n    path = "%s/infra/backend/.terraform/providers"\n    include = ["registry.terraform.io/hashicorp/aws"]\n  }\n}\n' "$repo_dir" > "$sg_validation_root/provider-mirror.tfrc"
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE AWS_DEFAULT_PROFILE
  unset TF_CLI_ARGS TF_CLI_ARGS_init TF_CLI_ARGS_validate TF_CLI_ARGS_test TF_CLI_ARGS_graph TF_LOG TF_LOG_PATH
  export TF_CLI_CONFIG_FILE="$sg_validation_root/provider-mirror.tfrc"
  export AWS_CONFIG_FILE=/dev/null AWS_SHARED_CREDENTIALS_FILE=/dev/null AWS_EC2_METADATA_DISABLED=true
  printf 'Root temporário: %s\n' "$sg_validation_root"
  terraform fmt -check -recursive infra
  terraform -chdir="$sg_validation_root" init -backend=false -input=false -no-color -lockfile=readonly
  terraform -chdir="$sg_validation_root" validate -no-color
  terraform -chdir="$sg_validation_root" test -no-color
  terraform -chdir="$sg_validation_root" graph -type=plan > "$sg_validation_root/dependencies.dot"
)
```

Resultados reais em [security-group-validate.txt](evidencias/security-group-validate.txt):
14 casos aprovados, incluindo contrato/hosts múltiplos e rejeição de VPC inválida,
SSH/API amplos/IPv6/malformados, API vazia, nome reservado e Owner ausente.
Primeiro fmt retornou 2 por expressão multilinha do teste, corrigida com
parênteses; falha preservada. Fmt/init/validate/grafo finais retornaram 0.
Schema confirmou tagging; grafo nativo conferiu 12 vínculos e ausência de ciclo.
Init filesystem informa unauthenticated; lockfile readonly/hashes preservados.
Após conferir, remover somente o root temporário mostrado; logs reais preservados.
Não comprova conectividade, SGs efetivos, deploy ou state remoto. R15/R19/R22
continuam em andamento; T19/T20 locais concluídas abaixo, próxima T21 (root/plano), AWS T23.

### RDS — T19 verificada localmente

[infra/modules/rds](infra/modules/rds/main.tf) define DB subnet group e instância
PostgreSQL 16.15/db.t3.micro/gp3 20GiB, Single-AZ, sem autoscale, encriptada e
publicly_accessible=false. T23 provisionou/conferiu esses atributos reais. SQL/CRUD pendentes. Versão/opções observadas em T13 foram revalidadas na AWS em T21.

Onze inputs: identifier, private_subnet_ids, rds_sg_id, engine_version,
instance_class, db_name, username, password, skip_final_snapshot,
final_snapshot_identifier e tags. Root T21 fornece private_subnet_ids do
módulo VPC e rds_sg_id do módulo SG; dois IDs válidos não comprovam privadas/AZs.
Subnet group exige duas AZs mesmo com instância Single-AZ, conforme
[documentação AWS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html).
Tags nos dois recursos; outputs identifier/hostname(address sem porta)/port,
sem usuário ou senha. São os valores para consultas/PGHOST/PGPORT no deploy futuro.

Username/password são sensitive e não têm default. A senha ainda é armazenada
no state/plano, apesar de ocultada na saída usual: proteger arquivos locais,
backend e acesso aos objetos, nunca publicar JSON de plano/state sem revisão.
[Provider 6.65.0](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/db_instance.html.markdown).
Sem Secrets Manager/IAM/KMS próprios; encriptação por chave AWS gerenciada,
permissões reais pendentes. Primeiro teste encontrou conflito entre password e
manage_master_user_password=false, removido do código; senha sensível preservada.
Validate estático sozinho não detectou esse conflito; plan mock o revelou.

Proposta Lab: backup_retention_period=0, delete_automated_backups=true e
deletion_protection=false. Skip_final_snapshot é obrigatório/sem default:
true exige final_snapshot_identifier=null; false exige nome de snapshot explícito.
Não pressupor descarte/retensão aprovados a partir dos fixtures. Revisar política
no plano T21/T22 e obter autorização específica de destruição T27/T28; eventual
snapshot retido tem custo. Não executar apply/destroy durante esta validação.

Reprodução local usa cache/lockfile do bootstrap, sem state/tfvars privados,
provider mock e command=plan em todos os runs. Credenciais de fixture no teste
são fictícias e públicas, não utilizá-las na AWS. Na falha, o bloco para e mantém
root; após conferir/remover somente esse root, preservar logs e cache original.

```bash
(
  set -eu
  umask 077
  repo_dir=$(pwd)
  rds_validation_root=$(mktemp -d /tmp/prova-rds-XXXXXX)
  cp infra/modules/rds/*.tf "$rds_validation_root/"
  cp -R infra/modules/rds/tests "$rds_validation_root/"
  cp infra/backend/.terraform.lock.hcl "$rds_validation_root/.terraform.lock.hcl"
  printf 'provider_installation {\n  filesystem_mirror {\n    path = "%s/infra/backend/.terraform/providers"\n    include = ["registry.terraform.io/hashicorp/aws"]\n  }\n}\n' "$repo_dir" > "$rds_validation_root/provider-mirror.tfrc"
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE AWS_DEFAULT_PROFILE
  unset TF_CLI_ARGS TF_CLI_ARGS_init TF_CLI_ARGS_validate TF_CLI_ARGS_test TF_CLI_ARGS_graph TF_LOG TF_LOG_PATH
  export TF_CLI_CONFIG_FILE="$rds_validation_root/provider-mirror.tfrc"
  export AWS_CONFIG_FILE=/dev/null AWS_SHARED_CREDENTIALS_FILE=/dev/null AWS_EC2_METADATA_DISABLED=true
  printf 'Root temporário: %s\n' "$rds_validation_root"
  terraform fmt -check -recursive infra
  terraform -chdir="$rds_validation_root" init -backend=false -input=false -no-color -lockfile=readonly
  terraform -chdir="$rds_validation_root" validate -no-color
  terraform -chdir="$rds_validation_root" test -no-color
  terraform -chdir="$rds_validation_root" graph -type=plan > "$rds_validation_root/dependencies.dot"
)
```

[Resultados reais](evidencias/rds-validate.txt): primeiro test 1, conflito do
provider/16 casos skip; correção e nova execução com 17 passed/0 failed.
Fmt/init/validate/grafo/schema finais 0; oito referências no grafo sem ciclos,
cópia/lockfile idênticos, schema confirma senha sensível e tags. Init filesystem
informa unauthenticated, não novo download assinado. Testes rejeitam subnets
única/repetidas/malformadas, SG/classe/versão/identificador/nomes inválidos,
senha curta/caracteres inválidos, tags ausentes e política snapshot incoerente.
Não comprovam AZ/rotas privadas/permissões/KMS/endpoint disponível ou SQL/CRUD
na AWS. R17/R18/R19/R22 em andamento; root/plano real T21 concluídos,
execução T23 e deploy T24 conferidos; CRUD T25 permanece pendente.

### EC2 — T20 verificada localmente

[infra/modules/ec2](infra/modules/ec2/main.tf) define uma aws_instance t2.micro,
único SG EC2, pública explícita e key pair existente. Oito inputs: name, ami_id,
instance_type, public_subnet_id, ec2_sg_id, key_name, iam_instance_profile e tags.
Profile admite null ou LabInstanceProfile existente; nenhum IAM/key pair/EIP
novo. Outputs instance_id/public_ip sem credenciais; URL composta em T21.

IMDSv2 required/hop1 e tags metadata disabled; root gp3 8GiB encrypted e
delete_on_termination, tags Project/Environment/Owner/Name na instância e disco.
CPUcredits standard, monitoramento detalhado desabilitado. As configurações
seguem o [provider fixado](https://raw.githubusercontent.com/hashicorp/terraform-provider-aws/v6.65.0/website/docs/r/instance.html.markdown)
e [opções IMDS AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html).

AMI sem default: root T21 deverá selecionar Amazon Linux2023 standard/x86_64/
HVM/EBS em us-east-1, conferir raiz <=8GiB/compatibilidade t2.micro e preservar
ID selecionado na revisão. [Seleção AL2023](https://docs.aws.amazon.com/linux/al2023/ug/ec2.html).
Formato do ID não prova OS/arquitetura/disponibilidade. Subnet deve vir da
primeira pública VPC e SG do output EC2, não do RDS; conferir no root/AWS depois.
Existência/posse de vockey, acesso SSH/profile/permissões não testados aqui.

[user-data.sh](infra/modules/ec2/user-data.sh) é fixo e não recebe segredos.
Instala Docker, habilita serviço no boot e prepara /opt/prova-reservas root0755
(artefatos) e /etc/prova-reservas root0700 (ambiente futuro). Não instala
PostgreSQL local nem inicia API fictícia. Imagem, SQL, CA e ambiente RDS serão
transferidos/configurados em T24. Mudança do user-data exige recriação
(user_data_replace_on_change=true), cuja proposta sempre terá revisão/autorização.

Reprodução LOCAL (cache/lockfile bootstrap existente, sem state/tfvars reais):

```bash
(
  set -eu
  umask 077
  repo_dir=$(pwd)
  ec2_validation_root=$(mktemp -d /tmp/prova-ec2-XXXXXX)
  cp infra/modules/ec2/*.tf "$ec2_validation_root/"
  cp infra/modules/ec2/user-data.sh "$ec2_validation_root/"
  cp -R infra/modules/ec2/tests "$ec2_validation_root/"
  cp infra/backend/.terraform.lock.hcl "$ec2_validation_root/.terraform.lock.hcl"
  printf 'provider_installation {\n  filesystem_mirror {\n    path = "%s/infra/backend/.terraform/providers"\n    include = ["registry.terraform.io/hashicorp/aws"]\n  }\n}\n' "$repo_dir" > "$ec2_validation_root/provider-mirror.tfrc"
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_PROFILE AWS_DEFAULT_PROFILE
  unset TF_CLI_ARGS TF_CLI_ARGS_init TF_CLI_ARGS_validate TF_CLI_ARGS_test TF_CLI_ARGS_graph TF_LOG TF_LOG_PATH
  export TF_CLI_CONFIG_FILE="$ec2_validation_root/provider-mirror.tfrc"
  export AWS_CONFIG_FILE=/dev/null AWS_SHARED_CREDENTIALS_FILE=/dev/null AWS_EC2_METADATA_DISABLED=true
  printf 'Root temporário: %s\n' "$ec2_validation_root"
  bash -n infra/modules/ec2/user-data.sh
  python3 -B infra/modules/ec2/tests/test_user_data.py
  terraform fmt -check -recursive infra
  terraform -chdir="$ec2_validation_root" init -backend=false -input=false -no-color -lockfile=readonly
  terraform -chdir="$ec2_validation_root" validate -no-color
  terraform -chdir="$ec2_validation_root" test -no-color
  terraform -chdir="$ec2_validation_root" graph -type=plan > "$ec2_validation_root/dependencies.dot"
)
```

[test_user_data.py](infra/modules/ec2/tests/test_user_data.py) usa somente stdlib:
PATH isolado/stubs dnf, systemctl, install; não instala pacotes/serviços/diretórios
reais. Três casos verificam sequência/modos solicitados e interrupção nas falhas
de pacote/serviço. Bash -n só confere sintaxe; shellcheck não estava instalado.

[Evidência real](evidencias/ec2-validate.txt): dez runs Terraform mock/command=plan
passaram. Primeira falha Unknown condition para profile null: optional/computed
é unknown no plano; teste passou a conferir input null, vínculo source/grafo/schema,
sem alegar profile ausente na AWS. Falso positivo auxiliar set -x em comentário
corrigido para examinar comandos executáveis; falhas preservadas. Grafo sem ciclo
confere dez referências; fmt/init/validate/schema/bash-n/testes de fluxo passaram.
Init filesystem unauthenticated/lockfile readonly, nenhum download assinado novo.
Após conferir, remover somente root temporário mostrado, preservando logs/cache.
Não comprova boot/Docker/encriptação/IMDS/SSH/API/CRUD efetivos. R13/R16/R19/R22
em andamento; composição/backend/locking/plano T21 concluídos abaixo, aplicação
T23 somente após revisão/autorização T22, deploy/API T24/T25.

A submissão da disciplina ficará somente em
`entregas/provaPrimeiroBi/6325231/entrega.md` no fork separado. A data de entrega
informada é 01/10/2026. Um único PR deve ser
aberto presencialmente no dia confirmado da prova, sem commits posteriores no PR.
O relatório será escrito com base no diário e na experiência real do aluno.

## Root principal T21 — backend e plano, sem apply

`infra/main.tf` liga os quatro módulos: privadas VPC → RDS, primeira pública
→ EC2, grupos específicos → respectivas instâncias. AMI explícita consultada
na AWS: `ami-048da71c4d98f46b1`, Amazon Linux 2023 standard x86_64/HVM/EBS,
uefi-preferred e raiz8GiB, ofertada com t2.micro em us-east-1a. Essa seleção
não comprova boot/SSH; revalidar credenciais, IP e disponibilidade antes do apply.
Root preserva Terraform1.16.2/provider6.65.0 e lockfile com os hashes existentes.

São necessários `infra/terraform.tfvars.json` e `infra/backend.local.hcl`, ambos
locais ignorados/0600, já preparados nesta execução e preservados para T22.
Não sobrescrever esses arquivos nem publicar plano/JSON/cache/state. Variáveis
obrigatórias: conta STS `aws_account_id`, `ami_id`, `ssh_cidr`,
`api_allowed_cidrs`, `rds_username`, `rds_password`, `skip_final_snapshot`.
Região/perfil são restritos a us-east-1/default; os defaults restantes estão em
[variables.tf](infra/variables.tf). Conta precisa corresponder ao Learner Lab.
SSH/API usam somente IPv4 atual /32 aprovado pelo aluno. Username/password
não possuem default: foram guardados privadamente, senha aleatória gerada via
Python secrets. `sensitive` oculta a exibição, mas mantém senha no plano/state.
Política proposta Lab: skip_final_snapshot=true/final_snapshot_identifier=null,
backup0; revisar dados, custo e retenção em T22/T27, sem autorização de remoção.

Backend parcial em [providers.tf](infra/providers.tf) recebe bucket/key/region/
encrypt/dynamodb_table do output `backend_config` do bootstrap aplicado T16,
mais profile=default e allowed_account_ids contendo a conta privada conferida.
Nome da key: `prova-primeiro-bimestre-devops/terraform.tfstate`; bootstrap
continua com state LOCAL separado. Backend inicializado não implica objeto
existente: init/plan sem apply deixaram S3 sem esse objeto, state list retornou1.
T23 deve conferir a gravação efetiva; não criar state artificial para isso.

Com os arquivos privados preparados e credenciais temporárias válidas:

```bash
terraform fmt -check -recursive infra
terraform -chdir=infra init -reconfigure -input=false -backend-config=backend.local.hcl -lockfile=readonly
terraform -chdir=infra validate
terraform -chdir=infra plan -input=false -lock-timeout=60s -detailed-exitcode -out=infra.tfplan
```

O plan retorna2 quando há mudanças propostas (0 sem mudanças, 1 erro); conferir
o código e revisar o plano antes de avançar. Nenhum comando acima faz apply.
Nesta execução, init usou TF_CLI_CONFIG_FILE temporário0600 com filesystem_mirror
apontando o cache já instalado em `infra/backend/.terraform/providers`; esse
arquivo privado está em `/tmp/devops-t21-provider-mirror.tfrc`. Para repetir nesta
mesma máquina com o mesmo cache, prefixar init com
`TF_CLI_CONFIG_FILE=/tmp/devops-t21-provider-mirror.tfrc`. Instalação local reportou
provider não autenticado: hashes do lockfile previamente obtido foram mantidos,
sem alegar assinatura nova. Não alterar config global/versões para ocultar erros.

[outputs.tf](infra/outputs.tf) define ID/IP EC2, hostname/porta RDS e URL API;
só porta5432 é conhecida no plano, demais valores dependem do apply e URL não
comprova serviço. [Locking T21](evidencias/backend-locking.txt) registra o teste
real: pausa curta no próprio plano com lock observado, segundo plano recusado,
retomada em finally e liberação natural. Não editar locks manualmente nem usar
-lock=false. DynamoDB permanece exigido na prova apesar do aviso de depreciação
na [documentação oficial](https://developer.hashicorp.com/terraform/language/backend/s3).

## Revisão principal T22 — autorizada após apresentação

[Revisão completa](evidencias/infra-revisao.txt) apresenta o plano concreto
23create/0update/0delete, conta terminada5811/default/voclabs/us-east-1, SSH/API
somente seu IP atual/32 e PostgreSQL privado somente SGEC2. Hash plano T21
preservado, S3/DynamoDB existentes conferidos, lock ausente. Na revisão T22
ainda não havia apply; T23 foi autorizada/executada conforme registro abaixo.

Estimativa USD, arredondada para cima, inclui EC2/RDS/discos/IPv4 e cenário
pequeno backend:6hUS$0.24,24hUS$0.94,730hUS$28.21. Supõe RDS sem CPU excedente
e tráfego interAZ/saídas extras não medidos; custos adicionais variam, sem
franquia/crédito descontado. Detalhes/fontes/cálculo/falhas reais na evidência;
saldo atual Lab não verificado. Código Terraform e plano privado preservados.

T22 recebeu resposta explícita em29/09/2026 sobre o escopo apresentado e foi
verificada. Provisionamento T23 conferido no registro abaixo.
[AGENTS regra10](AGENTS.md) exige “obter autorização para aquele escopo”; o
bootstrap foi seguido da aprovação principal recebida para T23. Plano, conta,
IP e backend foram revalidados antes de aplicar. Deploy e teardown terão etapas
próprias. Registro da revisão/decisão acompanha o marco T23 em um commit coerente.

## Infraestrutura AWS T23 — provisionada e conferida

Após a apresentação de plano, hash, acessos e custo, o aluno autorizou T23 em
29/09/2026. O apply retornou **0: 23 criações, zero alterações e zero exclusões**.
[Rede](evidencias/aws-rede.txt), [RDS](evidencias/aws-rds.txt),
[segurança](evidencias/aws-seguranca.txt) e [outputs/state](evidencias/terraform-outputs.txt)
registram comandos, horários, códigos, hashes e consultas reais sanitizadas.

A EC2 `i-0f4b59a8181537b78` está running, com status checks ok/ok. É t2.micro na
primeira subnet pública em us-east-1a, com IMDSv2, EBS gp3 de 8 GiB encriptado
e LabInstanceProfile existente. O RDS PostgreSQL 16.15/db.t3.micro está available,
privado e encriptado, com gp3 de 20 GiB e Single-AZ. Seu subnet group usa as duas
privadas; o banco foi criado em us-east-1a. SSH22/API3000 aceitam somente seu
IPv4 atual /32; PostgreSQL5432 aceita somente o SG da EC2. Grupos, rotas e tags
correspondem ao aprovado. Saldo atual e duração restante do Lab não foram inferidos.

Outputs reais: IP EC2 `13.220.113.41`, endpoint RDS
`prova-6325231-rds.cn2tjjbiwom3.us-east-1.rds.amazonaws.com`, porta5432 e URL
`http://13.220.113.41:3000`. Na conclusão de T23 a API ainda não estava implantada;
T24 abaixo agora comprova SSH/Docker/SQL TLS e /health. CRUD continua T25.
Os outputs, isoladamente, não comprovam o serviço.

O objeto de state principal no S3 foi confirmado: versionado, AES256 e não vazio.
head-object/list-object-versions e state pull privado passaram; há 23 recursos
managed. O lock DynamoDB foi liberado após apply e plano, preservando o state
bootstrap local separado. O plano posterior retornou 0/No changes e foi salvo
em postapply.local.tfplan ignorado/0600; o plano aprovado original foi preservado.
Não publicar plano, state, JSON, cache ou tfvars com dados sensíveis, nem remover
o backend ou destruir recursos nesta etapa.

T24 foi a tarefa seguinte e está concluída abaixo. Próxima: **T25**,
verify-aws.py e CRUD/persistência efetivos na EC2/RDS.
Os recursos continuam ativos e podem consumir créditos; a estimativa T22 não é
um teto de custo nem uma fatura.

## Deploy T24 — imagem por SSH, RDS TLS e systemd

O deploy usa `scripts/deploy-api.py`, `deploy/install-remote.sh` e
`deploy/prova-reservas-api.service`. O script confere conta/role, EC2 do projeto,
IP atual /32, RDS privado e ambiente antes de transferir qualquer segredo.
Não executa Terraform, não cria IAM e não altera grupos de segurança.

A imagem contém a migração `node src/migrate.js`; não há uma segunda cópia de SQL
para transferir. Ela executa pela EC2 no RDS, com `PGSSL=true`, bundle CA oficial
e `rejectUnauthorized=true`. O ambiente é root:root/0600 em diretório 0700;
a CA pública tem modo 0644 para o usuário node/UID1000 lê-la. O systemd gerencia
reinício e boot; o container usa `--rm`, sem política Docker concorrente.

Dependências: Python3 stdlib, Docker local, AWS CLI autenticada no Learner Lab,
OpenSSH (ssh/scp/ssh-keygen), curl, EC2 existente com Docker e RDS available.
Para reproduzir o build, escolha um commit existente que contenha `app/`:

```bash
umask 077
DEPLOY_DIR=$(mktemp -d /tmp/prova-deploy-local-XXXXXXXX)
export DEPLOY_DIR
SOURCE_COMMIT=$(git rev-parse HEAD)
export SOURCE_COMMIT
git archive --format=tar -o "$DEPLOY_DIR/context.tar" "$SOURCE_COMMIT" app
tar -xf "$DEPLOY_DIR/context.tar" -C "$DEPLOY_DIR"
docker build --platform linux/amd64 \
  --label "org.opencontainers.image.revision=$SOURCE_COMMIT" \
  -t "prova-reservas:${SOURCE_COMMIT:0:12}" "$DEPLOY_DIR/app"
docker save -o "$DEPLOY_DIR/image.tar" "prova-reservas:${SOURCE_COMMIT:0:12}"
curl --fail --silent --show-error \
  -o "$DEPLOY_DIR/rds-ca.pem" \
  https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem
```

Derive o ID do conteúdo de configuração OCI do arquivo: Docker29/containerd local
e Docker25 clássico da EC2 apresentam identificadores de níveis diferentes.
O script valida esse ID, o commit, linux/amd64, usuário node e checksum do tar.

```bash
IMAGE_ID=$(python3 -B - <<'PY'
import os, runpy
from pathlib import Path
module = runpy.run_path('scripts/deploy-api.py')
print(module['archive_identity'](Path(os.environ['DEPLOY_DIR']) / 'image.tar')[0])
PY
)
IMAGE_SHA256=$(sha256sum "$DEPLOY_DIR/image.tar" | cut -d ' ' -f 1)
python3 -B - <<'PY'
import json, os, subprocess
from pathlib import Path
context = json.loads(Path('infra/terraform.tfvars.json').read_text())
outputs = json.loads(subprocess.check_output(['terraform', '-chdir=infra', 'output', '-json']))
env = {'PGHOST': outputs['rds_endpoint']['value'], 'PGPORT': '5432',
       'PGDATABASE': 'reservas', 'PGUSER': context['rds_username'],
       'PGPASSWORD': context['rds_password'], 'PGSSL': 'true',
       'PGSSLROOTCERT': '/etc/ssl/certs/rds-ca.pem', 'PORT': '3000',
       'NODE_ENV': 'production'}
path = Path(os.environ['DEPLOY_DIR']) / 'api.env'
path.write_text(''.join(k + '=' + value + '\n' for k, value in env.items()))
path.chmod(0o600)
PY
```

Configure `SSH_ACCESS_KEY` e `SSH_KNOWN_HOSTS` com caminhos privados 0600.
A chave de host deve ser comparada com a fingerprint publicada no console AWS
confiável da própria instância; `ssh-keyscan` sozinho não autentica o servidor.
O deploy exige `StrictHostKeyChecking=yes`. Pode usar a chave privada vockey
existente. Como ela não foi localizada nesta execução, foi usada chave ed25519
local temporária e EC2 Instance Connect, já permitido pela role existente.
Para esse método, gere a chave fora do Git com `ssh-keygen -t ed25519 -N '' -f`
e seu caminho escolhido, e acrescente `--instance-connect` ao comando abaixo.
A chave pública é renovada por conexão; nenhuma nova key pair/IAM é criada.

```bash
python3 -B scripts/deploy-api.py \
  --instance-id i-0f4b59a8181537b78 \
  --identity-file "$SSH_ACCESS_KEY" --known-hosts "$SSH_KNOWN_HOSTS" \
  --aws-context infra/terraform.tfvars.json \
  --env-file "$DEPLOY_DIR/api.env" --ca-file "$DEPLOY_DIR/rds-ca.pem" \
  --image-archive "$DEPLOY_DIR/image.tar" --image-id "$IMAGE_ID" \
  --image-sha256 "$IMAGE_SHA256" --source-commit "$SOURCE_COMMIT" \
  --instance-connect
```

Com vockey, retire `--instance-connect`. O script retorna 0 apenas após instalar,
migrar e confirmar /health local; falha retorna 1 sem imprimir stderr arbitrário
que possa conter dados privados. Staging remoto exclusivo é removido em finally;
ambiente de runtime permanece protegido. O manifesto público remoto fica em
`/opt/prova-reservas/deployment.json`, sem senha ou hash do arquivo de segredos.

Verificação local do instalador: `python3 -B scripts/tests/test_deploy.py`,
`bash -n deploy/install-remote.sh` e
`systemd-analyze verify deploy/prova-reservas-api.service`.
Evidências reais e resultado AWS estão em [ec2-deploy.txt](evidencias/ec2-deploy.txt)
e [health-aws.txt](evidencias/health-aws.txt). O acesso HTTP continua limitado ao
IP /32 aprovado; mudar de rede exige revisar acesso antes de repetir comandos.

Resultado real em29/09/2026: deploy repetido0, migração preservou schemaOID16451/
4colunas/3constraints/contagem0. SQL confirmou PG16.15/TLSv1.3 no RDS privado.
Serviço enabled/active, UID1000, nenhum PostgreSQL container. Reboot CLI0 mudou
boot_id e /health voltou200 automaticamente; três chamadas externas passaram200.
Onze testes locais passaram0; falhas CRLF/digest OCI/consulta console preservadas.
Imagem app construída do commit4895f98590a44d20917c872ddf9b77135ccf4456,
arquivoSHA25659f81d9f0817f4a9a0c291504cebf6f5951965181cb05535d4964d1a7cb6b518.
T24 verificada, sem bloqueio. **T25 é a próxima**: seis rotas/CRUD/persistência
real de uma reserva e verify-aws.py. Tabela vazia nesta etapa não comprova isso.
Recursos continuam ativos/faturáveis; sem teardown/push/merge/PR nesta execução.

## Verificação AWS T25 — execução e histórico de retomada

`scripts/verify-aws.py` usa Python3 stdlib, AWS CLI e OpenSSH; depende da API T24,
RDS e Docker já existentes. Requer perfil default renovado/us-east-1/voclabs,
contexto `infra/terraform.tfvars.json` privado0600, chaveSSH e known_hosts0600
com fingerprint validada conforme T24. Não executa Terraform/provisionamento/
destruição ou mudança IAM/SG. Reinicia somente a API própria para testar
persistência; usa marcadorUUID/IDs exclusivos e limpeza SQL em finally.

```bash
python3 -B scripts/tests/test_verify_aws.py
python3 -B scripts/verify-aws.py \
  --instance-id i-0f4b59a8181537b78 \
  --identity-file "$SSH_ACCESS_KEY" --known-hosts "$SSH_KNOWN_HOSTS" \
  --aws-context infra/terraform.tfvars.json --instance-connect
```

Com chave vockey existente, retire `--instance-connect`. O script usa IP público
atual obtido da EC2, valida IP de origem/SGs/RDS e compara CRUDHTTP com SQLTLS.
JSON mantém DD-MM-YYYY, SQL usa DATEISO. Saída0 exige todos os aceites e limpeza;
falha1 mostra etapa e, se necessário, marcador/IDs para recuperar limpeza.
Não imprime senha/ambiente/ARN nem stderr arbitrário de AWS/SSH.

Em29/09/2026: dez testes locais0 e CLIhelp0. Execução real retornou1 na consulta
EC2(254), UnauthorizedOperation/explicitdeny/voc-cancel-cred. STS0 reconheceu
conta, mas não provou permissãoEC2. Nenhum HTTP/SQL/restart/reserva foi executado.
[api-aws.txt](evidencias/api-aws.txt), [rds-crud.txt](evidencias/rds-crud.txt) e
adendo [aws-seguranca.txt](evidencias/aws-seguranca.txt) registram bloqueio real.
T25 está bloqueada: atualizar as três credenciais temporárias locais do perfil
default com a sessão renovada, sem enviar valores pelo chat; revalidar e executar.
Não alterar IAM/SCP/roles para contornar. Próximo passo é retomar T25; T26 ainda
aguarda esse aceite e a contribuição do aluno para o relatório. Resultados T24
são históricos, não validação T25. Sem push/merge/PR/teardown nesta etapa.

### Estado atual T25 — verificada após recuperar credenciais e EC2

O bloqueio anterior foi resolvido. A auditoria conferiu EC2/RDS, S3/DynamoDB,
state e locking. A EC2 estava parada; iniciei a mesma instância, sem recriação
ou mudança de IAM/SG. A API voltou automaticamente com a mesma imagem.
IP atual: **54.234.84.228**; URL: **http://54.234.84.228:3000**, restrita ao seu
IP /32 aprovado. `13.220.113.41` nas capturas T23/T24 é o endereço histórico.
O stop/start pode mudar o IPv4 público, conforme a [AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Stop_Start.html).

O console atual omitiu a fingerprint. Comparei a chave com aquela autenticada
pelo console em T24 e mantive `StrictHostKeyChecking=yes`. O arquivo privado
known_hosts recebeu apenas a associação ao IP novo. O plano refresh-only
revisado sincronizou state e outputs sem ações sobre recursos: apply 0, nova
versão S3 AES256 e lock liberado. O plano posterior passou com `No changes`.
O verificador consulta o IP e o endpoint RDS atuais pela AWS CLI.

Dez testes locais passaram. A execução AWS retornou 0 e confirmou as seis
rotas, erros 400/404 e SQL no RDS PostgreSQL 16.15 com TLS 1.3 e certificado
verificado. Datas JSON `29-02-2024` e `01-10-2026` foram comparadas com
`DATE` SQL `2024-02-29` e `2026-10-01`. A reserva ID 3 permaneceu igual após
reiniciar somente a API: novo container, mesma imagem e registro idêntico.

O negativo controlado retornou 1 ao detectar um status SQL diferente da
expectativa deliberadamente errada. A limpeza removeu somente seu UUID/ID 4.
A sentinela ID 1 foi preservada por HTTP/SQL após ambos os testes e depois
removida pelo próprio teste. A fixture integrada retornou 0 e confirmou que
nenhum registro próprio de teste permaneceu.

[Auditoria e recuperação](evidencias/aws-retomada-t25.txt),
[CRUD HTTP](evidencias/api-aws.txt), [SQL e persistência](evidencias/rds-crud.txt)
e [segurança](evidencias/aws-seguranca.txt) preservam bloqueios, falhas e correções.
Para conferir uma rejeição sem tocar AWS, execute o comando T25 com um caminho
inexistente em `--known-hosts`: retorna 1 antes de consultar a conta ou criar
registros. Os testes locais cobrem regras SG inseguras, datas divergentes e
limpeza incompleta. Não envie credenciais pelo chat.

T26 factual foi verificada: [relatorio.md](relatorio.md) tem quatro respostas
de dez linhas de conteúdo conferidas localmente. Por pedido do aluno, a
contribuição pessoal e sua revisão ficam na tarefa pendente T30A, antes do
checklist final T31. R25 permanece parcial. Próxima tarefa: **T27**. Sem
destroy, push, merge ou PR nesta etapa; recursos ativos podem consumir créditos.

### Estado T27 — plano de destruição bloqueado

A revisão local de 12 evidências e de padrões conhecidos de segredos está em
[evidencias/teardown-revisao.txt](evidencias/teardown-revisao.txt). STS confirmou
a conta do Lab, mas DynamoDB recusou o lock e EC2/RDS recusaram consultas;
`plan -destroy` saiu 1 sem gerar plano. T27 permanece bloqueada, R23 pendente.
Renovar as credenciais temporárias do perfil default localmente, revalidar
acessos e então gerar/revisar o plano antes de decidir descarte ou retenção de
snapshot. Nenhum destroy ou autorização de dados foi inferido.

### T27 — plano disponível para decisão

Após renovar a sessão, STS/DynamoDB/EC2/RDS responderam. O plano privado
`infra/destroy-t27.tfplan` (ignorado/0600) propõe somente 23 exclusões
da infraestrutura principal; hash e revisão sanitizada em
[evidencias/teardown-revisao.txt](evidencias/teardown-revisao.txt). O backend
S3/DynamoDB permanece ativo. O RDS seria apagado sem snapshot final; uma
consulta atual de linhas não foi possível pela API. T27 aguarda decisão
específica do aluno sobre dados/snapshot e autorização deste plano; T28 não
foi iniciada.

### T27 — autorização recebida

O aluno autorizou explicitamente excluir os dados do RDS sem snapshot final
e os 23 recursos da infraestrutura principal revisada. Um segundo plano
confirmou os mesmos endereços, ações, IDs e política de snapshot do plano
aprovado; detalhes e hashes em
[evidencias/teardown-revisao.txt](evidencias/teardown-revisao.txt). T27 está
verificada, T28 é a próxima tarefa. Backend S3/DynamoDB e versões de state
permanecem fora deste escopo. Nenhum destroy havia sido feito ao fechar T27.

### T28 — infraestrutura principal removida

Após autorização explícita do aluno, o plano privado aprovado foi aplicado
com exit 0: **23 recursos destruídos, zero adicionados/alterados**. State
remoto principal ficou com zero recursos e outputs. A AWS mostra EC2
`terminated`, RDS/VPC/SGs/subnets/rotas/gateway ausentes; zero snapshots
associados, disco raiz, volumes do projeto ou ENIs da VPC antiga.
[evidência Terraform](evidencias/terraform-destroy.txt) e
[auditoria AWS](evidencias/aws-pos-destroy.txt) preservam resultados reais.
S3/DynamoDB/backend e versões de state continuam ativos para T29/T30;
**T29 é a próxima tarefa** e requer revisão/autorização separada antes de
qualquer exclusão do backend. Cópias privadas dos states ficam fora do Git.
R23 permanece parcial até a limpeza do backend.


### T29 — inventário e plano de limpeza do backend

Na conta do Learner Lab terminada em 5811, `us-east-1`, o state principal
permanece vazio. O bucket privado contém **um objeto atual e seis versões** da
chave de state (257210 bytes no total), sem delete markers; a tabela de lock
está ativa e a leitura encontrou apenas o item de checksum, sem lock ativo
observado. O state local do bootstrap tem quatro recursos managed. O
`plan -destroy` retornou exit 2 com **quatro exclusões**: tabela DynamoDB,
versionamento, encriptação e bloqueio público do S3. O bucket físico está fora
do state managed e exige exclusão CLI separada após remover todas as versões.
O plano, inventário e correção de uma primeira contagem incorreta estão em
[evidencias/backend-teardown.txt](evidencias/backend-teardown.txt). Manifesto,
plano binário e cópias de state ficam privados fora do Git.

A limpeza irreversível do histórico remoto requer autorização **separada**:
revalidar conta/state/lock/versões; apagar somente as seis versões da chave
deste projeto; aplicar o plano de quatro exclusões; apagar o bucket físico
vazio; conferir ausência de S3/DynamoDB. Se o inventário mudar, revisar antes
de excluir. T29 está em andamento aguardando essa decisão; T30 não começou.
Enquanto o backend existir, pode consumir créditos do Lab. Nenhum saldo atual
ou custo real foi medido nesta tarefa.


### T30 — backend removido no Learner Lab

O aluno autorizou separadamente a perda das seis versões de state, a remoção
dos quatro recursos do bootstrap e a exclusão do bucket físico. O preflight
reconfirmou conta terminada em 5811, `us-east-1`, state principal vazio,
manifesto de versões idêntico, apenas checksum no DynamoDB e hash do plano.
Seis `delete-object --version-id` retornaram sucesso; a listagem passou a
zero versões, marcadores e objetos. O `terraform apply` do plano salvo retornou
**0 added, 0 changed, 4 destroyed**; o state local do bootstrap ficou vazio.
O bucket próprio foi excluído por CLI após conferir que estava vazio.
`head-bucket` retornou 404, e a tabela DynamoDB retornou
`ResourceNotFoundException`; ambos também estavam ausentes das listas da
conta. Detalhes, falhas corrigidas nos verificadores e hashes dos logs privados
estão em [evidencias/backend-teardown.txt](evidencias/backend-teardown.txt).
Cópias privadas dos states permanecem fora do Git para auditoria. T29/T30
estão verificadas; T30A, a contribuição pessoal do aluno ao relatório, é a
próxima tarefa. Nenhum push, merge ou PR ocorreu nesta etapa.
