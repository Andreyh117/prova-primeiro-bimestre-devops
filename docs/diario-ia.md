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
