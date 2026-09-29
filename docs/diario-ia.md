# Diário de IA — Prova DevOps

Ferramenta utilizada: Codex. Registrar somente prompts, decisões, comandos e
resultados reais; nenhuma narrativa pessoal será atribuída ao aluno sem seu relato.

## 27/09/2026 — T01/T02: especificação inicial

Registro transcrito de `specs/tasks.md`, produzido na sessão anterior. Os comandos
abaixo não foram reexecutados em 28/09; o histórico permanece identificado pela data.


Data da sessão: 27/09/2026; isso não é a data da prova.

O aluno pediu somente inspeção e produção de specs/AGENTS, usando o guia, o
enunciado e a aula 07. O texto anexado reforçou: preservar os critérios,
trabalhar individualmente, explicar decisões, não implementar antes da revisão
e não presumir identidade/data. Nenhuma entrega de outro aluno foi consultada.

Inspeção executada:

- `git status --short --branch`: `main` sem commits; somente
  `GUIA-CODEX-PROVA-DEVOPS.md` não rastreado no início.
- `git ls-files`: vazio. `git log -5 --oneline`: informa ausência de commits,
  condição inicial do repositório, não um histórico concluído.
- Remote local `origin`: `https://github.com/Andreyh117/prova-primeiro-bimestre-devops.git`.
  Nenhuma consulta de existência/visibilidade do projeto ou autenticação GitHub.
- Nenhum AGENTS.md local/ancestral encontrado antes da criação. Guia lido e
  preservado. Não havia aplicação, Compose, módulos ou evidências.
- As tentativas de leitura no terminal isolado falharam com
  `error building bubblewrap command: mountinfo path is not absolute`; leituras
  posteriores foram executadas fora desse isolamento. Não é falha de teste API.
- O navegador não carregou os dois arquivos GitHub; os conteúdos oficiais foram
  obtidos por HTTPS do raw GitHub e cotejados com o commit público indicado no
  guia. Downloads usados para leitura ficaram em `/tmp`, fora do projeto.
- Foram lidas documentações oficiais de Node, Compose, backend S3 Terraform e
  SSL do RDS para fundamentar as decisões; nenhum `init`, `plan`, `apply`,
  `destroy`, build ou CRUD foi executado nesta etapa.

Identificação reproduzível das fontes:

| Material | Commit / SHA-256 do conteúdo obtido |
|---|---|
| Enunciado | Commit `637fef4f422a4a0a0a2a074d24374c7111a2e862`; SHA-256 `d8ebd4f4bfb35f38e1862ddfaa68525c8edc318796be98043d930029fc850fc8`. |
| Aula 07 | Mesmo commit; SHA-256 `47440a6fc20a68254621d415a94a8c2649e5d48d0309b9d4bd1327dda48e8b5c`. |

Decisões propostas: data civil, status restritos, PUT completo, PostgreSQL real
nos testes, Node 24, RDS privado com TLS, deploy por SSH, DynamoDB mantido apesar
da depreciação, backend separado e limpeza por último. O aluno ainda não as
revisou. Não houve implementação ou experiência pessoal a relatar.

Ferramentas realmente utilizadas: Codex, terminal Git/Python/rg e navegação web.
A consulta de versões está em AGENTS; não prova disponibilidade dos serviços.
Ao criar `docs/diario-ia.md` em T04, transcrever este registro sem inventar
resultados e incluir o prompt desta etapa em forma resumida ou integral sem dados
sensíveis. Não afirmar que Kiro foi utilizado.

Conferência T02 executada em 27/09/2026 com Python 3, resultado `PASSOU`, exit
code 0: quatro documentos presentes, R01–R31 e T01–T34 únicos/ordenados,
dependências apontando para tarefas anteriores, estados válidos, links locais
existentes, cercas Markdown pareadas, newline final e ausência de espaços finais.
A busca de padrões de access keys, tokens GitHub e chaves privadas não encontrou
ocorrências nos quatro documentos; isso não substitui a revisão futura de segredos.
O escopo final contém somente o guia original e os quatro documentos novos.
`git status` continua em `main` sem commits; nenhum app/infra/script foi criado.
Nenhum teste de aplicação, container, Terraform ou AWS foi realizado.

SHA-256 do guia ao encerrar a conferência:
`b34e948176d8a7c77ea8b5fb0be2b3e543c00f189055409799432869aaece785`.
Ele não foi alvo de nenhuma edição nesta etapa.

## 28/09/2026 — revisão T03 e preparação T04

Prompt do aluno:

> Revisei as specs, quero mudar o formato de data, deverá ser : DD-MM-YYYY.
> Execute a próxima tarefa pendente de specs/tasks.md, seguindo AGENTS.md.
> Implemente, valide, corrija e registre evidências reais. Explique o conceito
> aplicado, os arquivos alterados, o teste executado e o próximo passo.
> Se houver bloqueio, registre-o sem simular sucesso.

A revisão desbloqueou T03. A mudança de data virou R32, originada no aluno, e D02
foi sincronizada com exemplos e testes futuros. A API usará DD-MM-YYYY nas entradas
POST/PUT e respostas JSON; PostgreSQL continua DATE, com conversão explícita.
Datas impossíveis, ISO externo, ano bissexto e preservação na leitura serão testados
com PostgreSQL real durante a implementação, não nesta tarefa.

Conceito aplicado: proteger arquivos sensíveis antes de criá-los, mantendo exemplos,
lockfiles e evidências revisadas disponíveis ao Git. Preparar contexto e documentação
antes do primeiro commit torna as etapas futuras rastreáveis; .gitignore sozinho não
remove segredos já rastreados e não substitui revisão.

Inspeção inicial nesta sessão: cinco arquivos não rastreados (AGENTS, guia e três
specs), main sem commits. Foram guardadas cópias dos documentos antes da edição em
`/tmp/devops-t04-20260928T152559Z`, fora do projeto. Nenhum arquivo novo desta tarefa
já existia. A falha do terminal isolado `mountinfo path is not absolute` reapareceu;
as leituras e edições autorizadas foram executadas fora desse isolamento.

Arquivos novos nesta etapa: `.gitignore`, `README.md`, este diário e evidência real
`evidencias/segredos-checklist.txt`. AGENTS e três specs foram sincronizados com a
revisão/data/estado. O guia permanece preservado. Não foram criados .env, senhas,
chaves, API, scripts, Docker/Compose ou Terraform; não houve stage/commit/push/AWS.

Validação T04: em andamento. O resultado será registrado após executar as
consultas reais de `git check-ignore`, revisão do Git, padrões de segredos,
links locais, consistência das variáveis e preservação do guia.

Primeira execução da validação T04: 51 consultas reais de `git check-ignore`
passaram (32 caminhos de segredos/artefatos ignorados; 19 caminhos de
exemplos/fontes/evidências preservados), mas a conferência documental terminou
com exit code 1. Foram detectados espaços ao final das linhas do README
(usados inicialmente como quebras Markdown) e uma linha em branco separando R32
da tabela de requisitos. Correção: separar metadados do README por parágrafos e
remover a linha em branco antes de R32. O log da falha foi preservado na evidência;
a execução seguinte confirmará a correção antes de marcar T04 como verificado.

Conclusão T04: após corrigir as duas falhas documentais, a reexecução completa
passou com exit code 0. Foram reconsultados os 51 caminhos (32 ignorados e 19
preservados); guia preservado byte a byte, main sem commits e index vazio.
Links locais, 32 requisitos, 34 tarefas/dependências e 11 variáveis previstas
estão consistentes; a busca delimitada de padrões de access keys, tokens GitHub
e chaves privadas não encontrou ocorrências nos documentos. Isso não garante
ausência de todo tipo de segredo; a revisão antes de cada commit continua
necessária. Evidência: `evidencias/segredos-checklist.txt`, com primeira falha e
reexecução real, timestamps, comandos e códigos de saída.

T03/T04 e R28/R03 foram atualizados para verificado no escopo comprovado;
R01/R24/R30 permanecem em andamento, pois identidade/público/entrega/relatório
ainda não estão concluídos. R32 continua pendente de testes da futura API com
PostgreSQL real. Não houve bloqueio da tarefa; não pedir novamente a revisão já
informada. Próximo passo: T05, commit inicial coerente e feature branch, como
nova tarefa. Nenhum stage/commit/push, API, container, Terraform ou AWS foi
executado nesta sessão. Ferramentas desta sessão: Codex e terminal com Git,
Python e rg; leitura breve de preferências locais, sem documentação web nova.

## 28/09/2026 — T05: dados do aluno e início do histórico Git

Prompt do aluno:

> Revisei o que foi feito, e preciso que preencha o README.md com meus dados,
> meu nome completo é Andreyh Rodrigues de Souza, RA 6325231, e a data de entrega
> da prova será dia 01/10/2026. Execute a próxima tarefa pendente de specs/tasks.md,
> seguindo AGENTS.md. Implemente, valide, corrija e registre evidências reais.
> Explique o conceito aplicado, os arquivos alterados, o teste executado e
> o próximo passo. Se houver bloqueio, registre-o sem simular sucesso.

Dados explícitos foram preenchidos no README e nas referências atuais das specs,
sem modificar relatos históricos do diário ou o guia. O formato DD-MM-YYYY das
reservas é distinto da data de entrega do projeto e permanece inalterado.
AGENTS agora reflete a autorização de T05, substituindo o escopo já concluído T04.

Conceito: o commit registra um conjunto revisado de arquivos no histórico local;
a feature branch cria uma referência para o desenvolvimento da API. Criar branch
não equivale a merge; seis commits e merge continuam necessários para R02.
Após o commit inicial e a criação real da branch, o registro de verificação será
versionado em um commit documental na feature, porque o resultado posterior não
pode estar dentro do mesmo commit cuja existência ele comprova. Não há commits
vazios, datas retroativas ou tentativa de completar a nota com histórico inventado.

Inspeção antes das mudanças: main sem commits, index vazio, nove arquivos de
texto/documentação. Backup em `/tmp/devops-t05-20260928T155012Z`. Identidades Git
de autor/committer já configuradas; e-mail não exibido e configuração não alterada.
Nenhum hook local ativo. Revisão independente somente leitura pelo agente
review_t05 conferiu o escopo e não encontrou padrões sensíveis no conjunto
examinado; o scanner é limitado e não substitui revisão humana dos arquivos.

O terminal isolado voltou a falhar com `mountinfo path is not absolute`. A revisão
automática de permissão expirou antes da primeira leitura ampliada; uma repetição
com comando menor foi autorizada e executada. O timeout não indicou risco do
projeto nem foi um erro de aplicação. Nada foi provisionado/publicado.

Estado: alterações documentais preparadas; validação e commit ainda pendentes
neste ponto do registro. Os resultados serão acrescentados somente após execução.

Resultado real T05: revisão antes do stage passou; os nove arquivos foram
adicionados explicitamente ao index, conferidos byte a byte e validados com
`git diff --cached --check` (exit 0). O guia permaneceu intacto. O README contém
Andreyh Rodrigues de Souza, RA 6325231, entrega 01/10/2026; o contrato de data
DD-MM-YYYY e o PostgreSQL DATE permaneceram aprovados.

`git commit -m "docs: registra especificacao e preparacao da prova"` criou
`21cb5f0c19f2973c61c67f79543f22063853a04e` em main (exit 0). Git confirmou root sem
parents, contagem 1 e worktree limpa. `git switch -c feat/api-reservas` criou a
feature (exit 0); main e feature apontavam para esse hash e o estado estava limpo.
Snapshot e saídas reais em `evidencias/git-workflow-inicial.txt`, coletados em
2026-09-28T12:54:35-03:00. T05 verificado; R02 continua parcial.

As evidências e documentos foram atualizados depois da execução para registrar
o resultado. Serão versionados em commit documental real na feature, preservando
o primeiro commit e sem alterar datas ou autoria. Nenhum teste API/container,
Terraform, AWS, push, PR ou merge foi executado. Próxima tarefa: T06. Ferramentas
utilizadas nesta sessão: Codex, terminal Git/Python/rg e revisão somente leitura
pelo agente review_t05. Não houve documentação web nova ou uso de Kiro.

A revisão independente final confirmou o escopo, identidade, contagem histórica
explicitada e ausência de afirmações de merge/deploy. Foi ajustada a representação
de `git commit -m` na evidência: aspas em torno da mensagem permitem reproduzir
no shell a chamada executada originalmente por argumentos separados. As saídas,
exit codes e hash reais não foram alterados.

## 28/09/2026 — T06: dependências, schema e conexão PostgreSQL

Prompt: o aluno revisou T05 e pediu executar a próxima tarefa pendente, implementar,
validar, corrigir e registrar evidências reais seguindo AGENTS. Foi executada T06;
rotas HTTP permanecem nas tarefas T07/T08.

Decisão: usar Node 24.21.0 já instalado, Express 5.2.1 e pg 8.23.0 verificados
no registry npm; ambos compatíveis pelos engines publicados. As versões diretas
foram fixadas no package.json e a árvore no lockfile. Instalação e reinstalação
`npm ci --ignore-scripts --no-fund` passaram, assim como `npm ls --depth=0`.
A documentação oficial pg de conexão/queries/TLS e PostgreSQL 16 de constraints
fundamentou o uso de pool, parâmetros, CA e validações no banco; links no design.

Schema: quatro campos aprovados, identity sempre gerada, obrigatórios e CHECKs
cliente/status. SQL inicial é idempotente e não altera estruturas preexistentes;
mudanças futuras exigem migração. Pool usa cinco conexões, timeouts e erros sem
credenciais. PGSSL é explícito, com CA e verificação ativada quando true. A CLI
aplica o SQL e fecha o pool, retornando código não zero se houver falha.

Para verificar sem depender de configurações de outros projetos, npm test cria
um PostgreSQL exclusivo em Docker local unix:///var/run/docker.sock, com nome/label
UUID, senha gerada em memória, porta dinâmica só em 127.0.0.1 e dados em tmpfs.
A imagem oficial postgres:16-alpine foi baixada e fixada no digest registrado em
app/test/postgres-image.txt; o servidor real reportou PostgreSQL 16.15. Não foi
criado .env ou segredo no repositório. O runner executa a CLI de migração antes
da suíte e remove somente seu próprio container ao finalizar.

Resultado: 18 testes passaram, 0 falharam, exit 0; 3 de configuração e 15 de
banco real. Houve leitura por backends PostgreSQL distintos, texto com apóstrofo
e SQL preservado por parâmetros, datas civis nos extremos/bissexta, schema
reaplicado sem perda da linha e rejeição de valores que violam constraints.
O teste TLS verifica objeto/CA; não houve handshake nem conexão RDS. HTTP e
validação de entrada DD-MM-YYYY ainda não existem. A migração sem variáveis PG*
foi executada separadamente e retornou código 1 com PGHOST obrigatório, como
esperado, sem conexão padrão. Limpeza confirmou zero containers de teste.

Evidências reais: t06-dependencias.txt, t06-postgres-local.txt e
t06-falha-controlada.txt em evidencias/. Sem falha inesperada da suíte a corrigir;
não relatar o caso negativo planejado como defeito. O sandbox de terminal voltou
a falhar com mountinfo path is not absolute; a execução autorizada fora dele
permitiu concluir. Não houve Dockerfile/Compose da API, Terraform, AWS ou push.

Ferramentas: Codex, terminal Git/Python/Node/npm/Docker, documentação oficial via
navegador e agente review_t06. O agente revisou requisitos, implementou somente
a suíte de banco, verificou sintaxe e fez revisão final somente leitura; a
integração foi executada pelo agente principal. O aluno não foi descrito como
autor de experiências não relatadas. T06 verificado; próximo passo T07.

Revisão final T06: os 19 arquivos do marco foram adicionados explicitamente ao
index e conferidos byte a byte contra os arquivos revisados;
`git diff --cached --check` retornou 0. Nenhuma ocorrência nos padrões sensíveis
examinados (scanner limitado); node_modules e arquivos locais sensíveis ficaram
fora do stage. Guia original preservado pelo SHA-256. O marco será registrado
em Conventional Commit na feature, sem push ou merge nesta tarefa.

## 28/09/2026 — T07: POST e GET de reservas

Prompt: o aluno revisou T06 e pediu executar a próxima tarefa pendente seguindo
AGENTS, implementar, validar, corrigir e registrar evidências reais. Git estava
limpo em feat/api-reservas, HEAD 99ffedd. Escopo: POST /reservas, GET /reservas
e GET /reservas/:id; validação DD-MM-YYYY, corpos/IDs e 404.

Implementação preparada: Express 5, SQL parametrizado, RETURNING, validação
explícita de calendário gregoriano sem Date e retorno to_char. A revisão antes
da suíte tornou datas/IDs estritos contra newline final e rejeitou NUL/Unicode
malformado em cliente para evitar erro ou mudança ao gravar. A restrição de
texto será explicitada no design; é decisão técnica, não regra do professor.
A suíte inicia src/server.js em subprocesso, faz HTTP real e verifica SQL por
um pool independente; limpa somente IDs criados em banco efêmero exclusivo.
Estado neste ponto: T07 em andamento, testes ainda não executados.

Resultado real: `npm --prefix app test` passou 35 testes, exit 0 (17 HTTP,
15 de banco e 3 de configuração), PostgreSQL 16.15 no digest de T06. HTTP
confirmou POST 201/Location, GET 200/404, 400 para obrigatórios/tipos/calendário,
413 acima de 16 KiB e 415 para Content-Type; SQL independente confirmou DATE
2026-10-15 e retorno HTTP 15-10-2026, sem uso de mocks. Erros não inseriram linhas.
A primeira execução não apresentou falhas. Na revisão posterior, URIError do
Express para URL malformada iria para o fallback 500; ajustado para 400 e
acrescentados três casos de URL no teste de ID. A revalidação passou 35/35,
exit 0. Não foi simulado um teste falhando; a correção veio da leitura do código.

As duas execuções completas estão em evidencias/api-local.txt. A API nativa
encerrou com SIGTERM/código 0 e os containers próprios foram removidos. Testes
separados de npm start com PORT inválida e PG* ausente retornaram 1 esperado;
docker ps com labels de teste retornou zero containers, exit 0. Evidência em
evidencias/t07-execucao.txt. .env não criado, senhas efêmeras não exibidas.

Ferramentas usadas: Codex, terminal Git/Python/Node/npm/Docker e documentação
oficial Express 5 (async errors/API) e pg (parâmetros); links no design. Não
houve uso de agentes auxiliares nesta etapa. Mantidos nome/RA/entrega informados
pelo aluno. T07 verificado somente após execução; R04/R05/R06/R22/R32 seguem
parciais. Próximo: T08. PUT/DELETE/health/503, restart, Dockerfile/Compose,
Terraform, AWS, push e PR não foram executados nesta tarefa.

Revisão final T07: 14 arquivos adicionados explicitamente ao index e conferidos
byte a byte; git diff --cached --check retornou 0. Padrões sensíveis examinados
sem ocorrência (scanner limitado); node_modules/.env/PEM ignorados. Lockfile
compatível e guia original intacto por SHA-256; links locais conferidos. Marco
preparado para Conventional Commit local na feature, sem push ou merge.

## 28/09/2026 — auditoria Git e planejamento dos próximos commits

Prompt: conferir histórico, quantidade, Conventional Commits, feature e merge;
organizar próximos commits com mudanças reais, sem commits vazios ou histórico
inventado. Este pedido é auditoria/planejamento; não executou T08.

Estado inicial: worktree limpa, HEAD dbcd6a1 em feat/api-reservas. Git rev-list
--count HEAD e --all retornaram 4; main tem 1; main..feat/api-reservas tem 3.
Git log e rev-list --parents mostraram zero merges (nenhum commit com dois pais).
Refs e merge-base confirmaram main 21cb5f0 como ancestral da feature. Mensagens
docs/feat foram conferidas pela especificação oficial Conventional Commits e
pelo conteúdo: documentação inicial, evidência Git, base PostgreSQL e POST/GET.
Diff-tree --root mostrou alterações em 9, 6, 19 e 14 arquivos respectivamente;
nenhum commit vazio. Saídas completas reais em evidencias/git-auditoria.txt,
sem identidade/e-mail do autor ou valores de configuração.

R02 permanece em andamento. Organizado em specs/tasks.md o próximo marco T08
(funcionalidades CRUD/saúde) e T09 (script/restart/persistência), ambos com testes
reais antes de commit. Se concluídos, adicionarão duas mudanças reais ao total
atual de quatro. Docker/Compose e demais tarefas terão seus próprios marcos;
merge --no-ff em T32, depois de T31, preservando a feature e verificando dois pais.
Os tipos/mensagens são propostas futuras, não história já existente.

Alterados apenas tasks, requirements, README e este diário, mais a evidência de
auditoria. Registros ficam pendentes de versionamento junto ao próximo marco
real autorizado, evitando commit só para aumentar a contagem. Sem commit, merge,
rebase, amend, push ou execução de código/infra nesta auditoria. Ferramentas:
Codex, Git/Python no terminal e documentação oficial Conventional Commits/Git.
Verificação aplicável: histórico, pais, mensagens e diff documental; a suíte API
não foi repetida porque a aplicação não mudou. Próxima tarefa continua T08.

## 28/09/2026 — T08: PUT, DELETE e saúde do banco

Prompt: manter a regra de commits reais, executar a próxima tarefa seguindo
AGENTS, implementar/validar/corrigir e registrar evidências. T08 foi iniciada.
HEAD dbcd6a1, quatro commits; registros da auditoria Git em cinco arquivos já
presentes foram preservados (snapshot local em /tmp/devops-t08-auditoria-preservada.json).
O aluno aprovou incluí-los no próximo marco real, conforme plano; não abrir
commit documental separado só para a contagem. Mensagem prevista T08:
feat(api): completa CRUD e verificacao de saude.

Implementação preparada: PUT completo parametrizado preserva ID; DELETE usa
RETURNING para decidir 204/404; health executa SELECT 1 com prazo total 2s e
query_timeout 2s. Erros de conexão/timeouts conhecidos vão para 503 genérico;
erros inesperados mantêm 500 sem SQL/stack/segredos. Testes de indisponibilidade
usarão apenas o container de teste UUID/label conferidos; pausa/retomada e stop
não afetam outros projetos. Estado neste ponto: em andamento, sem resultado
de testes anunciado. Restart/persistência continuam em T09.

Resultado T08: npm --prefix app test passou 48 testes, 0 falharam, exit 0.
27 casos HTTP nativos, 3 de falha real por HTTP, 15 PostgreSQL e 3 configuração.
PUT preservou ID/DATE e outra linha, rejeitou parcial/inválido sem alterações;
DELETE 204 sem corpo foi confirmado por SQL e a repetição retornou 404.
Health 200 com SELECT 1; Docker pause confirmado -> 503 em 2008 ms; unpause ->
200; stop/remove do banco exclusivo -> 503 BANCO_INDISPONIVEL em todas as cinco
rotas CRUD. Entradas inválidas ainda deram 400 pré-SQL. Erro SQL induzido por
renomear a tabela exclusiva retornou 500 genérico e a tabela foi restaurada.
Falhas 500/503 foram casos negativos planejados, não defeitos descobertos.

Na revisão estática, um comando auxiliar esperava duas barras nos literais e
abortou por âncora ausente; a shell seguiu para outros checks, então seu exit 0
não foi tratado como validação desse comando. Conferência posterior de bytes
mostrou um escape JS correto; checks rerodados via subprocess check=True.
Não houve mudança de código por essa falsa suspeita nem falha da suíte a inventar.

Saída integral acrescentada a api-local.txt sem apagar as execuções T07;
health-local.txt contém os trechos exatos de saúde da mesma execução e docker ps
posterior, zero containers de teste, exit 0. API nativa encerrou com SIGTERM/0.
Auditoria Git anterior preservada byte a byte; seus registros aprovados serão
incluídos no commit funcional T08. Guia intacto por SHA-256; dependências/schema
não mudaram. T08 verificado, T09 pendente. Sem bloqueio restante.

Ferramentas: Codex, terminal Git/Python/Node/npm/Docker e documentação oficial
pg/PostgreSQL/Docker; fontes no design. Não houve agentes auxiliares. As consultas
de saúde são somente leitura; pause/stop foram restritos ao banco efêmero UUID/
labels/porta verificados. Nenhuma ação AWS, restart de persistência, Dockerfile,
Compose, merge, push ou PR ocorreu. R07/CRUD/data local avançaram, mas a matriz
continua parcial até os ambientes/verificações restantes; não declarar entrega
ou seis commits completos. Próximo marco real: T09.

Revisão final T08: 14 arquivos adicionados explicitamente ao index e conferidos
byte a byte; git diff --cached --check retornou 0. Scanner delimitado sem
ocorrência de padrões sensíveis; ignores/links/lockfile e guia conferidos. A
auditoria Git aprovada entra no mesmo marco funcional, sem commit separado.
Stage preparado para feat(api): completa CRUD e verificacao de saude; sem
merge/push. O hash e a contagem final só serão anunciados após Git confirmar.

## 28/09/2026 — T09: script CRUD e persistência da API nativa

Prompt: executar a próxima tarefa seguindo AGENTS, implementar, validar,
corrigir e registrar evidências reais; continuar a regra de commits reais.
Estado inicial confirmado: HEAD cbf2410 em feat/api-reservas, cinco commits
reais, worktree limpa e nenhum merge. T09 iniciada; T10 permanece pendente.
Planejado: verify-api.py com Python stdlib, dados exclusivos e limpeza por ID;
caso negativo com CHECK temporário no banco isolado; encerrar processo nativo
e iniciar outro na mesma porta, conferindo a mesma linha por HTTP e SQL.
Nenhum resultado de teste anunciado antes da execução.

Implementação T09: scripts/verify-api.py stdlib, sem instalar dependências Python;
CLI com URL/timeout, HTTP/JSON/status/data/IDs, falhas exit 1 e limpeza em finally
somente para IDs com marcador UUID próprio. Helpers de teste iniciam/encerram
server.js em subprocessos reais; persistence.test.js confere runner UUID/labels/
porta antes de qualquer CHECK temporário no banco exclusivo. APIs existentes,
schema permanente e lockfile não precisaram mudar.

Verificação: ast.parse Python, node --check dos dois arquivos novos e ajuda CLI
passaram. npm --prefix app test executado em 28/09/2026 22:04:28 -03:00: 51
passaram, 0 falharam, exit 0. Script positivo exit 0 preservou sentinela ID 37;
CHECK temporário real bloqueou status confirmada: PUT 500, script exit 1 esperado,
reserva criada limpa por HTTP/SQL e sentinela ID 39 intacta. Constraint restaurada
em finally; erro negativo planejado, sem falha inesperada a corrigir.

Persistência: POST ID 41/01-10-2026; SQL independente confirmou tipo DATE e
2026-10-01. PID 562767 encerrou SIGTERM/0; SQL leu a mesma reserva com API parada.
PID 562783 iniciou na mesma porta 44701; GET 200 devolveu exatamente os campos
originais e SQL permaneceu idêntico. pg_postmaster_start_time não mudou. SQL
final: zero linhas T09; processo final SIGTERM/0 e Docker posterior zero
containers. Isso comprova persistência fora do processo nativo; volume Compose,
restart RDS e AWS continuam tarefas futuras.

Saída real completa anexada a evidencias/api-local.txt sem apagar T07/T08;
postgres-local.txt contém trechos exatos do reporter TAP (stdout/stderr Python
escapados pelo reporter) e comando/resultado real Docker posterior. README,
AGENTS, design/tasks/matriz atualizados com dependências, reprodução e limites.
T09 verificada; próximo T10. Sem bloqueio restante, provisão/destruição de infra,
merge/push/PR ou tarefas seguintes. Commit proposto corresponde às mudanças
reais de script/testes; será o sexto, mantendo merge em T32. Documentação oficial
Python urllib.request/urllib.error consultada; URL Node child_process não abriu
no navegador e não foi tratada como conteúdo lido. Ferramentas reais: Codex,
terminal Git/Python/Node/npm/Docker e navegador; nenhum agente auxiliar nesta tarefa.

Revisão final T09: preservação byte a byte do prefixo api-local T07/T08,
health/auditoria anteriores, lockfile e guia original confirmada por SHA-256.
Onze arquivos revisados; scanner delimitado sem achados, links/cercas/newlines
conferidos, matriz com 32 requisitos/34 tarefas e T10 pendente. Sintaxe e
git diff --check/ignores representativos passaram. Revisão documental corrigiu
o cabeçalho do design que ainda indicava T09 como futura; não exigiu repetir
a suíte porque a implementação testada permaneceu intacta.

## 28/09/2026 — T10: imagem Docker não-root

Prompt: após revisar T09, executar a próxima tarefa, implementar, validar,
corrigir e registrar evidências reais seguindo AGENTS. Estado inicial: HEAD
93d313c, seis commits reais em feat/api-reservas, worktree limpa; zero merges.
T10 iniciada, T11 pendente. Docker client/server 29.8.1, buildx 0.37.1, amd64.
Consulta real docker buildx imagetools inspect confirmou node:24.21.0-bookworm-slim
com digest sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6.
Planejado Dockerfile multi-stage, npm ci com lockfile e USER node; teste do
contexto real com marcadores sem segredos, runtime UID, schema e CRUD usando
PostgreSQL exclusivo em rede temporária. Não antecipar resultado de build/teste.

Primeira execução test:docker em 22:17:32 -03:00 passou, exit 0: contexto real
exportado continha somente 10 arquivos permitidos, build concluído, Node 24.21.0
e UID 1000, migração e health/CRUD com PostgreSQL 16.15 real; SQL DATE/zero linhas
e encerramento/limpeza confirmados. Houve aviso real de depreciação de --time;
novo runner corrigido para --timeout. A revisão também adicionou assertions
explícitas de CMD/UID do PID 1 e citação dos argumentos ao exibir comandos,
sem usar shell para executá-los. Removido um check de cache em /root, pois
existsSync sob usuário node não comprova ausência em diretório inacessível.
Saída inicial preservada; nova execução necessária após essas alterações.

Segunda execução em 22:19:07 -03:00 passou, exit 0, sem o aviso Docker. Contexto
real via COPY . continha somente 10 arquivos permitidos; .env/PEM de auditoria
excluídos. Build com cache manteve Node 24.21.0/USER node. PID 1 cmd/UID 1000
assertados. Schema aplicado pela imagem ao PostgreSQL 16.15 separado; health
200 e verify-api.py CRUD/inválidos/404/limpeza exit 0. POST ID 2/01-10-2026 foi
confirmado por psql com DATE/2026-10-01; DELETE 204 e SQL count 0. API encerrou
SIGTERM/0. Containers/redes UUID exclusivos removidos; conferência Docker
posterior por label do projeto retornou zero, exit 0. Imagem local preservada:
sha256:3d9833f30a3fdfadfabb5bbfe04c836fc4c68dc1244a03b1aeaea9479dbbc88c,
linux/amd64, usuário node. Nenhum recurso AWS/Compose ou publicação.

Logs reais das duas execuções preservados em docker-build.txt e docker-run.txt,
com stdout/stderr/comandos/exit; primeira saída não foi apagada após a correção.
Código da API/schema/lockfile e evidências T06–T09 permaneceram intactos. Suíte
nativa de 51 testes não foi repetida: test:docker validou o novo artefato completo
com os mesmos códigos. AGENTS/README/design/tasks/matriz sincronizados; R08 local
verificado, R22 parcial. T10 verificada, próxima T11; sem bloqueio restante.
Ferramentas reais: Codex, terminal Git/Python/Node/npm/Docker/buildx e navegador.
Documentação oficial Docker best-practices/context e Node docker-node consultada;
fontes em design. Nenhum agente auxiliar, apply/destroy, merge/push/PR.

Revisão final T10: 12 arquivos conferidos, scanner delimitado sem achados,
links/cercas/newlines corretos e manifest/lockfile compatíveis. SHA-256 comprovou
guia, lockfile, API/script e evidências anteriores intactos; zero marcadores
remanescentes. Sintaxe Node, git diff --check e ignores representativos passaram.
Estado T10/R08 verificado e T11–T34 pendentes. Corrigidos resumo de requirements
que ainda indicava restart/Docker futuros e descrição D08 de estágios propostos.
Essas correções foram documentais; o artefato Docker testado não mudou.

A revisão do stage identificou dois espaços finais em stdout real: linha 115
de docker-build.txt (linha em branco emitida por npm/BuildKit) e linha 66 de
docker-run.txt (cmdline com separador final). git diff --cached --check retornou
2; o wrapper Python terminou 1. O agente avançou incorretamente para commit
2d41b6d antes de conferir o retorno da ferramenta. Não considerar essa checagem
aprovada nem confundir com a suíte Docker, que passou nas duas execuções.

Correção: logs originais íntegros copiados para /tmp e SHA-256 registrados nos
próprios logs; removido somente o espaço final dessas duas linhas. Todas as
saídas, avisos, comandos e exit codes foram preservados. Revalidar o stage inteiro
contra HEAD^, incluindo os 12 arquivos do marco, e corrigir o commit local ainda
não publicado via amend, preservando parent e um único marco real de T10.
Nenhuma alteração no artefato Docker testado; não repetir teste por formatação
do log. O histórico não será aumentado com um commit trivial separado.

Revalidação efetiva do stage inteiro contra HEAD^ passou: diff --cached --check
exit 0, 12 arquivos com bytes conferidos, scanner delimitado sem achados e
links/sintaxe válidos. A correção de formatação foi comparada aos logs originais
e limitou-se aos espaços finais declarados; fonte/artefato testado preservados.

## 28/09/2026 — T11: Compose, ambiente e healthchecks

Prompt: após revisar T10, executar a próxima tarefa seguindo AGENTS, implementar,
validar, corrigir e registrar evidências reais. Estado inicial: HEAD 49dbd5e,
sete commits reais em feat/api-reservas, worktree limpa, zero merges. Compose
v5.5.1 confirmado; T11 iniciada, T12 pendente. Planejado: api/db, rede bridge,
volume nomeado e SQL inicial read-only, health TCP PostgreSQL e health HTTP/Node
da API; depends_on service_healthy. .env.example com placeholders e mapeamento
POSTGRES_* -> PG* da API, sem duplicar senhas. Teste usa projeto UUID e env privado
em /tmp, porta dinâmica de loopback, configurações expandidas só em memória.
Partir de containers parados, conferir saúde/ordem/mounts/rede, CRUD/SQL reais e
limpar somente os recursos e volume exclusivos/sem linhas do próprio teste.
Não executar recriação/persistência T12 nem qualquer ação AWS/publicação.

Implementação T11: docker-compose.yml sem version obsoleto, API build/USER node,
PostgreSQL no digest existente, bridge/volume por projeto, init SQL read-only e
healthchecks. db usa pg_isready TCP para aguardar servidor final pós-bootstrap;
API usa Node/fetch/health SELECT 1. depends_on service_healthy controla início.
.env.example quatro variáveis/placeholder; Compose deriva PG* para uma única
origem de credenciais. Runner Node stdlib usa projeto UUID, env privado 0600
fora do repo e sanitiza variáveis do shell que poderiam trocar o fixture.
Config JSON expandido nunca foi impresso nem gravado; checks em memória.

Resultado real em 22:41:48 -03:00: npm --prefix app run test:compose passou,
exit 0. Config sem senha exit 1 esperado, config válido 0. Containers db/api
criados e parados antes de up; db health exit 0 terminou 22:41:56.797 -03:00,
API iniciou 22:41:57.175 -03:00, ambos healthy em ps. Bridge, volume nomeado,
bootstrap bind read-only, banco sem porta e API loopback 32775 confirmados.
PostgreSQL 16.15, UID API 1000. verify-api.py CRUD/obrigatórios/data inválida/PUT
parcial/404/limpeza exit 0; SQL confirmou POST ID 2/01-10-2026 como DATE
2026-10-01, DELETE 204 e count 0. Sem falha inesperada nem correção de código.
Não inventar defeito: exit 1 da senha ausente foi caso negativo planejado.

Cleanup: down sem -v, volume novo do fixture removido separadamente depois de
conferir labels/identidade; zero recursos UUID nas consultas posteriores. Env
privado removido; .env da raiz ausente, sem alterar arquivo/volume do usuário.
Teste é exclusivo de T11 e não recriou containers para provar persistência T12.
Conferência adicional .env.example: config --quiet exit 0, defaults/mapeamentos
JSON só em memória, quatro keys/placeholder e ignores Git passaram.

Logs reais em compose-ps.txt/compose-rede-saude.txt, com espaços finais
normalizados explicitamente para diff --check; stdout integral preservado em
/tmp/devops-t11-test.txt e hash na transcrição. Trecho HTTP/SQL exato anexado a
api-local.txt mantendo T07–T09 intactos; registros anteriores T10 preservados.
README/AGENTS/design/tasks/matriz sincronizados; R09/R11/R12 local verificados,
R10/T12 e AWS continuam pendentes. Suíte nativa 51/T10 não repetidas porque API,
schema/lockfile/Dockerfile não mudaram; novo teste integrou a configuração.
Ferramentas: Codex, terminal Git/Python/Node/npm/Docker/Compose e navegador;
documentação primária Docker Compose/health/interpolation/down e imagem oficial
PostgreSQL. Fontes no design; sem agentes auxiliares, merge/push/PR/AWS. Próximo
T12; marco feat(compose) preparado após revisão de stage, sem antecipar hash.

A primeira checagem estática posterior ao teste abortou exit 1: scanner lexical
interpretou POSTGRES_PASSWORD=${password} do fonte Node como senha literal.
Revisão confirmou password gerado por randomBytes em memória; env privado fora
do repo, sem valor real no fonte/logs. Tratar apenas essa interpolação conhecida
e o placeholder explicitamente validado como exceções pontuais do scanner,
mantendo os demais padrões e revisão. Não é falha de aplicação nem segredo
descoberto. Corrigida expressão documental ambígua sobre recriar volume:
T12 recria somente containers e mantém o volume. Revalidar antes do stage.

Revalidação estática passou, exit 0: 13 arquivos conferidos, scanner delimitado
sem achados após validar as exceções pontuais, links/cercas/sintaxe/manifest e
ignores corretos. SHA-256 comprovou guia/Dockerfile/schema/lockfile/API e logs
anteriores intactos; api-local manteve o prefixo integral. Matriz com 32
requisitos/34 tarefas: T11/R09/R11/R12 verificados; T12/R10 continuam pendentes.
Não repetir execução Docker por correções apenas documentais/lexicais.

## 28/09/2026 — T12: persistência ao recriar containers

Prompt: após revisar T11, executar a próxima tarefa de tasks seguindo AGENTS;
implementar, validar, corrigir e registrar evidências reais. Estado inicial:
HEAD 534f484, oito commits reais, feat/api-reservas limpa, zero merges. T12
iniciada; T13/AWS continuam pendentes. Planejado: verify-persistence.py em duas
fases, HTTP/SQL antes/depois, IDs de api/db diferentes e mesmo volume nomeado.
O verificador não inicia/remove containers nem volumes; runner isolado controla
up/recriação local, negativo com divergência real e limpeza só do fixture UUID.
Sentinela comprova preservação de outro registro. Nunca usar down -v; volume
exclusivo só pode ser removido no cleanup após comprovar ausência de linhas.
Documentação primária Docker de up/down/volumes consultada; fontes no design.

O helper de apply_patch falhou ao atualizar o arquivo novo com
mountinfo path is not absolute; nenhuma mudança daquele patch foi aplicada.
Atualização realizada por Python fora do isolamento, autorizada pelo ambiente.
Revisão pré-teste ajustou psql -qAt para suprimir status SET na leitura JSON e
rastreou checkpoint reservado para tratar POST com resposta incerta. Isso é
revisão de código antes da primeira execução, não falha simulada de aplicação.

Primeira execução real de npm --prefix app run test:persistence falhou, exit 1,
antes de criar containers: TypeError, Path.open() não aceita opener. Corrigidas
as duas reservas de arquivo para open(..., opener=...) da biblioteca padrão,
que permite criação exclusiva em 0600. Saída original preservada em
/tmp/devops-t12-test-1.txt; não considerar esta execução aprovada. Nenhuma API
ou recurso Docker foi criado nela; conferir e limpar o diretório vazio próprio
antes de repetir o teste completo.

Segunda execução real em 23:09:02 -03:00 passou, exit 0, projeto
prova-reservas-t12-f120991a-89b4-4185-badf-cc8c916bedaa. Registro ID 2
preservado, novos IDs de api/db, mesmo volume/data de criação. GET devolveu
01-10-2026 e SQL DATE 2026-10-01/confirmada. Negativo ID 3 alterado por SQL
somente no próprio marcador devolveu cancelada e check exit 1 esperado; outro
negativo ID 4 sem recriar containers foi recusado/1. Limpezas contaram zero
linhas próprias e mantiveram sentinela ID 1 por HTTP/SQL. Cleanup final removeu
sentinela, confirmou total 0 e zero recursos UUID; env privado removido.

Revisão pós-execução: adicionar verificação real de recusa a sobrescrever
checkpoint existente e do subcomando cleanup para cancelamento manual. Apenas
runner alterado; reexecutar para cobrir esses efeitos de segurança/recuperação,
sem repetir suítes nativa/T10/T11 cujos códigos/configs não mudaram. Logs das
duas execuções anteriores preservados; primeiro TypeError não foi omitido.

Execução final da versão revisada em 23:10:29 -03:00 passou/0: projeto
prova-reservas-t12-ad5e3af6-0128-48f3-aeca-1829b6603bff, PostgreSQL 16.15,
Compose v5.5.1, Python 3.12.3. ID 2/campos/DATE preservados após api/db novos;
mesmo volume e CreatedAt 23:10:30 -03:00. ID 3 negativo cancelada por SQL -> 1;
ID 4 sem recriar -> 1. Prepare repetido devolveu 1 e preservou checkpoint/linha;
cleanup de cancelamento ID 5 passou/0. Sentinela ID 1 preservada em todos os
casos, removida só pelo runner no final. Total SQL 0, down sem -v, volume vazio
exclusivo removido após labels, zero recursos e arquivos privados temporários.
Sem defeito API ou bloqueio restante; negativos são falhas controladas esperadas.

Atualizador documental abortou exit 1 por esperar título inexistente no README
(Ambiente e segredos). Os replace anteriores desse comando já tinham sido
aplicados; título real Configuração do ambiente conferido e continuação feita
sem repetir substituições. Falha auxiliar registrada; não é falha do runtime.
README/AGENTS/specs sincronizados com resultados reais e efeitos dos scripts.
R10/T12 verificados; R06/R22/R29 continuam parciais até AWS/outros scripts;
próximo T13, sem iniciar consultas AWS agora. Ferramentas: Codex, terminal
Git/Python/npm/Docker/Compose e navegador; sem agentes auxiliares nem skill.
Fonte primária Docker up/down/volumes no design. Nenhuma vivência pessoal foi
inventada. Evidências anteriores preservadas; saída de cada teste registrada
com normalização explícita só de trailing whitespace e hash do original /tmp.

Primeira checagem estática pós-teste passou preservação/sintaxe/scanner/links,
mas abortou exit 1 na contagem de tasks: regex incluiu 34 linhas da tabela
principal e 6 referências na tabela de planejamento Git (40 ocorrências).
Conferência mostrou IDs principais únicos/ordenados; corrigido somente o
checker para exigir a coluna de dependência da tabela principal. Nenhuma tarefa
ou código da aplicação foi alterado para satisfazer a contagem. Reexecutar a
validação completa antes de stage/commit; falha auxiliar não representa aceite.

Revalidação estática completa passou exit 0: dez arquivos de escopo, AST Python,
links/cercas/newlines, manifest/lockfile compatíveis e scanner delimitado sem
achados. Guia/API/schema/Compose/Dockerfile/lockfile/script T09 e todas evidências
T04–T11 intactos por SHA-256; transcrições das três execuções conferidas contra
os originais/hash/exit codes. Matriz 32 requisitos/34 tarefas; T01–T12/R10
verificados, T13–T34 pendentes. .env ausente, ignores/fonte versionável corretos,
git diff --check 0. Nenhuma fonte testada foi alterada após a execução final;
não repetir teste runtime por correções documentais/checker estático.
Stage terá somente os dez arquivos revisados; conferir bytes e diff --cached
--check antes de criar o marco Conventional, sem merge/push/commit vazio.

## 28/09/2026 — T13: preflight AWS e versões Terraform

Prompt: aluno revisou T12 e pediu próxima tarefa, reforçando commits somente
quando necessários, coerentes, sem inventar nada. Estado inicial: HEAD 30a2dac,
nove commits reais, feat/api-reservas limpa; nenhum merge/publicação. Escopo
T13: versões/provider/backend DynamoDB, região/identidade/Lab/saldo, AZs,
engine/classe RDS, IP/CIDRs e key pair, somente leitura e configuração privada.
Não executar bootstrap T14, plan/apply/destroy nem acessar entregas de colegas.
Preservar fontes e evidências anteriores por hashes; registrar bloqueios reais.

Primeiro comando auxiliar de inspeção de ferramentas abortou por SyntaxError
no dict Python antes de executar qualquer consulta AWS. Corrigido o comando
em script temporário para inspecionar flags/presença, sem imprimir credenciais.
Não representa falha AWS nem verificação aprovada; fontes do projeto intactas.

STS get-caller-identity em us-east-1 passou/0, perfil default, conta terminada
em 5811, assumed-role voclabs; token de sessão existe no perfil, não impresso.
Aluno confirmou textualmente: "Sim, é o learner lab da prova, o saldo tem 0$
usados de 50$" e "Somente meu IP atual (/32)". Saldo é informação humana do
painel, não medida pela API AWS; registrar fonte e não estimar custos executados.
Consultas AWS read-only passaram: 6 AZs regionais available; EC2 t2.micro
ofertada; RDS PostgreSQL 16.15/db.t3.micro/gp3, mínimo 20 GiB/encriptação e AZs
us-east-1a/us-east-1b conferidos; key pair existente vockey/RSA; profile existente
LabInstanceProfile contém LabRole. Nenhum IAM novo ou mudança de recurso.
IP IPv4 por HTTPS checkip.amazonaws.com, mantido privado; SSH/API só esse /32
conforme aluno. .gitignore preparado antes de infra/preflight.local.json 0600
com contexto conta/IP/CIDRs/Lab/versões/opções, sem credenciais/chave privada.
Este arquivo não é tfvars/plan/state nem concede autorização de apply.

Terraform 1.16.2 e AWS CLI 2.35.6/Python 3.12.3 observados. Selecionado provider
AWS 6.65.0 estável, release oficial e catálogo Registry conferidos. Primeiro
init na sonda temporária/sem credenciais/backend=false falhou/1 dizendo não
haver release compatível; catálogo HTTPS real incluiu 6.65.0 e 6.66.0. Segunda
sonda com instalação direct temporária passou init/validate/0 na mesma 6.65.0.
Config global não existia/não foi alterada; causa da primeira divergência não
comprovada, não atribuir a cache/permissão ou trocar versão sem necessidade.

providers schema -json na sonda com declaração de backend S3 ainda não
inicializado falhou/1: Backend initialization required. Isso é limite da sonda,
não falha do deploy. Corrigir só o root temporário de leitura de schema removendo
a declaração S3; não inicializar backend remoto antes do bootstrap T16.
Preservar stdout/stderr de todas tentativas e registrar o resultado final.

Sonda corrigida sem declaração de backend S3 passou fmt-check/init-backend=false/
validate/schema, todos0. JSON schema efetivamente lido em memória confirmou
aws_dynamodb_table name/billing_mode/hash_key/attribute(name,type) e RDS
engine_version/instance_class/storage_encrypted/publicly_accessible. Lockfile
real do provider6.65.0 preservado em /tmp; caches/diretórios das duas sondas
removidos só depois de conferência. Fonte oficial Terraform1.16.2 baixada por
HTTPS confirmou dynamodb_table String/depreciado e usado por ddbTable; hash e
snippet na evidência. Locking efetivo e init S3 real continuam T21/pós-bootstrap.

aws-preflight.txt construído das capturas reais com stdout/stderr/exit códigos,
hashes e normalização explícita de ANSI/espaços finais; respostas extensas RDS
omissas no trecho publicado, originais em /tmp e consulta específica íntegra.
Logger da tentativa2 escreveu JSON conferido em memória antes de conferir
schema exit1; anotado explicitamente que não houve JSON/conferência naquele
ponto. Conferência só ocorreu na execução final corrigida, exit0. Não tratar a
linha prematura como sucesso. As falhas foram de sondas locais e comandos, não
de implantação AWS; nenhuma implantação ocorreu. Sem bloqueio restante T13.

README/AGENTS/design/tasks/matriz sincronizados; T13 verificado/R13 parcial,
R15/R20/R31/recursos efetivos pendentes. Próximo T14. Nenhum recurso criado,
plan/apply/destroy/push/merge/PR nem mudança de código API/testes/versões locais.
Ferramentas reais: Codex, terminal Git/Python/AWS CLI/Terraform e navegador;
sem agentes auxiliares/skill. Commits somente para conjuntos reais necessários:
um único marco de preflight/documentação/config privada protegida, não um por
sonda/tentativa nem para preencher quantidade. Revisar escopo/segredos/stage.

Revisão final estática passou exit0: oito arquivos de escopo, preservação por
SHA-256 de guia/API/testes/Compose/Dockerfile/lockfile/evidências anteriores,
scanner delimitado sem achados, conta completa/IP ausentes nos versionáveis,
Markdown/links/newlines corretos. Capturas e hashes de todas tentativas reais
conferidos; STS/seis consultas/schema final 0, sonda/cache próprios removidos.
Preflight local 0600/ignorado/não rastreado, nenhum módulo/state criado no
projeto. 34 tarefas/32 requisitos consistentes, T13 verificado/T14–T34 pendentes,
R13 parcial e R15/R20/R31 ainda sem aceite efetivo. git diff --check 0.
Corrigida redação README que poderia sugerir CIDRs/EC2/RDS já aplicados: são
decisões futuras, não implantação. API/suites anteriores não repetidas porque
não houve alteração nesses componentes. Um único commit necessário preservará
o conjunto coerente de preflight após stage/bytes/diff --cached --check.

## 28/09/2026 — T14: bootstrap S3/DynamoDB com state local

Prompt: aluno revisou T13 e pediu próxima tarefa conforme AGENTS; implementar,
validar, corrigir e registrar evidências reais. Estado inicial HEAD 4bd94d4, dez
commits reais, feat/api-reservas limpa; privado T13 já ignorado/0600. T14 iniciada:
bootstrap infra/backend separado, versões exatas Terraform1.16.2/AWS6.65.0,
S3 versionado/AES256/bloqueio público, DynamoDB PAY_PER_REQUEST/LockID String,
tags e outputs do backend futuro. Sem IAM novo nem backend remoto principal
antes de T16. STS read-only revalidou mesma conta/role voclabs em us-east-1;
nenhuma duração restante de token inferida. Planejar cinco recursos somente.

Plan real será gerado/inspecionado/sanitizado, sem apply. Variáveis/conta e plano
binário locais ignorados/0600 antes da execução; backend começa local e segue
separado do state principal. Aprovação específica é T15, aplicação T16. Memória
de outro Lab relatou SCP/ObjectLock; isso não foi observado nesta conta/tarefa e
não autoriza inventar falha nem adaptar criação por CLI sem evidência atual.
Fontes primárias provider6.65.0/S3/DynamoDB, backend local e Terraform plan
consultadas; manter fontes no design. Não repetir testes API/Docker sem mudanças.

Resultado T14 (28/09/2026): criados versions/providers/variables/main/outputs e
tfvars.example; lockfile gerado pelo init real deste root. Variáveis reais locais
criadas com os valores preflight privados e nomes próprios com sufixo aleatório,
sem conta/IP nos nomes, 0600/ignoradas. Antes de validar, regra do bucket ajustada
para rejeitar -an reservado para namespace diferente, conforme fonte oficial;
nenhum erro de aplicação anterior inventado para justificar esse ajuste.

fmt/check passaram 0. Init comum falhou 1: no available releases match 6.65.0;
Registry HTTPS 200 listava versão. Config CLI temporária direct passou init 0,
provider assinado HashiCorp, sem mudar versões/config global. Validate 0.
Repetição init lockfile readonly comum falhou 1: previously-selected version
is no longer available; readonly com direct passou 0. Causa da diferença não
comprovada. Logs originais privados/hashes e ambas falhas preservados, reprodução
README inclui direct temporário. Não escrever que init comum foi bem-sucedido.

Plan real usou credenciais AWS existentes, região us-east-1 e conta protegida:
-detailed-exitcode retornou 2 esperado, cinco create/zero change/zero destroy.
Show JSON retornou 0; assertivas executadas em memória conferiram conta/perfil,
região de todos os recursos, S3 Enabled/AES256/quatro bloqueios/force_destroy=false,
DynamoDB PAY_PER_REQUEST/LockID String, tags no bucket/tabela, ausência IAM/KMS,
vínculos dos três configs e output futuro sem segredos. Arquivo JSON bruto não
publicado: inclui variável sensível em texto claro. Plano válido SHA-256
9a66a21421881b982e3d8a6603bf5d0f57d2c035825b339e54816877171dba12.

Negativo -var=state_bucket_name=prova-6325231-an foi rejeitado/1 esperado pela
validação; tabela mostrada naquele plano parcial não foi criada, nenhum apply.
Não salvou novo plano; hash do backend.tfplan válido permaneceu idêntico.
S3 list-buckets filtrado apenas nome próprio retornou []/0 antes/depois; DynamoDB
describe-table retornou ResourceNotFoundException/254 esperado antes/depois;
STS query Account 0 e conta idêntica ao preflight conferida sem publicá-la.
Ausência comprovada nesta conta, não unicidade global garantida. Terraform local
backend configurado nos metadados, state de recursos ainda ausente; tfvars,
plano e metadados 0600 ignorados. Config direct /tmp temporária, nenhuma alteração
em ~/.terraformrc. Cache/variáveis/plano mantidos localmente para T15/T16.

Evidências backend-validate.txt/backend-plan.txt geradas somente das capturas
reais (stdout/stderr combinados, conta mascarada, só espaços finais normalizados),
hashes/exit codes conferidos. Fonte e detalhes design/README; specs/AGENTS
atualizados: T14 verificada, R19/R20/R21 parciais. Sem bloqueio restante;
T15 revisão/custo/autorização, T16 aplicação/conferência, T21 locking real.
Zero apply/destroy/merge/push/PR, recursos criados ou testes API/Docker repetidos.
Ferramentas reais: Codex, terminal Python/Git/Terraform/AWS CLI e navegador;
sem skills/agentes auxiliares. Um único commit necessário para implementação,
evidências e documentação do mesmo marco, após revisão de escopo/segredos.

Conferência final/documentação encerrada em 29/09/2026 após meia-noite;
fmt/init/validate/plan/negativo ocorreram em 28/09, com timestamps nas evidências.
Primeiro verificador documental temporário retornou 1: regex lendo todo tasks.md
confundiu tabela Git futura com tabela de estados, sobrescrevendo T08–T12 no
mapa. Corrigida só seleção da seção no script /tmp; não alterados estados para
forçar sucesso. Reexecução em 00:01:32 -03:00 retornou 0: 15 arquivos de escopo,
45 arquivos anteriores preservados por SHA-256, guia intacto, Markdown/links/
newlines/diff corretos, 34 tarefas consistentes, R19/R20/R21 parciais; scanner
delimitado sem achados, conta/IP privados ausentes. Capturas/codes/hashes
conferidos; plano válido intacto, vars/plano/metadados ignorados/0600 e state de
recursos ausente. Sem apply nem bloqueio T14. Evidência preserva a falha da sonda
sem apresentá-la como problema AWS. Próximo T15 continua revisão/autorização.
Stage deve conter somente estes 15 arquivos, bytes idênticos ao worktree;
commit único proposto: feat(backend): adiciona bootstrap S3 e DynamoDB.

## 29/09/2026 — T15: revisão concreta antes de autorização do bootstrap

Prompt: aluno revisou T14 e pediu próxima tarefa conforme AGENTS; implementar,
validar, corrigir e registrar evidências reais. Inicial HEAD d6f4d25/11 commits
reais em feat/api-reservas, 0 merges, worktree limpa. Próxima T15 exige revisão
plano/escopo/custo e decisão humana antes de apply; regra 10 não permite presumir
aprovação específica pelo pedido genérico de executar a próxima tarefa.

Snapshot por hash de todos os arquivos rastreados antes de editar, preservado
em /tmp. Plano T14 privado local ignorado/0600 reaberto por show JSON/0 em
00:11:53 -03:00, SHA-256 idêntico 9a66a21421881b982e3d8a6603bf5d0f57d2c035825b339e54816877171dba12.
Assertivas reais em memória: exatamente cinco create, zero update/delete,
região us-east-1 em cada recurso, conta/perfil, versão1.16.2/provider6.65.0,
versionamento/AES256/quatro flags de bloqueio/LockID S/PAY_PER_REQUEST/tags/
force_destroy=false/outputs sem segredo/backend local conferidos. Nenhum JSON
bruto publicado, state local de recursos ainda ausente. Não regenerado plano.

Consultas read-only atuais: STS/default/us-east-1 0 mesma conta terminada5811/
voclabs, sessão ocultada; S3 filtrado só nome próprio []/0 e DynamoDB nome próprio
ResourceNotFoundException/254 esperado. Ausência na conta/região, sem afirmar
unicidade global S3 ou duração futura do token. Credenciais/conta revalidar T16.
Nenhum apply/destroy/criação, não constatada restrição SCP/ObjectLock atual.
Código Terraform/.gitignore/lockfile/API/Docker/Compose/evidências anteriores
preservados; suites sem mudanças não repetidas.

Preços oficiais públicos HTTPS 200 em us-east-1: S3 versão20260928230416,
DynamoDB versão20260911124422 e transferência versão20260916132208. Metadados/
SKUs/unidades/faixas/hashes/instantes em backend-revisao.txt, JSONs públicos /tmp.
Navegador retornou Internal Error nos dois JSONs; download Python HTTPS passou,
sem falha AWS ou bloqueio restante. DynamoDB table_class null no plano, omitido;
Default Standard confirmado em docs provider6.65.0/AWS, estimativa não afirma
classe efetiva antes de apply. Não descontados créditos/franquias/free tier.
Saldo US$0 usados de US$50 é relato humano T13, não medido agora.

Cenário hipotético mensal: 10MiB totais S3 incluindo versões/1MiB DDB/1000
requests Tier1/Tier2 e 1000 WRU/RRU/10MiB saída. Tarifa/storage/unidades reais
conferidos; cálculo Decimal. Primeira execução da sonda custo retornou1 porque
assertiva usava soma manual errada0.0074970703125. Corrigida assertiva temporária,
mantendo preços e cálculo, verificada faixa0<total<0.01. Reexecução0, total real
0.00749765625, arredondado para cima US$0.008 (~US$0.01/mês). Varia com uso/duração;
sem custo medido/teto automático/tributos/conversão. Erro registrado sem
apresentá-lo como problema de implantação.

backend-revisao.txt registra plano concreto, consultas/custo/fontes/correções e
decisão pendente. README/AGENTS/design/tasks/matriz sincronizados: T15 em
andamento, R31 parcial, T16 pendente; aguardará autorização específica após
conferência dos documentos. Ferramentas reais Codex, terminal Python/Git/AWS CLI/
Terraform e navegador, sem skill/agentes auxiliares. Nenhum commit extra nesta
preparação; mudanças reais permanecem para marco coerente após decisão.
Não simular autorização/sucesso/T16; tempo decorrido não é aprovação.

Conferência final antes de pedir autorização em 00:20:22 -03:00, exit0:
sete arquivos de escopo (seis documentos + backend-revisao.txt), 54 anteriores
preservados por SHA-256; guia/código Terraform/lockfile/old evidences intactos.
Scanner delimitado sem achados; conta/IP completos ausentes, Markdown/links/
newlines/diff --check 0. 34 tarefas consistentes, T15 em andamento/T16 pendente,
R31 parcial, stage vazio/HEAD d6f4d25/11 commits/0 merges preservados. Capturas
AWS/preços/hash/codes e cálculo Decimal conferidos; soma racional independente
confirmou total0.00749765625. Arquivos privados ignorados/0600, plano com mesmo
hash e variáveis locais conferidas em memória contra plano, valores idênticos.
Revisão pronta para apresentar pergunta específica, sem antecipar resposta.

Em 2026-09-29T00:22:50-03:00, pergunta específica enviada por request_user_input_async,
accepted=true, com conta/região/nomes/cinco criações/hash e cenário de custo.
Opções autorizar somente bootstrap descrito ou não autorizar agora. Exigência
explicada com link e trecho literal da regra10/AGENTS. Nenhuma resposta recebida
até este registro; não inferir aprovação de opção preselecionada/tempo decorrido.
T15 segue em andamento, T16 pendente; aguardar resposta para registrar decisão,
sem executar apply nem criar commit adicional nessa revisão pendente.

## 29/09/2026 — decisão T15 e execução autorizada T16

Em 2026-09-29T00:29:22-03:00, registrada resposta real à pergunta de bootstrap:
"Autorizo tudo que for necessário para a conclusão do que foi proposto". Registra-se autorização para o escopo
apresentado, cinco criações bootstrap/conta final5811/us-east-1/nomes/atributos e
custo do cenário já revisado, plano SHA-256 9a66a21421881b982e3d8a6603bf5d0f57d2c035825b339e54816877171dba12.
Não estende para principal/EC2/RDS/rede/deploy/destruição. T15 verificada pela
decisão explícita; T16 inicia revalidação conta/plano e apply seguido de consultas
reais, conforme autorizado. Não pedir novamente a mesma autorização.

Primeira tentativa de registrar essa decisão não executou nenhum comando:
a revisão automática falhou por limite de uso, com mensagem 'Automatic approval
review failed: You’ve hit your usage limit' e orientação de tentar às00:26.
Isso foi falha de revisão, sem determinação de insegurança. Após 'continue de
onde parou', nova leitura às00:28:34 passou pelo mesmo fluxo de aprovação, sem
contorná-lo; confirmou que script/registro não existiam e nada fora aplicado.
Predicado test -f do script ausente retornou1 esperado na leitura; não é falha AWS.

HEAD inicial d6f4d25/11 commits/feat/api-reservas, 0 merges. Seis documentos e
backend-revisao.txt preparados na T15 preexistem; serão preservados e comporão
marco coerente de bootstrap aplicado/evidências. Snapshot SHA-256 dos arquivos
rastreados e review preexistente em /tmp; credenciais/vars/plan fora do Git,0600.
Nenhuma execução AWS será anunciada como verificada antes dos comandos reais.

T16 preflight real em00:30:38 -03:00 passou: plano/hash/código/lockfile/vars
intactos, STS0 mesma conta/voclabs, S3[]0 e tabelaNotFound254. Apply autorizado
00:31:16–00:31:33 retornou1: tabela criada em13s, erro S3GetObjectLockConfiguration
403/AccessDenied/explicit deny in a service control policy. Não é ExpiredToken
nem falta de IAM a contornar. Nenhum sucesso total anunciado. Log bruto privado
com hash; evidências mascaram todas contas/sessão e IDs de Organization/SCP.

State parcial local0600 serial3 tem DynamoDB normal e buckettainted com os IDs
próprios. Consultas00:34 em AWS confirmam bucketexistente/regiãoEast1/null,
tags3/AES256/BPA4true e tabelaACTIVE/PAY_PER_REQUEST/LockIDS/tags3. Versioning
retornou stdoutvazio/0 (sem status Enabled); configurações TF ainda não aplicadas.
A criação do bucket ocorreu no applyparcial, não por CLI ou simulação.

Fontes primárias providerAWS6.65 bucket.go confirmam chamada GetObjectLock no
Read completo; bucket_data_source.go faz HeadBucket/região/website sem essa API.
SCP é limite da organização, não alterarIAM/SCP/região para contorná-lo.
Escolha de recuperação dentro do mesmo escopo autorizado: preservar recursos
criados/nomes/região/custo; usar data bucketexistente e manter3configurações
S3/tabela no Terraform. removed { destroy=false } representa handoff sem apagar
bucket, documentado pelo Terraform1.16. Não usar-refresh=false/lock=false/target
ou aplicar substituição do bucket tainted. Gerar/revisar plano de recuperação
antes de aplicar; se houver delete/replace fora do escopo, não prosseguir.

Em2026-09-29T00:35:32-03:00, backup
exclusivo terraform.tfstate.pre-recovery0600/ignorado com bytes idênticos ao
stateparcial, SHA256ad68b70502b13b33d34be84b2a23ceb4366fb5aa64a77256a1cbfe26147a18da. main/outputs ajustados
para handoff e data regionpostcondition; expected_bucket_owner em3configs
protege conta. Testar fmt/validate/plan reais antes de afirmar recuperação.
Não recriar bucket/tabela nem ampliar escopo/principal; teardown segue separado.

Primeiro validate da recuperação retornou1: expected_bucket_owner não suportado
em aws_s3_bucket_public_access_block no provider6.65.0. Corrigido removendo só
esse argumento nessa configuração; versão/encriptação suportam o campo.
Ownership do bucket já foi conferido por CLI expected owner/conta/região antes
de alterar a configuração. Não alterar provider/IAM para aceitar argumento.
Preservar captura da falha e executar validate/plan da correção.

Plano recuperação real00:37:04–00:37:12 -03:00 retornou2 esperado; show JSON0
00:38:26 conferiu3create (configsversion/encrypt/BPA), bucketforgetsemdelete e
DynamoDBno-op. Hash8d6b2eb17929552712bc152a1f8d794e184c2ceacfa69d086e5c4ec3003503a2, original9a66...ba12
preservado. Nenhum delete/replace/serviço/região/nome novo; mesmas proteções e
custo do bootstrap autorizado. Backup/stateparcial bytesidênticos antes do apply,
privados0600ignorados. Conta/role STS0 e HeadBucketexpectedowner0 revalidados
em2026-09-29T00:39:20-03:00.

Plano concreto apresentado ao aluno em commentary antes de aplicar:3configs
S3,0exclusões,bucketpreservado,tabela semalteração. Autorização explícita
"tudo que for necessário para a conclusão do que foi proposto" cobre essa
recuperação do mesmo escopo; não pedir de novo nem estender à infraestrutura
principal/teardown. Avisos reais: bucketdesvinculado semdestruição e campos
expectedownerdeprecated ainda suportadosna versãofixada; preservar no log.
A recuperação não elimina/editaSCPnemIAM; deixa de usarAPIObjectLock nãoexigida
para stateversionado/AES256/locking. Bucketexistenteconsultado, não recriado.


Conclusão recuperação: apply 00:39:20–00:39:32 -03:00, exit 0, três configs adicionadas/
zero alteradas/destruídas; bucket/tabela preservados. Oito consultas AWS 00:41:32
retornaram0: regiãoEast1, Enabled/AES256/BPA4true/tags3, versions/delete markers0,
tabelaACTIVE/on-demand/LockID String/mesmo TableId. Hash/saídas reais em backend.txt.
Verificador temporário falhou após consultas por KeyError:'sensitive': state
bruto omite campo opcional em output não sensível. Corrigido get('sensitive',False)
e output-json nativo 0/sensitive=false. Rechecagem00:45:45/0 reutilizou capturas,
sem repetir/sobrescrever AWS. T16 só aceita após corrigir esse erro local.
Leitura docs/diario-de-implementacao.md retornou1 inexistente; corrigida para
arquivo real docs/diario-ia.md. Uma tentativa apply_patch de script temporário
falhou em validação do patch; nenhum arquivo aplicado, criação via terminal.
Plan posterior00:41:54–00:42:02 com refresh/locking normal0/No changes.
Fmt em 00:46:03/0,state list em 00:46:06/0,output em 00:46:23/0. State local serial 8/0600,
4managednormais+data. Root remoto/init/objeto/lock efetivo não executadosT21.
Conceito: state local bootstrap e handoff sem destruir para restrição real do
Lab. Removed/destroyfalse preserva; data consulta sem ObjectLock; proteções S3/
tabela no TF. Bucket físico/tags exigem reprodução/limpeza CLI autorizadas,
documentadas. Nenhum create-bucketCLI nesta sessão. SemIAM/SCP/provider/escopo novo.
Main/outputs, backend.txt/revisão e seis documentos sincronizados. T15/T16
verificadas; R20/R21/R19/R22/R31 parciais. Próxima T17, não iniciada. API/Docker/
Compose preservados, sem repetir testes. Sem principal/EC2/RDS/deploy/destruição,
sem saldo/custo real medidos. Ferramentas Codex/Python/Git/Terraform/AWS CLI e
fontes primárias web, nenhuma skill/agente auxiliar. Commit coerente necessário
após diff/evidências/segredos, sem commit vazio/por tentativa/por quantidade.

Conferência final em 00:57:15 -03:00/exit 0: dez arquivos de escopo, 52
anteriores preservados por SHA-256, inclusive guia/API/Docker/Compose/provider/
versions/lockfile/vars e evidências T14. Diário e revisão anteriores preservados
como prefixos idênticos; 34 tarefas únicas/T01–T16 verificadas/T17–T34 pendentes,
32 requisitos únicos e parciais mantidos. Links/fences/newlines/diff --check 0,
scanner delimitado sem achados/conta-IP privados ausentes. State/backup/planos/
tfvars/preflight ignorados/0600. Hashes originais de consultas AWS e planos
conferidos; show JSON do plano posterior 0/todos no-op. Nenhum apply adicional.
HEAD d6f4d25/11 commits/feature/zero merges intactos antes do commit. Preparar
um único commit fix(backend) com recuperação/evidências e decisão T15, sem push.
