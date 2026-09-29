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
