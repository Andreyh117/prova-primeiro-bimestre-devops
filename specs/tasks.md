# Tarefas, dependências e evidências

## Uso e estado atual

Executar uma linha por vez, seguindo `AGENTS.md`. Ler o requisito associado,
implementar apenas seu escopo, executar a verificação, corrigir falhas, registrar
resultado real e atualizar esta tabela e a matriz de requirements.

- `pendente`: não executada; pode depender de etapas anteriores.
- `em andamento`: execução iniciada, aceite ainda não comprovado.
- `verificado`: aceite desta tarefa efetivamente conferido; indicar o ambiente.
- `bloqueado`: falta identificada impede executar; explicar o que a resolve.

Em 28/09/2026, o aluno revisou as specs e definiu a data como `DD-MM-YYYY`.
T03 e T04 estão verificados: revisão humana e proteção/documentação validadas
localmente. T01–T04 não comprovam API, Docker, Terraform, AWS ou entrega.
O aluno revisou T04 e autorizou T05, agora verificada: commit inicial `21cb5f0`
em main e feature branch `feat/api-reservas`. A verificação é somente Git local;
R02 ainda depende dos demais commits e merge. O aluno revisou T05 e autorizou
T06, agora verificada: dependências, schema/conexão e 18 testes com PostgreSQL
16.15 real. Próxima tarefa pendente: T07, POST e GET de reservas.

## Plano de tarefas pequenas

Os arquivos em `evidencias/` abaixo são destinos previstos. T04 produziu
`evidencias/segredos-checklist.txt`; T05 produziu `evidencias/git-workflow-inicial.txt`
após executar Git. Não considerar os demais logs existentes sem conferi-los.
Cada tarefa recebe entrada no diário.

| Tarefa | Dependências | Requisitos | Ação pequena | Verificação / ambiente | Evidência esperada | Estado |
|---|---|---|---|---|---|---|
| T01 | — | R28, R30 | Inspecionar pasta/Git/instruções; ler guia, enunciado e método sem colegas. | Leitura e comandos locais; confirmar branch, arquivos e ausência de commits; cotejar fontes com commit. | Registro real abaixo, guia preservado. | verificado |
| T02 | T01 | R28 | Produzir AGENTS e requisitos/design/tarefas; conferir cobertura e referências. | Revisão estática: IDs, dependências, Markdown/links locais, escopo restrito aos quatro documentos e guia inalterado. | Estes quatro documentos; resultado da conferência abaixo. | verificado |
| T03 | T02 | R28, R30, R32 | Aluno revisa pontos do design; registrar alterações e autorização para iniciar implementação. | Revisão humana explícita; esclarecer escolhas sem presumir resposta. | Resposta do aluno e decisão registrada. | verificado |
| T04 | T03 | R01, R03, R24, R30 | Criar .gitignore, README com placeholders honestos e diário; preparar proteção antes de qualquer segredo. | `git check-ignore`, revisão de staged e consistência de variáveis; revisão documental local. | .gitignore, README, diário; checklist de segredos. | verificado |
| T05 | T04 | R02, R28 | Commit inicial coerente dos documentos revisados; criar feature branch. | Git local mostra commit real e branch; não publicar sem escopo autorizado. | Diário e `evidencias/git-workflow-inicial.txt`; commits reais posteriores por marco. | verificado |
| T06 | T05 | R04–R06, R12, R32 | Selecionar/fixar dependências, implementar schema e conexão parametrizada; configurar PostgreSQL real de teste. | Instalação/lockfile; schema no banco isolado e consulta real; não mockar integração. | app/sql, package/lockfile e evidencias/t06-*.txt: instalação, 18 testes e falha controlada. | verificado |
| T07 | T06 | R04–R07, R32 | Implementar POST/GET lista/GET por ID com obrigatórios e 404. | Testes de integração no PostgreSQL: criar, listar, consultar, datas DD-MM-YYYY válidas/impossíveis/bissextas, ausentes/inválidos e 404; conferir SQL. | Testes e primeira parte de api-local.txt. | pendente |
| T08 | T07 | R04–R07, R32 | Implementar PUT completo, DELETE e /health com erros uniformes. | Banco real: atualizar mesma linha preservando DD-MM-YYYY, rejeitar parcial/data inválida, excluir, segundo DELETE 404 e banco indisponível 503. | Testes completos e health-local.txt. | pendente |
| T09 | T08 | R06, R22, R29 | Criar verify-api.py e validar persistência ao reiniciar API nativa; documentar dependências. | Script passa, falha controlada retorna não zero e linha sobrevive ao restart; SQL real confirma. | api-local.txt e postgres-local.txt; commit real de API/testes. | pendente |
| T10 | T09 | R08, R22 | Criar Dockerfile não-root e .dockerignore; build e execução da API com banco real de teste. | Build, UID não zero, container servindo /health e CRUD; confirmar exclusão de segredos no contexto. | docker-build.txt, docker-run.txt; commit real Docker. | pendente |
| T11 | T10 | R09, R11, R12 | Criar Compose API/db, env.example, bridge, healthchecks e dependência condicionada. | Configuração sem imprimir segredos; up --build --wait e ps; seis rotas funcionais. | compose-ps.txt, compose-rede-saude.txt; commit real Compose. | pendente |
| T12 | T11 | R06, R10, R22, R29 | Criar verify-persistence.py; testar recriação sem apagar volume. | Registro e SQL antes/depois da recriação; falha controlada; limpeza só de dados de teste. | compose-persistencia.txt e README atualizado. | pendente |
| T13 | T12 | R13, R15, R20, R31 | Preparar AWS: versões/provider, região/conta/Lab/saldo, AZs, engine RDS, IP/CIDRs e key pair. | Consultas oficiais/read-only; confirmar engine/classe e DynamoDB na versão fixa; sem credenciais em logs. | Decisões no diário e aws-preflight.txt; variáveis locais ignoradas. | pendente |
| T14 | T13 | R19–R21 | Implementar bootstrap S3/DynamoDB com state local separado. | fmt/init/validate em infra/backend; plan real revisado para região/tags/encriptação/versionamento/IAM ausente. | backend-validate.txt e plano sanitizado; commit backend. | pendente |
| T15 | T14 | R21, R31 | Apresentar plano bootstrap e obter autorização específica. | Aluno confere recursos, escopo/custo e autoriza antes de apply. | Decisão no diário; plano binário local ignorado. | pendente |
| T16 | T15 | R20, R21 | Aplicar somente bootstrap autorizado; conferir recursos antes do init principal. | Apply real e consultas S3/DynamoDB; versão/encriptação/public access block/LockID efetivos. | backend.txt; sem marcar infraestrutura principal implantada. | pendente |
| T17 | T16 | R14, R19 | Implementar módulo vpc e validar contrato de subnets/rotas. | fmt e init/validate em root de validação isolado; quatro subnets em duas AZs e rotas públicas/privadas no plan futuro. | Diário e revisão estática do módulo. | pendente |
| T18 | T17 | R15, R19 | Implementar security-group com regras separadas e CIDRs explícitos. | fmt/validate; conferir referências sem ciclo, 22/3000 restritas e 5432 só SG EC2. | Diário/checklist de SG; execução efetiva ainda pendente. | pendente |
| T19 | T18 | R17–R19 | Implementar rds com privadas, classe, engine, encriptação e senha sensível. | fmt/validate; DB subnet group privado e outputs sem senha; plano no root composto depois. | Diário/checklist do RDS. | pendente |
| T20 | T19 | R13, R16, R19 | Implementar ec2 com AMI/tipo/subnet/SG/profile existente e bootstrap sem segredos. | fmt/validate; revisar user-data, IMDSv2, disco e ausência de IAM novo. | Diário/checklist EC2. | pendente |
| T21 | T20 | R19–R22 | Compor root, configurar backend efetivo e gerar plano principal. | fmt/init real/validate/plan; outputs alimentam inputs; confirmar state remoto/locking e tags. | terraform-validate.txt, terraform-plan.txt, backend-locking.txt; commit módulos. | pendente |
| T22 | T21 | R13–R20, R31 | Apresentar plano principal, revisar segurança/custo e obter autorização de provisionamento. | Checklist humano do plano com conta/região, tipos, SG, subnet, state e IAM. | Diário da revisão/autorização; não marcar deploy verificado. | pendente |
| T23 | T22 | R14–R18, R22 | Aplicar principal autorizado e conferir atributos AWS efetivos. | EC2 running, RDS available, subnets/SG/encriptação/profile reais; outputs sem segredos. | aws-rede.txt, aws-rds.txt, aws-seguranca.txt, terraform-outputs.txt. | pendente |
| T24 | T23 | R06, R07, R16, R17, R29 | Implementar/declarar deploy repetível; imagem por SSH, SQL no RDS, ambiente protegido, serviço API. | Image checksum/commit, schema idempotente, serviço/reboot, /health na EC2 e nenhum PostgreSQL local na nuvem. | ec2-deploy.txt, health-aws.txt; commit deploy. | pendente |
| T25 | T24 | R04–R07, R17, R22, R29 | Criar verify-aws.py e executar CRUD/persistência na EC2/RDS. | HTTP completo + SQL pela EC2/TLS; restart API preserva dados; SG/RDS reais; falhas retornam não zero. | api-aws.txt, rds-crud.txt, aws-seguranca.txt. | pendente |
| T26 | T25 | R24, R25, R30 | Redigir relatório com contribuição do aluno, a partir do diário/evidências. | Quatro respostas dissertativas de dez linhas cada; IA e ferramentas reais; aluno revisa sua experiência. | relatorio.md, diário; limitações honestas, sem inventar desafios. | pendente |
| T27 | T26 | R22, R23, R31 | Revisar evidências e preparar plano destroy principal + política explícita de dados/snapshot. | Logs reais/sanitizados; plan -destroy com backend ainda ativo; autorização específica de descarte/retenção. | Diário, checklist e plano de destroy sanitizado. | pendente |
| T28 | T27 | R23 | Executar destroy principal autorizado e confirmar ausência de recursos. | Destroy real; state principal vazio e consulta AWS por identifiers/tags; registrar retenções. | terraform-destroy.txt, aws-pos-destroy.txt. | pendente |
| T29 | T28 | R23, R31 | Preparar limpeza backend, listar versões/delete markers e explicar retenção/state. | Conferir principal encerrado, state bootstrap disponível e nenhum lock ativo; obter autorização de escopo separado. | Diário e plano/checklist backend-teardown. | pendente |
| T30 | T29 | R23 | Executar limpeza de versões/backend autorizada e conferir resultado. | Limpeza somente dos recursos do projeto, destroy bootstrap pelo state local; registrar sobras ou falhas reais. | backend-teardown.txt; não declarar limpeza integral se houver pendência. | pendente |
| T31 | T30 | R01–R03, R22, R25, R29 | Criar verify-delivery.py, confirmar identidade/público, completar README/índice/evidências e revisar Git. | Arquivos/links/relatório; seis commits reais; script falha quando requisito observável faltar. | entrega-checklist.txt e revisão final de segredos. | pendente |
| T32 | T31 | R02 | Merge da feature preservando histórico e branch; capturar evidência Git. | Merge real --no-ff, mensagens convencionais, grafo/branches e contagem final ≥6; trabalho limpo. | git-log.txt, git-branches.txt; commit final honesto de docs quando necessário. | pendente |
| T33 | T32 | R01, R26, R27 | Preparar entrega.md no fork isolado; verificar acesso público, base/head, diff e data presencial. | Apenas caminho da prova alterado; checklist verdadeiro, links válidos e data confirmada; ainda sem abrir PR. | entrega.md no fork, diff revisado e diário. | pendente |
| T34 | T33 | R26, R27 | No dia da prova e com comando explícito, abrir único PR presencial; congelar head. | Confirmar nenhum PR prévio do RA, uma URL real, base/head e commit final; nenhum commit posterior no PR. | URL do PR e registro final. | pendente |

### Detalhes de execução que não cabem na tabela

- T17–T20: módulos não são validados com variáveis mágicas inexistentes. Usar
  root de validação temporário com inputs não sensíveis, ou composição parcial
  válida criada na tarefa; registrar o comando exato e não chamar de teste AWS.
- T21: locking é comprovado pelo mecanismo real descrito no design; uma
  tentativa inconclusiva não é aceita como evidência de contenção.
- T24: configurar deploy após outputs RDS evita colocar senha em user-data.
  A autorização da tarefa cobre a implantação nesse ambiente de prova; aplicar
  mudança de infraestrutura fora do plano revisado exige nova revisão.
- T26: relatório pode registrar que destroy está pendente; depois de T28/T30,
  atualizar somente com os resultados realmente obtidos antes da revisão final.
- Commits ao concluir marcos autorizados são reais e revisados. A primeira etapa
  não cria nenhum. Não acumular tudo para inventar seis commits no final.
- T32: capturar grafo depois do merge e, se a evidência requerer commit de docs,
  recapturar grafo incluindo esse commit e registrar o ponto capturado. Nenhum
  desses commits pode acontecer após a abertura do PR em T34.
- T34 é a submissão à disciplina. Push/publicação do projeto em T31–T33 depende
  da autorização da etapa e de autenticação real, não da mera existência do remote.

## Registro real desta primeira etapa

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

## Retomada

T03 foi desbloqueado em 28/09/2026 pela mensagem do aluno: "Revisei as specs,
quero mudar o formato de data, deverá ser : DD-MM-YYYY. Execute a próxima tarefa
pendente de specs/tasks.md, seguindo AGENTS.md." Mudança aplicada em D02/R32;
os outros pontos seguem a revisão informada. API e testes de data são futuros.

T04 verificado em 28/09/2026: .gitignore, README e diário criados; 51 consultas
reais de `git check-ignore` passaram (32 sensíveis/artefatos ignorados; 19 fontes,
exemplos e evidências preservados). Guia inalterado, index vazio, main sem commits,
links e 11 nomes de variáveis consistentes; nenhuma chave/token no conjunto de
padrões consultado. A primeira validação documental falhou (exit 1) por espaços
finais do README e separação de R32 da tabela; corrigidos, reexecução passou
(exit 0). Saída real preservada em `evidencias/segredos-checklist.txt`; decisões,
prompt e correções em `docs/diario-ia.md`. Revisão futura de segredos continua
obrigatória antes de cada commit: R03 vale para os arquivos/estado atuais.

No encerramento de T04, identidade/data ainda eram placeholders; foram informadas
pelo aluno na retomada T05 abaixo. Não houve bloqueio em T04.
Próxima tarefa pendente: T05, commit inicial e feature branch. Nenhum stage,
commit, push, teste de API/container/Terraform ou acesso AWS foi feito aqui.

### T05 — retomada autorizada em 28/09/2026

O aluno revisou T04 e pediu preencher README com Andreyh Rodrigues de Souza,
RA 6325231 e entrega 01/10/2026, além de executar a próxima tarefa. T05 está em
andamento. Os dados e contexto atual foram sincronizados; o contrato JSON
DD-MM-YYYY permanece aprovado. Antes do commit: revisão dos nove arquivos,
proteção de segredos/artefatos, preservação do guia e validação do index.

A identidade Git já está configurada; o pedido de nome no README não altera
user.name/user.email. Não divulgar o e-mail nos logs. O commit inicial terá
mensagem Conventional real; a branch `feat/api-reservas` será criada depois.
A evidência será coletada somente após os comandos, sem antecipar aprovação.

### T05 — resultado verificado

Commit inicial real `21cb5f0c19f2973c61c67f79543f22063853a04e` em main, mensagem
`docs: registra especificacao e preparacao da prova`. Branch `feat/api-reservas`
criada depois, inicialmente apontando para esse commit. `git diff --cached --check`
passou; staged conteve somente os nove arquivos revisados; guia preservado,
identidade README correta e scanner delimitado sem achados. Git confirmou root
sem parent, contagem 1 nesse ponto, main e feature com o mesmo hash e worktree
limpa. A evidência real registra esse snapshot em
`evidencias/git-workflow-inicial.txt`, incluindo saídas e exit codes.

T05 foi marcada verificado somente após commit/branch reais. Um commit documental
na feature versiona esta evidência posterior e o estado atualizado; não há merge
nem seis commits completos. R02 permanece em andamento. Próxima tarefa: T06.
Nenhum push/PR/provisionamento foi executado; entrega informada 01/10/2026.

### T06 — resultado verificado em 28/09/2026

O aluno revisou T05 e pediu executar a próxima tarefa. Foram fixados Express
5.2.1 e pg 8.23.0, gerado lockfile e confirmado `npm ci` (ambos exit 0).
Implementados schema de quatro colunas, pool, bootstrap SQL idempotente e CLI
de migração. O teste auto-organizado usa Docker local, senha efêmera, loopback
e tmpfs; não cria .env nem usa banco externo. A imagem PostgreSQL é oficial,
fixada por digest, e executou versão 16.15.

`npm --prefix app test`: 18 passaram, 0 falharam, exit 0, migração real concluída.
Os 15 casos de banco confirmaram estrutura, SQL parametrizado, leitura por duas
conexões reais, DATE/formatação, idempotência e constraints. Três casos de
configuração confirmaram validação de variáveis/porta e configuração TLS com CA.
TLS/RDS não foi executado; CRUD HTTP e validação externa DD-MM-YYYY são T07/T08.
Migração sem PGHOST retornou exit 1 esperado, sem tentar usar uma conexão padrão.
Limpeza confirmou zero containers de teste remanescentes.

Evidências: `evidencias/t06-dependencias.txt`, `evidencias/t06-postgres-local.txt`,
`evidencias/t06-falha-controlada.txt`. Não houve falha da suíte a corrigir; a falha
controlada era um teste negativo planejado. O bloqueio do sandbox nas leituras
foi resolvido com execução autorizada fora do isolamento, sem bloqueio restante.
Próxima tarefa: T07. Não houve HTTP/Compose/Terraform/AWS/push nesta etapa.
