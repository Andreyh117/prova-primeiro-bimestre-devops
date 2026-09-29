# Requisitos e critérios de aceite

## Fontes, escopo e estado

[Enunciado original](https://github.com/AleTavares/devops_20262/blob/637fef4f422a4a0a0a2a074d24374c7111a2e862/provas/prova-primeiro-bimestre.md)
e [aula 07](https://github.com/AleTavares/devops_20262/blob/637fef4f422a4a0a0a2a074d24374c7111a2e862/aula-07/aula-07.md),
consultados em 27/09/2026. O conteúdo de ambos coincidiu com o commit
`637fef4f422a4a0a0a2a074d24374c7111a2e862`, também citado no guia existente.

`P` indica exigência do professor; `U`, instrução do aluno. Recomendações e escolhas
técnicas aparecem separadamente no design. O projeto é a API de Reservas desta
prova, individual; não inclui funcionalidades do contexto PULSAR.

Estados: `pendente`, `em andamento`, `verificado`, `bloqueado`. Em 28/09/2026,
o aluno revisou as specs e pediu a próxima tarefa, definindo `DD-MM-YYYY` (R32).
R28 foi verificado pela conferência documental e revisão humana T03; T04 passou
na verificação Git/documental local. T06 passou com PostgreSQL 16.15 real:
18 testes, migração, configuração negativa e limpeza. T07 passou 35 testes:
POST/GET HTTP reais, validação e leitura SQL independente, com limpeza completa.
T08 passou 48 testes com CRUD completo, health/503 e falhas reais do banco.
Restart da API nativa foi verificado em T09; Dockerfile/contexto/runtime em T10.
Compose/ambiente/healthchecks foram verificados em T11 com CRUD/SQL reais.
T12 comprovou persistência após recriar containers mantendo o volume.
Módulos Terraform/deploy AWS continuam pendentes; T13 verificou preflight por
consultas de leitura e sonda local. T14 implementou bootstrap e validou plano
real de cinco criações, sem apply/recurso criado; backend/locking ainda parciais.
Nome, RA e entrega foram informados pelo aluno; T05 foi verificada com commit
inicial e feature branch reais. Seis commits reais foram confirmados em T09;
R02 permanece em andamento pelo merge pendente em T32. A captura T05 é histórica. Caminhos de evidência são
planejados, exceto arquivos efetivamente criados e registrados em tasks/diário.

## Matriz requisito → verificação → evidência → estado

| ID / origem | Requisito e aceite observável | Verificação | Evidência esperada | Estado |
|---|---|---|---|---|
| R01 / P | Repositório próprio público `prova-primeiro-bimestre-devops`, README na raiz com nome completo, RA e descrição; estrutura `app/`, `infra/`, `evidencias/` e `relatorio.md` conforme enunciado. | Conferir arquivos e acesso público ao GitHub sem login; placeholders resolvidos antes da entrega. | README, URL pública e `evidencias/entrega-checklist.txt`. | em andamento |
| R02 / P | Pelo menos seis commits reais usando Conventional Commits; feature branch e merge demonstráveis. | Contar commits, revisar mensagens e grafo; localizar commits exclusivos da feature e merge. | `evidencias/git-workflow-inicial.txt` (T05); `evidencias/git-auditoria.txt` (auditoria parcial); `evidencias/git-log.txt` e `evidencias/git-branches.txt` (final). | em andamento |
| R03 / P+U | `.gitignore` protege node_modules, .env, .terraform, state/backups, PEM, planos binários e variáveis locais sensíveis; nenhum segredo rastreado. | `git check-ignore` em caminhos representativos e revisão de arquivos staged/rastreados, incluindo evidências. | `.gitignore` e `evidencias/segredos-checklist.txt`, sem segredos. | verificado |
| R04 / P | API Node.js/Express com `id`, `cliente`, `data`, `status` e POST/GET `/reservas`, GET/PUT/DELETE `/reservas/:id`. | Criar, listar, buscar, atualizar e excluir a mesma reserva; verificar corpo e persistência. | `evidencias/api-local.txt`, `evidencias/api-aws.txt`. | em andamento |
| R05 / P | POST valida campos obrigatórios; GET por ID inexistente retorna 404. | Omitir cada obrigatório, enviar vazio/inválido e buscar ID ausente; não gravar entradas rejeitadas. As demais regras são decisões D01–D04. | Testes de integração e logs de CRUD. | em andamento |
| R06 / P | CRUD usa PostgreSQL real localmente e RDS na nuvem, lendo e gravando no banco; sem armazenamento em memória substituindo persistência. | Conferir a linha por SQL, reiniciar a API e consultá-la novamente nos dois ambientes. | `evidencias/postgres-local.txt`, `evidencias/rds-crud.txt`. | em andamento |
| R07 / P | GET `/health` implementado e usado pelo healthcheck da API no Compose. | Inspecionar healthcheck e resposta HTTP; para a decisão D05, testar também indisponibilidade do banco. | `evidencias/health-local.txt`, `evidencias/health-aws.txt`, Compose. | em andamento |
| R08 / P | `app/Dockerfile` funcional, usuário não-root e `app/.dockerignore`; build e execução comprovados. Multi-stage é recomendado, não obrigatório. | Build real, UID não zero, API executada em container e banco real acessível. | `evidencias/docker-build.txt`, `evidencias/docker-run.txt` (T10 real, UID 1000 e HTTP/SQL). | verificado |
| R09 / P | `docker-compose.yml` inicia API + PostgreSQL com um comando após configurar o ambiente. | `docker compose up --build --wait`; ambos saudáveis e CRUD funcional. | `evidencias/compose-ps.txt`, `evidencias/api-local.txt` (T11 real). | verificado |
| R10 / P | Volume nomeado mantém os dados PostgreSQL. | Criar reserva, recriar containers sem remover volume e confirmar linha por API e SQL. | `evidencias/compose-persistencia.txt`. | verificado |
| R11 / P | Rede bridge customizada; healthcheck PostgreSQL; API depende do banco com condição de saúde. | Conferir configuração/rede efetiva e subida desde banco parado; API só inicia após banco saudável. | Compose e `evidencias/compose-rede-saude.txt` (T11 real). | verificado |
| R12 / P | `.env.example` versionado sem senhas reais; `.env` ignorado. | Comparar nomes de variáveis com app/Compose; validar ambiente sem imprimir valores. | `.env.example`, `.gitignore` e compose-rede-saude.txt (config/mapeamentos/ignores reais). | verificado |
| R13 / P | AWS Academy Learner Lab em `us-east-1`, credenciais temporárias com token; nenhum IAM user/group/role novo; usar LabRole/LabInstanceProfile existentes quando necessário. | Confirmar conta/região e expiração sem divulgar credenciais; revisar plano e instance profile efetivo. | `evidencias/aws-preflight.txt` (T13 leitura/Lab/profile); aws-seguranca/plano futuros. | em andamento |
| R14 / P | Módulo `vpc` cria VPC e subnets públicas/privadas em duas AZs. | Plano e AWS mostram duas subnets públicas, duas privadas, AZs distintas e rotas coerentes. | infra/modules/vpc e vpc-validate.txt (T17 local); plan composto T21 e aws-rede.txt efetivo T23 futuros. | em andamento |
| R15 / P+U | Módulo `security-group`: EC2 22/3000 com menor privilégio, SSH restrito ao IP/CIDR do aluno e API aos clientes necessários; RDS 5432 somente do SG da EC2. | Inspecionar regras e origens em plano/AWS; negar SG do RDS com CIDR público ou origem adicional. | infra/modules/security-group e security-group-validate.txt (T18 local); plano composto T21 e aws-seguranca.txt efetivo T23 futuros. | em andamento |
| R16 / P | Módulo `ec2`: t2.micro pública executando a API; LabInstanceProfile se houver acesso a serviços. | Conferir tipo/subnet/IP/profile e chamar as seis rotas na EC2 após deploy. | infra/modules/ec2 e ec2-validate.txt (T20 local); ec2-deploy.txt/api-aws.txt reais futuros. | em andamento |
| R17 / P | Módulo `rds`: PostgreSQL db.t3.micro provisionado e funcional como banco da API na nuvem. | RDS `available`; SQL pela EC2 confirma dados do CRUD e o endpoint realmente usado pela API. | infra/modules/rds e rds-validate.txt (T19 local); rds-crud.txt/aws-rds.txt reais futuros. | em andamento |
| R18 / P | RDS `publicly_accessible=false`, `storage_encrypted=true`, subnet group nas privadas e acesso só do SG EC2 na 5432. | Conferir valores efetivos em AWS, subnet group e SG, além de revisar Terraform. | rds-validate.txt (T19 local); aws-rds.txt/aws-seguranca.txt efetivos futuros. | em andamento |
| R19 / P | `infra/modules/{vpc,security-group,ec2,rds}`; composição de outputs/inputs em `infra/main.tf`; variables/outputs/providers; tags e outputs IP EC2, endpoint RDS e URL API. | `validate`, plano e revisão dos vínculos; tags em todos os recursos que suportam tagging e outputs sem senhas. | Bootstrap T14/plano em backend-validate.txt/backend-plan.txt e módulos vpc T17/vpc-validate.txt e security-group T18/security-group-validate.txt e rds T19/rds-validate.txt e ec2 T20/ec2-validate.txt; root principal futuro e `evidencias/terraform-validate.txt`, `evidencias/terraform-plan.txt`, `evidencias/terraform-outputs.txt`. | em andamento |
| R20 / P | State principal remoto em S3 versionado/encriptado; locking DynamoDB ativo. | Conferir configuração efetiva do bucket/tabela, objeto de state e uso de lock no backend, sem divulgar conteúdo do state. | backend.txt (T16 S3/DynamoDB reais após SCP); backend-locking.txt futuro T21 (state remoto/lock efetivo). | em andamento |
| R21 / U; dica P | Criar `infra/backend` antes de inicializar o backend S3 principal; preservar state bootstrap separado. | Registrar sequência: bootstrap init/validate/plan, apply autorizado, conferência de S3/DynamoDB, init principal. | backend-validate.txt/backend-plan.txt (T14 local), backend.txt/diário (T16 apply/conferência reais, bucket externo); init principal futuro T21. | em andamento |
| R22 / P+U | Evidências reais de build, execução, Compose, `terraform validate` e `plan` sem erros, CRUD local e nuvem; separar estática/local/AWS. | Cada aceite tem comando, ambiente, resultado e arquivo real; plano não serve como prova de CRUD/deploy. | Arquivos em `evidencias/` com índice no README. | em andamento |
| R23 / P+U | Executar `terraform destroy` após coletar evidências; preparar limpeza do backend separadamente, preservando state até encerrar. | Plano de destruição revisado/autorizado, destroy principal real e ausência de recursos confirmada; explicitar retenções/pendências do backend. | `evidencias/terraform-destroy.txt`, `evidencias/aws-pos-destroy.txt`, `evidencias/backend-teardown.txt`. | pendente |
| R24 / P | Usar Kiro ou outra LLM como copiloto para parte da solução e documentar uso crítico. | Histórico e diário identificam Codex, prompts, revisão humana, geração e correções efetivamente ocorridas. | `docs/diario-ia.md`, `relatorio.md`. | em andamento |
| R25 / P | `relatorio.md` identifica IA no início; quatro respostas dissertativas com mínimo de dez linhas por questão sobre jornada 01–07, IA/manual, arquitetura/segurança/Lab e validação/responsabilidade. | Conferir quatro respostas, extensão e coerência com diário/evidências; aluno contribui com experiência pessoal. | `relatorio.md` e checklist. | pendente |
| R26 / P | No fork da disciplina, PR altera apenas `entregas/provaPrimeiroBi/6325231/entrega.md`, com link do projeto e evidências; modelo traz aluno, RA, data, IA e checklist. | Conferir diff contra base correta; links funcionais e somente o arquivo de entrega no PR. | Arquivo no fork separado e diff de submissão. | pendente |
| R27 / P | Apenas um PR por aluno, aberto presencialmente no dia da prova; nenhum commit posterior no PR. | Confirmar data com aluno/professor antes da abertura e revisar submissão completa; registrar URL/base/head/commit final. | PR e `evidencias/entrega-checklist.txt`; abertura fora desta etapa. | pendente |
| R28 / U | Primeiro inspecionar sem sobrescrever, produzir AGENTS e três specs, separar exigências/decisões e obter revisão antes de código; tarefas pequenas e matriz sincronizada. | Conferência documental T01/T02; aprovação do aluno T03. | Os quatro documentos e registro da etapa em tasks. | verificado |
| R29 / U | Scripts reproduzíveis documentam dependências, saída clara e exit code não zero na falha; não provisionam/destruem infraestrutura. | Testar caso válido e falha controlada; revisar efeitos de cada script e seu uso no README. | scripts/verify-api.py (T09), verify-persistence.py/compose-persistencia.txt (T12); scripts AWS/entrega futuros. | em andamento |
| R30 / U | Diário registra prompts, decisões, correções e resultados reais; nunca inventar identidade, experiência, evidências ou histórico. | Confrontar diário/relatório com comandos, Git e relato do aluno; usar placeholders enquanto faltarem informações. | `docs/diario-ia.md`, specs e relatório. | em andamento |
| R31 / U | Antes de provisionar/destruir, apresentar plano e obter autorização específica; sem auto-approve ou apagamento antecipado de state/dados. | Diário registra revisão, escopo e autorização antes de cada operação; scripts só verificam. | backend-revisao.txt (T15 plano/custo/autorização recebida), backend.txt (T16 recuperação no mesmo escopo); principal/teardown exigem nova revisão/autorização. | em andamento |
| R32 / U | Data civil em `DD-MM-YYYY` nas entradas POST/PUT e nas respostas JSON de reservas; PostgreSQL permanece DATE. | Testar datas válidas e bissextas, rejeitar impossíveis/outros formatos e conferir ida/volta via SQL sem deslocamento de dia. Decisão D02 revisada. | app/test/api.test.js e api-local.txt (POST/GET/PUT local); AWS futuro. | em andamento |

## Informações confirmadas e pendências

- Nome informado: Andreyh Rodrigues de Souza; RA 6325231; data de entrega
  informada: 01/10/2026. README preenchido; usar caminho do RA na futura submissão.
  A abertura presencial do único PR permanece em T34, sem autorização antecipada.
- Origin local observado: `https://github.com/Andreyh117/prova-primeiro-bimestre-devops.git`.
  Acesso, visibilidade pública e fork da disciplina serão verificados mais tarde.
- IP/CIDR de SSH/API, key pair, credenciais válidas, saldo do Lab, AZs e engine
  RDS disponíveis serão levantados antes dos planos AWS.
- O texto introdutório sobre liberação uma semana antes não autoriza envio
  antecipado: a regra explícita determina PR presencial somente no dia da prova.
- A aula 07 cita `processo-spec.md` para seu TF; esse arquivo não é uma exigência
  desta prova. Aqui specs/diário são organização solicitada pelo aluno.
- Sem frontend, pagamentos, autenticação, agendamento ou funcionalidades de
  outros projetos. Não há regra de conflito de reservas exigida pelo professor.
- Pesos do enunciado: Git+Docker 15%, Compose 10%, Terraform 25%, uso de IA 10%,
  relatório 40% (10% por questão). Não deixar relatório para uma simulação final.

## Como interpretar conclusão

`verificado` em T02 significa somente documentos produzidos e conferidos.
R04–R23 e R32 só podem ser marcados conforme seus testes reais. R28 foi concluído
com a revisão T03, sem comprovar implementação. A entrega completa exige resolver
toda a matriz, inclusive destroy e submissão no momento correto. Na conclusão
de T02 não havia execução AWS; T16 agora comprovou somente bootstrap S3/DynamoDB.
Requisitos contínuos, como R03, devem ser revalidados antes do Git.

## Evidência parcial T06

Schema e conexão foram validados localmente com 18 testes reais/configuração,
comandos e resultados em `evidencias/t06-dependencias.txt`,
`evidencias/t06-postgres-local.txt` e `evidencias/t06-falha-controlada.txt`.
R04/R06/R29/R32 estão em andamento: a base e os testes do banco existem, mas
PUT/DELETE/health, scripts restantes e RDS continuam futuros; POST/GET foram
posteriormente verificados em T07. R12 continua pendente de
`.env.example` no Compose; a suíte T06 gera suas credenciais apenas em memória.
R03 revalidado no stage deste marco: 19 arquivos conferidos, sem ocorrência dos padrões sensíveis examinados. Imagem PostgreSQL em teste não comprova
Dockerfile/Compose da API (R08–R11); configuração TLS não comprova conexão RDS.

## Evidência parcial T07

POST/GET e validação DD-MM-YYYY foram verificados por HTTP com servidor nativo,
PostgreSQL 16.15 real e SQL por conexão independente. 35 testes passaram (17
HTTP, 15 de banco, 3 de configuração), com códigos 201/200/400/404/413/415,
restrições Unicode/calendário/JSON e nenhuma inserção nas entradas rejeitadas.
Evidências: api-local.txt e t07-execucao.txt. Falhas de configuração do npm start
retornaram código 1 esperado; servidor/banco de teste foram encerrados/removidos.
R04/R05/R06/R22/R29/R32 permanecem parciais: PUT/DELETE/health/503, persistência
após restart, Docker/Compose e AWS ainda não foram validados. R07 fica pendente.
R03 revalidado no stage T07: 14 arquivos conferidos; diff --cached --check exit 0; nenhum padrão sensível examinado encontrado (scanner limitado). Não há bloqueio local remanescente.

## Auditoria parcial R02 em 28/09/2026

Git local em `dbcd6a1`: 4 commits únicos alcançáveis por HEAD/--all, todos com
mensagens docs/feat convencionais e alterações reais de arquivos. main aponta
para `21cb5f0`; feat/api-reservas tem 3 commits exclusivos. Há evidência de feature
por refs, ancestral comum e histórico exclusivo, mas zero merges/dois pais.
R02 em andamento: faltam pelo menos dois commits com mudanças reais e o merge
preservando a feature em T32. Plano de commits T08/T09 e seguintes em tasks;
nenhuma etapa futura marcada concluída. Auditoria/evidência não criaram commits.

## Evidência parcial T08

CRUD completo, obrigatórios, DELETE 204/404 e DD-MM-YYYY foram executados com
HTTP/SQL reais. 48 testes passaram, exit 0, com health 200, pausa real -> 503
em 2008 ms, retomada -> 200 e stop do banco exclusivo -> 503 uniforme nas
cinco rotas CRUD. Erro SQL planejado retornou 500 genérico; validação continuou
400 sem banco. Evidências em api-local.txt e health-local.txt; zero containers
remanescentes. R07 avançou para em andamento: health nativo verificado, falta
healthcheck Compose/AWS. R04/R05/R06/R22/R29/R32 têm aceite HTTP local, mantendo
estado parcial até as verificações de persistência/ambientes previstos. R02
continua parcial: auditoria preservada em dbcd6a1/4 commits, marco T08 preparado
para commit real; merge só em T32. R03 revalidado no stage T08: 14 arquivos conferidos; diff --cached --check exit 0; scanner delimitado sem ocorrência de padrões sensíveis.

## Evidência parcial T09

R06: reserva ID 41 foi confirmada por SQL antes e durante a parada da API e por
GET/SQL após iniciar outro processo (PID 562767 -> 562783, porta 44701).
DATE interno 2026-10-01, JSON 01-10-2026; PostgreSQL permaneceu ativo.
R22/R29: verify-api.py stdlib passou com exit 0; CHECK temporário induziu PUT
500 real, exit 1 e limpeza confirmada por SQL; sentinela preexistente preservada.
51 testes passaram, 0 falharam, npm test exit 0. Evidências api-local.txt
(histórico preservado) e postgres-local.txt; zero containers e APIs encerradas.
R06/R22/R29 continuam em andamento até Compose/RDS/demais scripts previstos.
R02: HEAD cbf2410 antes desta tarefa tem cinco commits reais; marco T09 será o
sexto, com mudanças de script/testes. Merge preservando a feature segue em T32;
não declarar R02 completo apenas por atingir a contagem. Guia e evidências
anteriores preservados; revisão de stage/segredos continua exigida neste marco.

## Evidência T10 — R08 e avanço parcial R22

R08 verificado local: Dockerfile/.dockerignore funcionais, base Node 24.21.0
fixada por digest, build multi-stage/npm ci e runtime USER node/UID 1000.
Contexto real exportado contém somente 10 arquivos permitidos; marcadores .env/
PEM excluídos. Duas execuções test:docker passaram com PostgreSQL 16.15 separado,
migração pela imagem, health 200 e CRUD/SQL reais. PID 1/UID e SIGTERM/exit 0
comprovados. API JSON 01-10-2026 e SQL DATE 2026-10-01; zero linhas e containers/
redes temporários ao final. Imagem local preservada; sem publicação.
R22 permanece em andamento: evidências docker-build.txt/docker-run.txt existem,
mas Compose/AWS/plan/deploy continuam futuros. R09–R11 pendentes; rede/tmpfs
do teste não comprovam Compose/volume. R02 continua parcial pelo merge pendente;
T09 foi o sexto commit real (93d313c), T10 prepara outro marco com alterações.

## Evidência T11 — R09/R11/R12 e avanço R07/R22

R09 verificado: config e up --build --wait exit 0, ps api/db healthy; CRUD/SQL
reais no PostgreSQL 16.15, DD-MM-YYYY/DATE preservados. R11 verificado: bridge
com ambos, healthchecks efetivos e API iniciada após db saudável, partindo de
containers parados. R12 verificado: .env.example só placeholders, .env ignorado,
config padrão/mapeamentos POSTGRES_* -> PG* coerentes e senha ausente exit 1.
Evidências compose-ps.txt/compose-rede-saude.txt e trecho em api-local.txt.
Zero linhas/recursos do fixture após limpeza; .env do usuário não alterado.
R07 avançou com healthcheck Compose executado; segue parcial até health AWS.
R22 continua parcial até Terraform/AWS. R10 permanece pendente da prova T12:
volume nomeado declarado/montado em T11 não equivale a testar recriação.
T10 commitada em 49dbd5e/sete commits; T11 prepara novo marco real; merge T32
continua pendente, mantendo R02 parcial. Sem bloqueio local/AWS executada.

## Evidência T12 — R10 e avanço parcial R06/R22/R29

R10 verificado localmente: reserva ID 2 e SQL antes/depois de novos containers
api/db, mesmo volume nomeado e CreatedAt. GET 200/01-10-2026/confirmada;
SQL DATE 2026-10-01/id/campos preservados. Dois runners após corrigir TypeError
inicial passaram/0; execução final 23:10:29 -03:00, Compose v5.5.1/PostgreSQL16.15.
Negativo status próprio alterado para cancelada por SQL retornou check 1;
sem recriação também retornou 1. Sobrescrita de checkpoint recusada/1 sem
alterar bytes/linha; cleanup/cancelamento retornou 0. Sentinela ID 1 permaneceu
intacta por GET/SQL enquanto o verificador limpou seus próprios IDs/marcadores.
Cleanup final comprovou total SQL 0, labels e zero recursos UUID. Logs de falha
inicial/correção/reexecuções em compose-persistencia.txt; fontes e comandos README.
R06/R22/R29 continuam em andamento até RDS/execução AWS/demais scripts, sem
transformar comprovação local em implantação na nuvem. T13 continua pendente.

## Evidência T13 — avanço R13 e preparação R15/R20/R31

STS read-only/default/us-east-1/voclabs exit0 e token temporário configurado;
aluno confirmou Learner Lab correto/painel US$0 usados de US$50. LabInstanceProfile
contém LabRole; key pair existente vockey; AZs/t2.micro e RDS16.15/db.t3.micro/
gp3/20GiB/encriptação/duas AZs realmente consultados. IP atual /32 para SSH/API
confirmado pelo aluno, valores e conta privados em arquivo 0600 ignorado.
R13 em andamento até revisar configuração IAM/perfil e execução efetiva.
R15/R20/R31 seguem pendentes do aceite de regras/backend e aprovações dos planos;
consulta/saldo/CIDR não equivalem a SG aplicado, locking ativo ou apply aprovado.
Terraform1.16.2/providerAWS6.65.0 validados em sonda isolada init/validate/schema,
sem backend remoto e sem credenciais; erros e correções reais em aws-preflight.
DynamoDB depreciado ainda suportado pelo core, preservado como exigência.
Sondas/cache próprias removidos; nenhuma mudança/criação na nuvem/plan/apply.
T13 verificado, próximo T14; não validar módulos inexistentes como aprovados.

## Evidência T14 — avanço parcial R19/R20/R21

Bootstrap infra/backend implementado com versões/lockfile reais, state local,
variáveis validadas e outputs do principal futuro. fmt/check/init direct/validate
0; plano real 2 esperado, cinco criações/zero alterações/zero exclusões em
us-east-1. JSON conferiu S3 versionado/AES256/bloqueio público, tags bucket/tabela,
DynamoDB on-demand/LockID String, vínculos e IAM ausente. Nomes privados de conta
não publicados; tfvars/plano/metadados 0600 ignorados. State local ainda ausente.

Falhas de init comum (1) e procedimento direct temporário (0) preservados na
mesma versão, causa não comprovada. Negativo de bucket reservado -an retornou 1;
plano válido não substituído. S3 []/0 e DynamoDB ResourceNotFoundException/254
antes/depois do plano; STS mesma conta do Lab. Não houve apply/recurso criado.
Evidências backend-validate.txt/backend-plan.txt e diário; T14 verificada.
R19/R20/R21 continuam em andamento: módulos/composição, apply/bootstrap efetivo,
state remoto e locking real ainda pendentes. R22/R31 também não completos.
Próximo T15, revisão de recursos/custo e autorização específica antes de T16.

## Evidência T15 — revisão preparada, autorização ainda pendente R21/R31

Plano preservado/hash/show JSON 0 e identidade AWS atual conferidos; cinco
criações/zero alterações/exclusões, S3/DynamoDB ainda ausentes nas consultas.
Tarifas oficiais/cálculo/premissas em backend-revisao.txt; pequeno cenário mensal
estimado US$0.008, consumo real não medido. R31 avança para em andamento pela
revisão, ainda sem decisão humana. T15 em andamento, T16 pendente, nenhum apply.
R21/R20/locking/deploy/teardown não passam por aprovação de plano; execução e
conferência efetivas seguem futuras. Aguarda resposta específica do aluno.


## Evidência T15/T16 — avanço parcial R20/R21/R31

Autorização bootstrap recebida; apply inicial 1/SCP/Object Lock criou bucket/tabela
parcialmente. Recuperação preservou ambos, removed/destroy=false/data bucket e
três configs/tabela geridas. Apply 0, oito consultas AWS 0, plan posterior 0/No changes:
us-east-1/Enabled/AES256/BPA4true/tags, ACTIVE/PAY_PER_REQUEST/LockID String,
TableId preservado. Bucket físico fora de criação/remoção TF exige reprodução/
limpeza CLI autorizada/evidenciada. State bootstrap local 0600/ignorado preservado.
Backend.txt registra falhas/correções reais. R20/R21/R31 em andamento: backend
principal/objeto state remoto/locking ativo e autorizações principal/destroy
futuros. R19/R22 parciais; EC2/RDS/CRUD nuvem não implantados. Próxima T17.


## Evidência T17 — avanço parcial R14/R19/R22

Módulo VPC/DNS/IGW/quatro subnets/duas route tables/quatro associações implementado;
inputs e outputs D09 explícitos, tags/guardas CIDR/AZs. Core 1.16.2/provider 6.65.0
fixados, fmt/init/validate/grafo 0 e nove testes mock locais 0, após corrigir duas
falhas reais das asserções. Logs vpc-validate.txt, nenhuma API/deploy rede AWS.
R14 passa em andamento, R19/R22 parciais: plan real composto T21 e valores AWS
T23 ainda necessários. Próxima T18, security-group.

## Evidência T18 — avanço local de R15/R19/R22

Módulo security-group implementado em 29/09/2026; 22/3000 somente IPv4 /32
explícitos e 5432 exclusivamente entre SG EC2/RDS. Regras separadas, grupos sem
inline/ciclo, tags em grupos/regras; outputs aguardam instalação das regras.
Fmt inicial 2 corrigido com parênteses no teste; fmt/init/validate/grafo 0,
14 testes mock/command=plan locais passaram; schema/grafo/cópia/lockfile conferidos.
security-group-validate.txt registra capturas/falha/correção e limites; não usar
como evidência aws-seguranca.txt efetiva. R15 agora em andamento, não verificado;
R19/R22 continuam parciais, R18 ainda pendente até RDS/T23. DNS Resolver não é
filtrado por SG; stateful é propriedade documentada AWS, não teste de conectividade.
Plano composto T21, provisionamento/autorização separados; próxima T19.

## Evidência T19 — avanço local de R17/R18/R19/R22

Módulo rds implementado em 29/09/2026, duas privadas recebidas como inputs e
único SG RDS, acesso público false/encriptação true/classe db.t3.micro/engine
PostgreSQL 16.15 proposta. Instância/subnet group com tags; outputs sem segredos.
Fmt/init/validate/grafo/schema0 e 17 testes mock/plan0 após conflito real do
provider corrigido omitindo manage_master_user_password=false junto a password.
Capturas/falha/correção em rds-validate.txt; sensitive não remove senha do state.
R17/R18 agora em andamento, não verificados: RDS available/AZs/privadas/SG/KMS e
CRUD/SQL exigem plano composto T21/AWS T23–T25. R19/R22 parciais, R16 pendente.
Snapshot final exige política explícita nos inputs; fixtures não aprovam
retenção/descarte. Sem API AWS/plan principal/apply/destroy. Próxima T20.

## Evidência T20 — avanço local de R13/R16/R19/R22

Módulo ec2/user-data implementado em 29/09/2026. Um aws_instance, sem IAM novo;
profile somente existente/null, key existente, SG EC2 único, t2.micro, IMDSv2,
disco encriptado/tagueado/8GiB gp3 e associação pública propostos. AMI explícita
AL2023 x86_64 requer seleção/conferência em T21; formato IDs não comprova AWS.
Fmt/init/validate/grafo/schema/bash-n0, dez testes Terraform mock/plan e três
Python/stdllib/stubs aprovados. Falha profile unknown e falso positivo auxiliar
corrigidos/preservados em ec2-validate.txt. User-data sem segredos/sem API/RDSlocal.
R16 agora em andamento; running/subnet/profile/key/IMDS/volume/boot/Docker/API/SQL
reais só T23–T25. R13/R19/R22 parciais, sem backend remoto/plano principal ainda.
PróximaT21 composição/locking/plano; não executar apply sem revisão T22.
