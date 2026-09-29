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
16.15 real. O aluno revisou T06 e autorizou T07, agora verificada com 35 testes,
POST/GET HTTP reais e SQL independente. O aluno aprovou a regra de commits,
revisou T07 e autorizou T08, agora verificada com CRUD completo, saúde/503 e
48 testes reais. Após revisão de T08, o aluno autorizou T09, verificada com 51
testes: script exit 0/1 e reserva mantida por SQL/GET ao reiniciar a API nativa.
T09 foi commitada em 93d313c. Após revisão, o aluno autorizou T10, verificada
com duas execuções Docker/UID/contexto/HTTP/SQL reais, exit 0 e limpeza confirmada.
T10 foi commitada em 49dbd5e. Após revisão, o aluno autorizou T11: Compose/API/db
saudáveis, ordem de início, rede/volume/ambiente e CRUD/SQL reais verificados,
exit 0 e limpeza confirmada; config sem senha retornou 1 esperado.
Após revisão, o aluno autorizou T12: persistência HTTP/SQL depois de recriar
api/db, mesmo volume, negativos/checkpoint/sentinela/cleanup reais. Primeiro
TypeError corrigido; duas reexecuções passaram/0, com falha inicial preservada.
Após revisão, o aluno autorizou T13 e reforçou commits somente por mudanças
necessárias/coerentes. T13 verificada: consultas AWS read-only, Lab/saldo/CIDRs
confirmados pelo aluno, opções EC2/RDS/AZ/key/profile reais, versões/schema
validados em sonda local sem backend remoto. Falhas/correções preservadas.
Após revisão, T14 implementou bootstrap local e passou fmt/init direct/validate/
plan real revisado: cinco criações propostas, sem apply. Falhas/correção de init
e consultas antes/depois preservadas. T15 recebeu autorização explícita para
bootstrap em 29/09/2026. T16 verificada: apply parcial falhou por SCP, recuperação
preservou bucket/tabela e aplicou três configs S3; consultas AWS e plan posterior
sem mudanças passaram. Evidência backend.txt, bucket físico fora da criação/
remoção TF. Após revisão de T16, aluno autorizou T17, agora localmente verificada:
módulo VPC/testes, fmt/init/validate/grafo 0 e nove testes mock locais 0; sem API
AWS/provisionamento. Após revisão, T18 local verificada: security-group/regras
separadas, fmt/init/validate/grafo 0 e 14 testes mock locais 0. Primeiro fmt 2
corrigido, captura preservada. Após revisão, T19 local verificada: módulo RDS,
fmt/init/validate/grafo/schema 0 e 17 testes mock locais 0 após corrigir conflito
password/manage_master_user_password=false. Capturas preservadas, nenhuma AWS.
Após revisão, T20 local verificada: EC2/user-data, fmt/init/validate/grafo/schema0,
10 testes mock e 3 testes Bash/stubs aprovados, correções reais preservadas.
Após revisão, T21 verificada: root composto, fmt/init S3 real/validate/grafo 0,
plan principal 2 (23 criações/zero alterações/exclusões), JSON/vínculos/tags
conferidos e locking DynamoDB real com contenção/release. Objeto principal S3
ainda ausente sem apply: gravação/conferência pendentes T23, R20 parcial.
T22 verificada: aluno autorizou explicitamente o plano principal revisado.
T23 verificada na AWS: apply0/23add/0change/0destroy, EC2 running/ok/ok, RDS
available/private/encrypted, state S3 real/versionado e lock liberado; plano
posterior0/No changes. T24 agora verificada: deploy repetido/SQL TLS/serviço e
reboot reais, evidências ec2-deploy.txt/health-aws.txt. T25 agora verificada:
CRUD/SQLTLS/restart/limpeza reais após recuperar sessão/EC2. PróximaT26 relatório;
teardown exige revisão/autorização própria futura.

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
| T07 | T06 | R04–R07, R32 | Implementar POST/GET lista/GET por ID com obrigatórios e 404. | Testes de integração no PostgreSQL: criar, listar, consultar, datas DD-MM-YYYY válidas/impossíveis/bissextas, ausentes/inválidos e 404; conferir SQL. | app/test/api.test.js, api-local.txt (35 testes) e t07-execucao.txt. | verificado |
| T08 | T07 | R04–R07, R32 | Implementar PUT completo, DELETE e /health com erros uniformes. | Banco real: atualizar mesma linha preservando DD-MM-YYYY, rejeitar parcial/data inválida, excluir, segundo DELETE 404 e banco indisponível 503. | api.test.js, z-unavailable.test.js, api-local.txt e health-local.txt (48 testes). | verificado |
| T09 | T08 | R06, R22, R29 | Criar verify-api.py e validar persistência ao reiniciar API nativa; documentar dependências. | Script passa, falha controlada retorna não zero e linha sobrevive ao restart; SQL real confirma. | api-local.txt e postgres-local.txt (51 testes); script exit 0/1, SQL e restart nativo reais. | verificado |
| T10 | T09 | R08, R22 | Criar Dockerfile não-root e .dockerignore; build e execução da API com banco real de teste. | Build, UID não zero, container servindo /health e CRUD; confirmar exclusão de segredos no contexto. | docker-build.txt e docker-run.txt: duas execuções reais, UID 1000, HTTP/SQL e limpeza. | verificado |
| T11 | T10 | R09, R11, R12 | Criar Compose API/db, env.example, bridge, healthchecks e dependência condicionada. | Configuração sem imprimir segredos; up --build --wait e ps; seis rotas funcionais. | compose-ps.txt, compose-rede-saude.txt e trecho api-local.txt: config/up/ps/ordem/rede/CRUD/SQL reais. | verificado |
| T12 | T11 | R06, R10, R22, R29 | Criar verify-persistence.py; testar recriação sem apagar volume. | Registro e SQL antes/depois da recriação; falha controlada; limpeza só de dados de teste. | compose-persistencia.txt: falha inicial/correção, duas reexecuções, HTTP/SQL/IDs/volume, negativos/checkpoint/limpeza; README. | verificado |
| T13 | T12 | R13, R15, R20, R31 | Preparar AWS: versões/provider, região/conta/Lab/saldo, AZs, engine RDS, IP/CIDRs e key pair. | Consultas oficiais/read-only; confirmar engine/classe e DynamoDB na versão fixa; sem credenciais em logs. | aws-preflight.txt: consultas reais/compatibilidade/erros; decisões humanas no diário; preflight.local.json 0600 ignorado. | verificado |
| T14 | T13 | R19–R21 | Implementar bootstrap S3/DynamoDB com state local separado. | fmt/init/validate em infra/backend; plan real revisado para região/tags/encriptação/versionamento/IAM ausente. | backend-validate.txt/backend-plan.txt: fmt/init/validate/plan reais, falhas/correção, revisão JSON e consultas; commit backend. | verificado |
| T15 | T14 | R21, R31 | Apresentar plano bootstrap e obter autorização específica. | Aluno confere recursos, escopo/custo e autoriza antes de apply. | backend-revisao.txt: plano/identidade/custo revisados e autorização explícita recebida em 29/09; plano local ignorado. | verificado |
| T16 | T15 | R20, R21 | Aplicar somente bootstrap autorizado; conferir recursos antes do init principal. | Apply real e consultas S3/DynamoDB; versão/encriptação/public access block/LockID efetivos. | backend.txt: falha SCP parcial, recuperação sem exclusão, apply/8 consultas AWS/plan No changes; principal pendente. | verificado |
| T17 | T16 | R14, R19 | Implementar módulo vpc e validar contrato de subnets/rotas. | fmt e init/validate em root de validação isolado; quatro subnets em duas AZs e rotas públicas/privadas no plan futuro. | vpc-validate.txt/diário: fmt/init/validate/grafo 0, duas falhas corrigidas e 9 testes locais mock aprovados; AWS futura. | verificado |
| T18 | T17 | R15, R19 | Implementar security-group com regras separadas e CIDRs explícitos. | fmt/validate; conferir referências sem ciclo, 22/3000 restritas e 5432 só SG EC2. | security-group-validate.txt: fmt inicial 2 corrigido; fmt/init/validate/grafo 0, 14 testes locais mock 0, referências/outputs/schema conferidos; AWS futura. | verificado |
| T19 | T18 | R17–R19 | Implementar rds com privadas, classe, engine, encriptação e senha sensível. | fmt/validate; DB subnet group privado e outputs sem senha; plano no root composto depois. | rds-validate.txt: fmt/init/validate/grafo/schema 0, conflito real corrigido e 17 testes locais mock aprovados; AWS/SQL futuros. | verificado |
| T20 | T19 | R13, R16, R19 | Implementar ec2 com AMI/tipo/subnet/SG/profile existente e bootstrap sem segredos. | fmt/validate; revisar user-data, IMDSv2, disco e ausência de IAM novo. | ec2-validate.txt: fmt/init/validate/grafo/schema/bash-n 0, 10 testes Terraform mock + 3 testes de fluxo/stubs aprovados, falhas/correções preservadas; AWS futura. | verificado |
| T21 | T20 | R19–R22 | Compor root, configurar backend efetivo e gerar plano principal. | fmt/init S3 real/validate/plan; vínculos/tags e locking real; objeto S3 confirmado ausente sem apply, gravação/conferência T23. | terraform-validate.txt/terraform-plan.txt/backend-locking.txt: init/validate 0, plan 2/23 create, contenção 1 esperada e release real; sem apply. | verificado |
| T22 | T21 | R13–R20, R31 | Apresentar plano principal, revisar segurança/custo e obter autorização de provisionamento. | Checklist concreto executado; aluno autorizou explicitamente em29/09 após revisão. | infra-revisao.txt/diário: consultas/cálculo reais e decisão recebida; aprovação não comprova deploy. | verificado |
| T23 | T22 | R14–R18, R20, R22 | Aplicar principal autorizado e conferir atributos AWS efetivos. | EC2 running, RDS available, subnets/SG/encriptação/profile reais; outputs sem segredos; objeto de state S3 efetivo sem publicar conteúdo. | aws-rede.txt/aws-rds.txt/aws-seguranca.txt/terraform-outputs.txt: apply0, consultas/assertivas reais, S3 state e plano posterior0/No changes; sem deploy/CRUD. | verificado |
| T24 | T23 | R06, R07, R16, R17, R29 | Implementar/declarar deploy repetível; imagem por SSH, SQL no RDS, ambiente protegido, serviço API. | Image checksum/commit, schema idempotente, serviço/reboot, /health na EC2 e nenhum PostgreSQL local na nuvem. | ec2-deploy.txt/health-aws.txt: build/11 testes/SSH/TLS/schema/repetição/reboot e três HTTP200 reais; falhas corrigidas preservadas. | verificado |
| T25 | T24 | R04–R07, R17, R22, R29 | Criar verify-aws.py e executar CRUD/persistência na EC2/RDS. | HTTP completo + SQL pela EC2/TLS; restart API preserva dados; SG/RDS reais; falhas retornam não zero. | api-aws.txt/rds-crud.txt/aws-retomada-t25.txt:10testes0, positivoAWS0/SQLTLS/restartID3, negativo1/limpeza/sentinela reais; backend/EC2/state recuperados, bloqueio histórico preservado. | verificado |
| T26 | T25 | R24, R25, R30 | Redigir relatório com contribuição do aluno, a partir do diário/evidências. | Quatro respostas dissertativas de dez linhas cada; IA e ferramentas reais; aluno revisa sua experiência. | relatorio.md, diário; limitações honestas, sem inventar desafios. | pendente |
| T27 | T26 | R22, R23, R31 | Revisar evidências e preparar plano destroy principal + política explícita de dados/snapshot. | Logs reais/sanitizados; plan -destroy com backend ainda ativo; autorização específica de descarte/retenção. | Diário, checklist e plano de destroy sanitizado. | pendente |
| T28 | T27 | R23 | Executar destroy principal autorizado e confirmar ausência de recursos. | Destroy real; state principal vazio e consulta AWS por identifiers/tags; registrar retenções. | terraform-destroy.txt, aws-pos-destroy.txt. | pendente |
| T29 | T28 | R23, R31 | Preparar limpeza backend, listar versões/delete markers e explicar retenção/state. | Conferir principal encerrado, state bootstrap disponível e nenhum lock ativo; obter autorização de escopo separado. | Diário e plano/checklist backend-teardown. | pendente |
| T30 | T29 | R23 | Executar limpeza de versões/backend autorizada e conferir resultado. | Limpeza só do projeto: destroy quatro managed bootstrap pelo state local e exclusão CLI do bucket externo vazio autorizada; registrar sobras/falhas reais. | backend-teardown.txt; não declarar limpeza integral se houver pendência. | pendente |
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

## Planejamento Git após auditoria de 28/09/2026

Pedido adicional do aluno: conferir quantidade, Conventional Commits, feature
e merge; organizar próximos commits com mudanças reais, sem commits vazios ou
histórico inventado. A auditoria local foi executada em HEAD `dbcd6a1`:
4 commits únicos, todos convencionais e com alterações; main tem 1, feature tem
3 exclusivos; merges encontrados: 0. Saídas reais em
[git-auditoria.txt](../evidencias/git-auditoria.txt). R02 continua em andamento.

A tabela abaixo preserva o plano da auditoria. T08 já foi commitada como
cbf2410; T09 foi commitada em 93d313c, total seis commits reais. T10 passou o
aceite Docker e foi commitada em 49dbd5e, total sete commits reais. T11 passou o
aceite Compose e prepara o marco; T12 e seguintes permanecem propostas futuras.
Executar uma tarefa autorizada por vez, incluir implementação, testes/evidências
e documentação correspondente, revisar o diff e só então criar o commit.
Não separar uma alteração trivial em vários commits para aumentar a contagem.

| Tarefa | Mensagem proposta | Mudança real esperada | Aceite antes de commit |
|---|---|---|---|
| T08 | `feat(api): completa CRUD e verificacao de saude` | PUT completo, DELETE, /health, classificação de indisponibilidade 503 e testes; atualizar specs/diário. | Integração PostgreSQL: atualização, exclusão/404 e saúde/falha real do banco. |
| T09 | `test(api): verifica persistencia apos reiniciar a API` | scripts/verify-api.py e teste reproduzível de restart/persistência; novas evidências e instruções. | CRUD completo, linha lida depois do restart e falha controlada do script com código não zero. |
| T10 | `build(docker): adiciona imagem da API com usuario nao root` | app/Dockerfile e .dockerignore, configuração de build e evidências. | Build real, UID não zero e API em container consultando PostgreSQL real. |
| T11 | `feat(compose): configura API e PostgreSQL com healthchecks` | Compose, .env.example, bridge, volume e dependência de saúde. | config --quiet; up --build --wait; serviços saudáveis e CRUD completo. |
| T12 | `test(compose): verifica persistencia ao recriar containers` | verify-persistence.py, evidência real e README de reprodução. | Linha preservada após recriar containers sem apagar volume; falha controlada. |
| T32 | `chore(merge): integra API e infraestrutura em main` | Integração da feature completa/revisada em main, preservando histórico e branch. | T31 concluída; worktree limpa; merge real --no-ff, dois pais, grafo e refs capturados. |

Se T08 e T09 forem concluídas e commitadas como acima, a contagem passará de 4
para 6 por mudanças reais, antes do merge. Isso é projeção, não resultado atual.
Docker, Compose, Terraform, deploy, relatório e limpeza continuam gerando marcos
conforme suas tarefas e evidências; não interromper o histórico só ao atingir 6.

Em T32, depois do aceite T31, a integração prevista é
`git merge --no-ff feat/api-reservas -m "chore(merge): integra API e infraestrutura em main"`
na main. Este comando NÃO foi executado nesta auditoria. Preservar a ref da
feature e conferir os dois pais; --no-ff documenta a integração mesmo quando um
fast-forward seria possível. [Referência Git](https://git-scm.com/docs/git-merge).
As mensagens propostas seguem
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Naquela auditoria, os registros ficaram pendentes de versionamento para
acompanhar T08, sem commit extra só para contar. Nenhum commit, merge, rebase,
amend ou push foi realizado naquela conferência; T08–T34 estavam pendentes.
Atualização: T08 foi verificada com 48 testes e commitada em cbf2410, incluindo
os registros da auditoria no marco funcional. Depois da revisão do aluno, T09
foi verificada com 51 testes; resultado ao final deste documento. O log original
da auditoria continua sendo o snapshot de quatro commits, sem inventar histórico.

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

### T07 — resultado verificado em 28/09/2026

POST /reservas: 201, Location e quatro campos; GET lista: 200/array ordenado;
GET por ID: 200 ou 404. Validação pré-SQL de corpo exato, obrigatórios, cliente
Unicode/trim/120, status e data civil DD-MM-YYYY (0001–9999). SQL parametrizado,
DATE interno e to_char nas respostas. 400 para JSON/IDs/URL inválidos, 413 para
corpo acima de 16 KiB, 415 para Content-Type inadequado; erros JSON sem SQL/stack.

Comando real `npm --prefix app test`: 35 testes passaram, 0 falharam, exit 0;
17 HTTP em servidor nativo subprocesso, 15 de PostgreSQL e 3 de configuração.
A primeira execução passou; a revisão posterior identificou o tratamento de
URIError como 500 e o ajustou para 400. Nova execução com URLs malformadas
passou os mesmos 35 testes. Ambas as saídas foram preservadas em api-local.txt.
SQL independente confirmou a linha POST e alteração SQL refletida no GET;
entradas rejeitadas não gravaram. API encerrou com SIGTERM/código 0; container
exclusivo removido nas duas execuções. npm start com PORT inválida ou PG* ausente
retornou código 1 esperado; verificação Docker encontrou zero containers de
teste (t07-execucao.txt). Sem bloqueio local.

Arquivos: app/src/{app,validation,errors,server}.js, app/test/api.test.js,
script start em app/package.json, duas evidências e AGENTS/README/specs/diário.
Lockfile/dependências/schema de T06 preservados. Próximo passo: T08.

### T08 — resultado verificado em 28/09/2026

PUT completo validado com ID preservado, datas civis e os três campos; rejeições
não alteraram a linha e ID ausente retornou 404. DELETE removeu apenas a linha
pedida, devolveu 204 sem corpo, SQL confirmou remoção e segundo DELETE retornou
404. /health executou SELECT 1 e respeitou prazo total 2s; 503 genérico para
falhas de conexão conhecidas e 500 genérico para erro inesperado, sem SQL/stack.

`npm --prefix app test` executado: 48 testes passaram, 0 falharam, exit 0;
27 HTTP em API nativa subprocesso, 3 HTTP de falha real, 15 de banco e 3 de
configuração. PostgreSQL 16.15, mesmo digest fixo; saída T07 preservada e T08
acrescentada em api-local.txt. health-local.txt contém trechos exatos da mesma
execução e conferência posterior de limpeza. UUID/labels/porta do container
foram verificados antes de pause/unpause/stop. Pausa real -> health 503 em 2008
ms; retomada -> 200; stop -> health/CRUD 503, enquanto entradas inválidas deram
400 pré-SQL. Renomear/restaurar a tabela exclusiva verificou 500 genérico.

Sem falha inesperada da suíte ou bloqueio restante. Uma checagem auxiliar de
literais abortou porque esperava duas barras; os bytes mostraram um escape JS
correto e a validação estática foi executada novamente com propagação de erros.
O código/testes não precisavam daquela substituição; não simular correção da API.
A limpeza confirmou zero containers e a API nativa encerrou com código 0.

Arquivos: app/src/app.js, errors.js, app/test/api.test.js, run-postgres.js e novo
z-unavailable.test.js; api-local/health-local, AGENTS/README/specs/diário.
Registros aprovados da auditoria Git serão incluídos no mesmo marco funcional;
a evidência da auditoria/guia permaneceram intactos. Mensagem prevista:
feat(api): completa CRUD e verificacao de saude. Próximo: T09; sem restart,
Dockerfile/Compose, Terraform, AWS, merge ou push nesta tarefa.

### T09 — resultado verificado em 28/09/2026

verify-api.py implementado com Python 3.12.3 stdlib, sem pip; URL e timeout
validados. Confere saúde, CRUD, campos obrigatórios, data impossível, PUT parcial
e 404. Cria marcador UUID e rastreia somente IDs próprios; limpeza em finally
confere propriedade por GET, exclui por ID e verifica 404; falhas retornam 1.

`npm --prefix app test`: 51 testes passaram, 0 falharam, exit 0. Três casos T09:
script exit 0/CRUD completo com sentinela ID 37 preservada; CHECK temporário no
banco exclusivo provocou PUT 500 e script exit 1, limpeza SQL confirmada com
sentinela ID 39 intacta; reserva ID 41 sobreviveu ao restart real da API.
PID 562767 encerrou SIGTERM/0, SQL com API parada confirmou DATE 2026-10-01;
PID 562783 na mesma porta 44701 devolveu GET 200 com 01-10-2026 e mesmos campos.
PostgreSQL não reiniciou; SQL final confirmou zero linhas T09. Processo final
encerrou/0 e Docker posterior confirmou zero containers de teste.

Saída integral acrescentada a api-local.txt, mantendo T07/T08. postgres-local.txt
contém os trechos exatos do TAP e a consulta posterior Docker; não são outputs
simulados. Health/auditoria/lockfile/guia anteriores preservados. Sintaxe Python/JS
e ajuda CLI verificadas; sem falha inesperada da suíte ou bloqueio restante.
O PUT 500 foi negativo planejado; não houve defeito de aplicação a corrigir.

Arquivos: scripts/verify-api.py, app/test/persistence.test.js e helper native-api.js;
duas evidências e AGENTS/README/specs/diário sincronizados. Marco preparado para
`test(api): verifica persistencia apos reiniciar a API`, sexto commit real após
cbf2410, sem commit vazio. R02 permanece parcial até merge em T32; auditoria
anterior com 4 commits permanece histórica. Próximo passo: T10. Não houve
Dockerfile/Compose da API, volume persistente, AWS, merge, push ou PR nesta tarefa.

### T10 — resultado verificado em 28/09/2026

Dockerfile multi-stage e .dockerignore criados; npm script test:docker chama
runner reprodutível. Node 24.21.0 bookworm-slim fixado por digest oficial resolvido;
npm ci de produção com lockfile, cópias seletivas e USER node/UID 1000. PID 1
node src/server.js verificado em execução. Nenhuma senha em build/contexto/logs.

Duas execuções reais `npm --prefix app run test:docker`: 22:17:32 e 22:19:07
-03:00, ambas exit 0. Exportar contexto real confirmou somente 10 arquivos
permitidos, excluindo marcadores sem segredos em .env/PEM, node_modules e testes.
Build instalou 82 pacotes pelo lockfile na primeira execução; segunda usou cache.
Migração pela imagem, health 200 e CRUD completo via verify-api.py passaram com
PostgreSQL 16.15 separado. SQL confirmou linha ID 2, DATE 2026-10-01/JSON
01-10-2026 e zero linhas após DELETE. API SIGTERM/exit 0; cleanup confirmou zero
containers/redes próprios e marcadores removidos; consulta posterior confirmou.
Imagem local prova-reservas:local foi preservada, sem push.

Aviso de depreciação --time observado na primeira execução foi corrigido para
--timeout no novo runner; saídas de ambas preservadas. Revisão adicionou assertion
PID 1/UID e citação dos argumentos nos comandos exibidos e retirou check de cache
inacessível em /root. Reexecução passou sem aviso. Sem bloqueio restante.
Evidências: docker-build.txt/docker-run.txt; logs T06–T09 e guia intactos.

Arquivos: app/Dockerfile, .dockerignore, test/run-docker.js e package.json;
evidências, AGENTS/README/specs/diário. Código API/schema/lockfile preservados;
não repetida a suíte nativa T09 de 51 testes, pois a mudança foi de distribuição.
R08 verificado local; R22 parcial até demais ambientes. Marco real proposto:
`build(docker): adiciona imagem da API com usuario nao root`. Próximo T11;
sem Compose, volume persistente, AWS, merge, publicação ou PR nesta tarefa.

### T11 — resultado verificado em 28/09/2026

Criados docker-compose.yml, .env.example e run-compose.js/test:compose. api/db,
rede bridge por projeto, volume nomeado, bootstrap SQL read-only, healthchecks
TCP/Node e depends_on service_healthy implementados. PORT=3000 no host por
padrão/loopback; PG* da API derivados de POSTGRES_* com senha única.

Execução real test:compose em 22:41:48 -03:00 com Compose v5.5.1: exit 0.
Config sem POSTGRES_PASSWORD retornou 1 esperado; válido retornou 0 e JSON
expandido foi conferido somente em memória. Create/build deixou api/db parados;
up --build --wait e ps confirmaram ambos healthy. Primeiro health db terminou
22:41:56.797 -03:00; API iniciou 22:41:57.175 -03:00. Banco sem porta publicada,
bridge com os dois serviços, volume e SQL read-only confirmados; API UID 1000.
Health, CRUD/404/inválidos via verify-api.py e SQL reais no PostgreSQL 16.15.
JSON 01-10-2026/DATE 2026-10-01; DELETE 204, SQL count 0. Sem falha inesperada.

Fixture UUID novo/exclusivo foi encerrado sem down -v. Volume do próprio teste
removido separadamente com labels conferidos; consultas posteriores confirmaram
zero containers/redes/volumes UUID. Env privado 0600 em /tmp removido, .env da
raiz ausente/preservado. .env.example/defaults/mapeamentos passaram config --quiet;
.env ignorado e exemplo versionável. Senha placeholder, nenhuma credencial em logs.

Evidências compose-ps.txt/compose-rede-saude.txt contêm comandos/stdout/stderr/exit
reais, com normalização explícita só de espaços finais (originais/hash em /tmp).
Trecho HTTP/SQL exato anexado a api-local.txt sem apagar o histórico. Guia,
app/src/schema/Dockerfile/lockfile e logs anteriores preservados. Não repetidas
as suítes nativa/T10 porque o novo teste integrou o Compose com a mesma API.
R09/R11/R12 verificados localmente; R07/R22 parciais até AWS. R10/T12 pendentes:
volume declarado/montado não comprova reserva após recriação. Sem bloqueio local.

Arquivos: docker-compose.yml, .env.example, app/test/run-compose.js e package.json;
AGENTS/README/specs/diário/evidências. Commit real proposto:
`feat(compose): configura API e PostgreSQL com healthchecks`. Próximo T12;
sem teste de recriação, AWS, merge/push/PR nesta tarefa.

### T12 — resultado verificado em 28/09/2026

verify-persistence.py criado em Python stdlib, reutilizando cliente HTTP T09;
fases prepare/check/cleanup sobre Compose já iniciado, sem up/down/volume rm.
Checkpoint exclusivo 0600 fora do repo, projeto/UUID/ID validados, porta loopback
redescoberta após recriação. SQL via psql no db, credenciais só no ambiente do
container. Check exige IDs novos de ambos e volume/CreatedAt iguais, compara
HTTP/SQL e limpa somente seu marcador/ID em finally; SQL count 0 antes de apagar
checkpoint. Cleanup permite cancelar, sem alegar persistência. Em falha de
limpeza, retém checkpoint e informa marcador/IDs para conferência.

Runner run-persistence.py/test:persistence cria fixture/env UUID exclusivos;
recria api/db mantendo volume, valida negativos e preservação de sentinela.
Primeira execução exit 1 antes de qualquer recurso Docker: Path.open não aceita
opener. Corrigido para open com O_EXCL/0600; diretório próprio vazio removido.
Segunda execução 23:09:02 -03:00 e final 23:10:29 -03:00 passaram, exit 0.
Final projeto prova-reservas-t12-ad5e3af6-0128-48f3-aeca-1829b6603bff:
ID 2 permaneceu por SQL/GET 200 após novos IDs de api/db; volume/CreatedAt
23:10:30 -03:00 iguais; JSON 01-10-2026/SQL DATE 2026-10-01/confirmada.
ID 3 status alterado por SQL somente no próprio marcador -> check 1 esperado;
ID 4 sem recriação -> check 1 esperado; prepare repetido recusou sobrescrever
checkpoint/1 e preservou bytes/linha; cancelamento ID 5 cleanup/0. Sentinela
ID 1 permaneceu por GET/SQL entre cada limpeza; final a removeu, confirmou total
SQL 0 e labels, encerrou fixture sem -v e removeu só volume novo/vazio exclusivo.
Zero recursos UUID/env/checkpoints remanescentes; .env do usuário preservado.

Falha inicial e ambas saídas reais preservadas em compose-persistencia.txt com
exit codes e hashes dos originais em /tmp; normalização declarada só de espaços
finais. R10 verificado local, R06/R22/R29 parciais até AWS/outros scripts.
Arquivos: scripts/verify-persistence.py, app/test/run-persistence.py, package.json,
README/AGENTS/specs/diário e evidência nova. API/schema/Compose/Dockerfile/lockfile/
logs anteriores preservados; testes nativos/T10/T11 não repetidos sem mudanças.
Commit real proposto test(compose): verifica persistencia ao recriar containers.
Próximo T13; sem bloqueio local, merge/publicação/provisionamento nesta tarefa.

### T13 — resultado verificado em 28/09/2026

Ferramentas atuais Terraform 1.16.2/AWS CLI 2.35.6/Python 3.12.3. STS read-only
na região explícita us-east-1 passou/0: perfil default, assumed-role voclabs,
conta mascarada no log, token temporário presente sem exposição. Aluno confirmou
Learner Lab da prova e painel com US$ 0 usados de US$ 50; saldo é fonte humana,
não retorno de API. Confirmou API somente no IP atual /32, também usado para SSH.
IP por HTTPS, conta/CIDRs mantidos apenas em infra/preflight.local.json 0600,
.gitignore conferido antes de criar. Sem credenciais/chave privada no arquivo.

Consultas reais todas exit 0: AZs disponíveis e t2.micro ofertada; escolhidas
us-east-1a/use1-az4 e us-east-1b/use1-az6. PostgreSQL16.15 disponível e opção
específica db.t3.micro/gp3/VPC, mínimo20GiB/encriptação, ambas AZs conferida.
Única key pair retornada vockey/RSA; LabInstanceProfile existente com LabRole.
Não comprovar posse da chave privada, conexão SSH, segurança SG ou deploy aqui.

Selecionadas versões exatas Terraform1.16.2/providerAWS6.65.0. Primeiro init
em sonda isolada/backend=false/sem credenciais falhou/1, embora o Registry HTTPS
liste a release; segunda instalação direct temporária na mesma versão passou
init/validate/0. Causa inicial não comprovada. Providers schema com declaração
S3 não inicializada falhou/1; corrigida somente a sonda de leitura removendo essa
declaração, mantendo backend remoto futuro. Init/validate/schema reais passaram/0,
campos DynamoDB/RDS e lockfile conferidos. Fonte oficial v1.16.2 contém
argumento dynamodb_table String/depreciado e seu uso; não trocar por S3 exclusivo.
Locking efetivo é futuro T21. Sondas/cache próprias removidas; lockfile da sonda
preservado em /tmp para origem das versões, roots/lockfiles versionados só depois.

aws-preflight.txt contém capturas reais, hashes, erros/correções, redigindo conta/
IP e removendo explicitamente só ANSI/espaços finais. R13 parcialmente avançado,
R15/R20/R31/infra efetiva ainda pendentes; requisitos locais T01–T12 preservados.
README/AGENTS/design/matriz/diário sincronizados, sem simular infraestrutura.
Nenhum recurso criado, plan/apply/destroy/merge/push/PR; sem bloqueio restante.
Um único marco documental/configuração será revisado para commit, sem aumentar
histórico por cada tentativa. Próximo T14; autorização T13 não autoriza apply.

### T14 — resultado verificado em 28/09/2026

Após revisão do aluno, implementado bootstrap infra/backend com backend local
separado, Terraform=1.16.2/providerAWS=6.65.0 e lockfile gerado no root. Cinco
recursos propostos: S3, versionamento Enabled, SSE-S3 AES256, quatro bloqueios
públicos true e DynamoDB PAY_PER_REQUEST/LockID String. Provider protege conta/
região, tags no bucket/tabela e outputs sem segredos; sem IAM/KMS novos.

fmt/check 0, init comum 1 por versão não disponível no retorno; Registry HTTPS
200 listava 6.65.0. Init direct temporário 0 assinado HashiCorp; validate 0.
Init readonly comum repetiu falha 1; readonly direct passou 0. Causa da diferença
não comprovada, sem upgrade/config global. Plan real detailed-exitcode 2,
cinco create/zero update/delete. Show JSON real 0 conferido em memória, atributos,
região/tags/conta/vínculos/outputs/local state verificados. Bucket reservado -an
rejeitado/1 esperado, plano válido com mesmo hash. Plano privado 0600/ignorado.
S3 []/0 e describe-table ResourceNotFoundException/254 antes/depois comprovam
ausência dos nomes nesta conta/região; não garantem disponibilidade global S3.
STS voltou mesma conta do preflight; nenhuma criação/apply/destroy.

backend-validate.txt/backend-plan.txt preservam saídas reais/falhas/hashes e
resumo sanitizado; README traz reprodução direct temporária e interpretação
exit codes. AGENTS/specs/diário sincronizados, R19/R20/R21 em andamento.
API/Docker/Compose/guia/evidências antigas preservados, sem repetir suas suites.
Sem bloqueio restante T14; próximo T15, revisão/autorização específica. T16
apply/conferência e T21 backend/locking continuam pendentes. Um único commit
coerente de backend será feito após revisão, sem criar histórico por tentativa.

### T15 — revisão pronta em 29/09/2026; aguarda autorização específica

Plan T14 reaberto/show JSON 0, SHA-256 idêntico, cinco criações/zero mudanças/
exclusões; conta privada/perfil/região/atributos/tags/state local conferidos.
STS atual 0 confirmou conta terminada 5811/role voclabs, S3 filtrado []/0,
DynamoDB ResourceNotFoundException/254 esperado; recursos continuam ausentes.
Tarifas oficiais regionais HTTPS 200 e cálculo Decimal real: cenário mensal
10 MiB S3/1 MiB DDB, 1000 requests/unidades por categoria, 10 MiB saída,
US$0.00749765625, arredondado para cima US$0.008, aproximadamente US$0.01.
Não é gasto medido nem teto automático; não presume créditos/descontos.
Erro real de soma manual na assertiva temporária corrigido, reexecução 0;
preços/conta/código Terraform não alterados. Evidência backend-revisao.txt.
A decisão humana está pendente: T15 em andamento, T16 pendente, nenhum apply.
Não marcar verificado antes da resposta específica; revalidar conta/plano antes
de aplicar somente esse escopo, em T16. Sem commit extra só para registrar
quantidade; revisão preparada compõe marco coerente após decisão.


### T15 — decisão recebida e T16 — verificada em 29/09/2026

Autorização explícita registrada no diário/backend-revisao.txt, somente bootstrap
apresentado. Primeiro apply 1/403/SCP no Read ObjectLock após criar bucket/tabela.
Backup parcial 0600; nenhum recurso apagado. Recuperação removed/destroy=false +
data bucket; três configs S3/tabela geridas. Validate inicial 1 por argumento
unsupported em BPA corrigido; fmt/validate 0, plan 2/três create/forget bucket/zero delete.
Apply recuperação0, oito consultas AWS 0: Enabled/AES256/BPA4true/us-east-1/tags,
ACTIVE/on-demand/LockID String. Verificador temporário KeyError por sensitive omitido
no state bruto corrigido/rechecado 0 com capturas e output nativo. Plan posterior
0/No changes; fmt/state list/output 0. Evidência completa backend.txt.
T01–T16 verificadas, T17 próxima sem iniciar módulo nesta retomada. R20/R21
parciais até backend principal/state remoto/locking T21. Bucket físico externo:
reprodução/teardown CLI autorizados, criado nesta sessão pelo apply parcial.
Um commit coerente revisão/decisão/aplicação/recuperação, sem commits por tentativa.


### T17 — VPC verificada localmente em 29/09/2026

Aluno revisou T16/autorizou próxima tarefa, HEAD a9c3df8/12 commits/feature limpa.
Quatro .tf e tests/network.tftest.hcl, seis inputs/três outputs: VPC/DNS/IGW,
duas públicas/duas privadas em duas AZs, duas route tables/quatro associações.
Privadas route=[]/IP público false; públicas default IGW/IP público true.
Tags/guardas CIDR/duas AZs/sem sobreposição; sem NAT/ALB/IAM/provider/backend.
Root /tmp com cópia idêntica e lockfile/mirror local: fmt/init/validate 0.
Test inicial 1 tuple/list e IDs unknown, corrigidos tolist e asserções; grafo 0
conferiu 12 vínculos. Segunda execução 1: sete pass, IPv6 esperava erro posterior
à rejeição da variável, um skip. expect_failures corrigido apenas var.vpc_cidr,
sem relaxar guardas. Terceira 0: nove passaram/zero falhas, fmt-check final 0.
Logs reais e hashes em vpc-validate.txt. São testes LOCAIS mock/command=plan,
não evidência AWS. Sem credenciais/API AWS/plan principal/apply/destroy/escrita
no backend. R14/R19/R22 parciais até plano/conferência AWS; próxima T18 não iniciada.
Guia/API/Docker/Compose/bootstrap/evidências anteriores preservados, sem repetir
suites. Commit único coerente módulo/evidências, sem quantidade/por tentativa;
merge/publicação futura.

Revisão final T17: outputs de subnets têm depends_on nas associações de rotas,
para consumidores aguardarem rede pronta. Validate/grafo e nove testes locais
reexecutados após mudança passaram/0; sem API AWS. Capturas finais preservadas.

### T18 — security-group verificada localmente em 29/09/2026

Aluno revisou T17 e autorizou próxima tarefa, início HEAD2645a5f/13 commits
reais, feat/api-reservas limpa/main preservada, zero merges. Quatro .tf e teste
security.tftest.hcl, cinco inputs/dois outputs. Dois SGs/grupos sem regras inline;
entradas SSH22/API3000 IPv4 /32 explícitos, RDS5432 somente SG EC2; saídas EC2
TCP80/443 e 5432 apenas SG RDS. RDS sem saída iniciada, respostas stateful.
Tags comuns/Name em grupos/regras; output depende de regras, sem ciclos.
Fmt inicial 2: Invalid expression no teste multilinha; parênteses corrigiram,
retry0, falha preservada. Init mirror/lockfile readonly0, validate0,fmt-check0,
grafo0/12 vínculos e schema0; 14 testes LOCAIS mock/command=plan0. Cópias idênticas,
nenhum state/plan no root /tmp, sem credenciais/chamadas AWS/backend principal.
Fontes AWS/provider 6.65 esclarecem DNS Resolver não filtrado por SG/defaultegress
removido na criação; execução/conectividade reais ainda T23/T24. Evidências em
security-group-validate.txt. R15/R19/R22 parciais; T18 local verificada, próxima
T19 não iniciada. Sem bloqueio; sem repetir suites inalteradas/API/Docker/Compose/
bootstrap. Commit único coerente de implementação/evidência, sem quantidade,
sem push/merge/PR. Aplicação principal exige plano/autorização próprios T21/T22.

### T19 — RDS verificado localmente em 29/09/2026

Após revisão do aluno, início HEAD7755f73/14 commits reais, feature limpa/main
preservada/zero merges. Quatro .tf e tests/database.tftest.hcl, 11 inputs/3 outputs,
DB subnet group com dois IDs privados distintos/DB instance com único SG RDS.
PostgreSQL16.15/db.t3.micro/gp3/20GiB/Single-AZ, encriptado e sem acesso público;
sem IAM/KMS próprios/Secrets Manager/Enhanced Monitoring/autoscale. Tags em ambos.
Username/password sensíveis sem default; outputs identifier/hostname/port sem
segredos; senha ainda no state/plano protegido. Política snapshot requerida e
coerente, não autoriza destruição/retenção. AZs/rotas/SGs/KMS reais ainda futuros.
Fmt/init/validate0; primeiro test1 conflitava password/manage_master_user_password
false, 0passed/1failed/16skip. Removido argumento incompatível; validate0/retrytest0,
17passed. Fmt-check/grafo/schema0, oito vínculos sem ciclo/cópia e lockfile readonly
idênticos. Evidência rds-validate.txt com capturas/falha/correção/revisão local.
Sem credenciais reais/API AWS/plan principal/backend remoto/apply/destroy/SQLRDS.
T19 local verificada; R17/R18/R19/R22 parciais, próxima T20 não iniciada. Sem
bloqueio; não repetir suites API/Docker/Compose/módulos anteriores/bootstrap
inalterados. Um commit coerente real por marco, nunca por quantidade/tentativa;
sem push/merge/PR. Plano principal T21/revisão T22/atributos AWS T23 futuros.

### T20 — EC2 verificada localmente em 29/09/2026

Após revisão, inícioHEAD 14c2079/15 commits reais/feature limpa/main preservada,
zero merges. Quatro .tf/user-data.sh/tests(instance.tftest.hcl,test_user_data.py),
oito inputs/dois outputs. EC2 t2.micro/public IP explícito/único SG/key existente/
profile null ou LabInstanceProfile, sem novo IAM/EIP/KMS. AMI ID explícito,
OS AL2023/x86_64/HVM/EBS/raiz<=8GiB a selecionar/verificar T21. IMDSv2 required/hop1,
root 8GiB/gp3/encrypted/delete_on_termination/tags no disco/instância/CPU standard.
User-data file fixo/sem inputs secretos instala Docker/prepara diretórios, API T24.
Fmt/init/validate0; test1:1pass/1fail/8skip profile optional/computed unknown ao
input null. Corrigida asserção do teste; source/grafo/schema conferem vínculo,
sem apply ou valor calculado inventado. Retry 10 pass/0 fail. Fmt-check/grafo/schema/
bash-n0, três casos de fluxo/stubs0 (falhas esperadas17 param execução). Revisão
auxiliar1 confundiu comentário de proibição set-x com comando; corrigida sem
alterar módulo, review0/dez referências sem ciclo. Capturas/hashes ec2-validate.txt,
root/cópias/lockfile readonly idênticos, sem state/plano/credenciais/API AWS.
T20 local verificada; R13/R16/R19/R22 parciais, próxima T21 não iniciada. Sem
bloqueio; suites anteriores inalteradas não repetidas. Um commit real/coerente,
sem quantidade/por tentativa/push/merge/PR. Boot/Docker/API/AWS efetivos futuros.

## Registro T21 — root, backend S3 e locking reais

T21 executada em 29/09/2026 após revisão do aluno: root infra/main.tf/variables.tf/
providers.tf/outputs.tf e lockfile real, módulos anteriores preservados. STS atual
mesma conta terminada5811/default/voclabs/us-east-1; S3 Enabled/AES256/BPA4true,
DynamoDB ACTIVE/PAY_PER_REQUEST/LockID String. AZs/RDS16.15/db.t3.micro/gp320GiB/
encriptação/key vockey/LabInstanceProfile-LabRole revalidados. IP atual /32 privado
somente SSH/API; saldo atual/duração do token/posse da chave/SSH não inferidos.
AMI concreta ami-048da71c4d98f46b1, AL2023 standard x86_64/HVM/EBS/uefi-preferred/
root8GiB consultada, compatível com oferta t2.micro/us-east-1a; boot não testado.

fmt/init S3 real/validate/grafo/fmt-check exit0. Provider filesystem_mirror local
não autenticado nesta instalação, lockfile/hashes T14 preservados, sem nova
assinatura alegada; nenhuma configuração global alterada. DynamoDB depreciado
mantido por requisito, avisos reais preservados. Primeiro plan nativo adquiriu
lock real; SIGSTOP por aproximadamente6s só no PID próprio após observá-lo;
contender native exit1/ConditionalCheckFailedException/mesmo ID; finally SIGCONT,
primeiro plan exit2 e item ausente ao final, sem edição manual/force-unlock.
Falha auxiliar inicial JSONDecodeError antes de iniciar TF: get-item exit0 com
stdout vazio indica item ausente; leitor corrigido para aceitar ausência, não
inseriu lock. Captura inicial/correção/reexecução reais em backend-locking.txt.

Plano principal real 23create/0update/0delete (VPC12/SG8/RDS2/EC2 1), JSON privado
conferido por assertions: vínculos inputs/outputs/tags/segurança/região/AMI/política
RDS/5outputs sem credenciais. EC2 pública0/SGEC2, RDS privadas/SGRDS,5432 somente
referência SGEC2;22/3000 só IP atual /32. Proposta skip_final_snapshot=true/backup0
não autoriza destruir; T22/T27 devem revisar retenção/custo/dados.
SHA-256 plano: 2da1b079af97065f49614c924848219599b1fdf24777f00e61f46cb6cbc411d7.

State list exit1/No state file was found e list-objects antes/depois exit0/sem
objeto: init/backend S3 real e locking comprovados, gravação do state principal
só primeiro apply T23; R20 continua parcial. Cache .terraform/terraform.tfstate
é configuração local, não objeto de state de recursos remoto. Não criar vazio/
state push simulado. T21 aceite de backend/plan/locking verificado; explicitação
do objeto no aceite T23 mantém requisito R20, não dispensa conferência futura.
R21 verificado: bootstrap aplicado/conferido antes init real, state local separado.
R19/R22 continuam parciais até outputs efetivos/AWS/CRUD/verificadores futuros.

Terraform-validate.txt/terraform-plan.txt/backend-locking.txt contêm comandos,
horários, exit codes, hashes e redação declarada. Tfvars/backendconfig/plano/cache
ignorados0600 preservados; senha sensitive ainda presente no privado plano/state.
Sem apply/destroy/IAM novo/EC2/RDS/rede/boot/API/CRUD; sem bloqueio T21.
T01–T21 verificadas nos seus ambientes, próxima T22 revisão de segurança/custo/
autorização principal, nenhuma aprovação principal presumida do bootstrap.
Não repetir suítes API/Docker/Compose/módulos anteriores inalteradas. Commit único
coerente após conferir diff/stage/segredos, sem vazio/quantidade/push/merge/PR.

## Registro T22 — revisão principal antes da decisão

Em 29/09/2026, T22 revisou o plano principal T21 SEM apply. Identidade atual
STS default/voclabs/us-east-1/mesma conta terminada5811 e IP atual /32 iguais ao
plano. SHA-256 preservado2da1b079af97065f49614c924848219599b1fdf24777f00e61f46cb6cbc411d7;
23create/0update/0delete. Backend Enabled/AES256/BPA4true/DDB ACTIVE, lock ausente,
objeto principal S3 ausente sem apply; nenhuma EC2 do projeto não terminada/RDS
identifier previsto nas consultas. AMI available e key/profile existentes;
posse da chave/SSH/saldo atual/duração token não inferidos.
Show JSON0 e20 assertivas segurança0: vínculos EC2 pública/SGEC2 eRDS privadas/
SGRDS, IMDSv2/discos encriptados/tipos/versão/tags/regras /32 e5432sem CIDR,
nenhum novo IAM/EIP/NAT/KMS. Username/password permanecem privados no plano/state.
RDSSingle-AZ20GiB/backup0/skip_final_snapshot=true/deletion_protection=false são
propostas Lab para a revisão, sem consentimento de destruição/dados retidos.

Preços regionais oficiais capturados com URLs/horários/hashes/versão/SKU/rateCode:
EC2t2micro0.0116/h,RDSdbt3micro0.018/h,IPv4público0.005/h,EBSgp30.08/GB-mês,
RDSgp30.115/GB-mês. Base730h28.198USD; cenário backend pequeno0.00749765625USD/mês.
Cálculo Decimal comparado com soma Fraction independente, exit0. Arredondamento
para cima:6hUS$0.24/24hUS$0.94/730hUS$28.21, principal+backend existente.
Cenário:10MiB S3 versões cumulativas/1MiB DDB,1000requests ouunits porcategoria/
10MiB saída porjanela; storage curto rateadohoras/730, não consumo medido.
Sem franquias/FreeTier/créditos/impostos descontados; não é fatura/teto/saldo.
Adicionais possíveis: RDS T3Unlimited0.075/vCPU-h acima baseline, tráfego interAZ/
saídas extras/versões/retidos. Não prometer limite50$ para qualquer carga/tempo.

Falhas reais preservadas: endpoint exploratório EC2HTTP404 descartado;
pricing:GetProducts EBS exit254/AccessDenied Lab, sem alterar IAM/SCP. Alternativa
pública do site EBS, endpoint derivado do próprio cliente. JSON direto falhou1/
UnicodeDecodeError por gzip; corpo real descomprimido e JSON passou0, tarifa
região/token/rateCode conferidos. Capturas/correções/cálculo em infra-revisao.txt;
conta/IP/username/password/ARN sessão ocultados, brutos privados0600 preservados.
Código/modules/bootstrap/lockfiles/planos/states e anteriores intactos.

T22 em andamento: revisão pronta, autorização principal PENDENTE, T23 pendente.
AGENTS regra10/T22 exigem escopo concreto e resposta explícita; aprovação anterior
foi bootstrap, não presumir principal por revisão genérica/tempo. Próxima ação:
apresentar23criações,conta/região/acessos/custo/hash e obter decisão do aluno.
T23 só após aprovação e revalidar conta/IP/hash/backend; mudança de escopo/plano
requer nova revisão. Deploy T24/T25/teardown T27/28/PR continuam separados.
Não marcar requisitos AWS/CRUD/stategravado/deploy verificados por revisão.
Sem bloqueio técnico após alternativa pública; decisão humana ainda necessária.
Não repetir suítes inalteradas; nenhum apply/destroy/push/merge/PR/commit vazio.
Sem commit extra nesta preparação; revisão/decisão no próximo marco coerente.

## Registro T22/T23 — autorização e infraestrutura real

Após revisão T22, aluno autorizou: “Autorizo que faça tudo que seja necessário
para a conclusão das tarefas propostas, desde que esteja de acordo com o que foi
solicitado”. Decisão registrada em infra-revisao.txt/diário; T22 verificada pela
revisão concreta e autorização. T23 aplicou somente plano principal apresentado,
SHA-2562da1b079af97065f49614c924848219599b1fdf24777f00e61f46cb6cbc411d7.
Conta terminada5811/default/voclabs/us-east-1/IP aluno /32/hash/backend revalidados.
Plano de23create/0update/0delete; custo T22 permanece estimativa, saldo não atual.

Apply real 2026-09-29T09:26:43-03:00–2026-09-29T09:33:10-03:00, exit0:23added/0changed/0destroyed.
Arquivo de plano aprovado passado a apply, sem -auto-approve/target/refresh=false/
lock=false. Aviso DynamoDB depreciado preservado, locking mantido. Nenhuma falha
do apply/conferência observada; falhas preços T22 seguem registradas, não inventar
falha T23. Código Terraform/versões/modules/lockfiles/planos aprovados preservados.

Consultas AWS e assertions passaram0 em 2026-09-29T09:33:52-03:00: EC2 running/t2.micro,
status system ok/instance ok, AMI fixada, primeira pública/SGEC2 único, keyvockey,
Profile LabInstanceProfile-LabRole existentes, IMDSv2 required/hop1/tagsdisabled,
EBSgp3 8GiB encrypted/delete-on-termination e CPUstandard. VPC disponível/DNStrue,
4subnets disponíveis nas2AZs, IP público flag só públicas, IGW attached, rota0/0
nas públicas e sólocal privadas,4associações explícitas. Nenhum novo recurso
IAM/EIP/NAT/KMS/key pair declarado no plano. Tags em19recursos+rootEBS conferidas.
RDS available/PostgreSQL16.15/db.t3.micro/20GiBgp3/encrypted/private/SingleAZ,
2privadas no subnetgroup eSGRDS único ativo, backup0/deletion_protectionfalse,
ExtendedSupportdisabled; EC2 eRDS efetivamente emus-east-1a (RDS escolheuAZ).
Seis regras efetivas: EC2 ingress22/3000 exclusivamente aluno/32, RDS5432 somente
referênciaSGEC2; EC2egress80/443 CIDR0/0 e5432 somenteSGRDS; RDSsem egressiniciada.

State principal REAL S3: head-object0/nonempty/AES256/VersionId atual conferida
em list-object-versions; state pull0 privado confirma23managed. Cache backend
não foi usado como prova do objeto. State bootstrap local separado preservado.
Lock liberado apósapply e apósplano. Plano posterior 2026-09-29T09:34:25-03:00/exit0/No changes,
sem sobrescrever plano aprovado, postapply.local.tfplan ignorado0600 preservado.
Outputs reais ID/IP EC2,hostname/portaRDS,URLAPI semsenha; URLnão prova serviço.
State/plano/JSON bruto contêm senha, permanecer privados0600/ignorados, não publicar.

T01–T23 verificadas nos respectivos ambientes. R13/R14/R15/R18/R19/R20/R21
verificados; R16/R17/R22 seguem parciais até serviçoAPI/SQL/CRUD/evidências futuras.
Validade das credenciais no instante das consultas comprovada, duração restante
não inferida. Sem SSH/bootstrapDocker/HTTP/SQL/CRUD/reboot comprovados; próximas
T24deploy/migração/serviço eT25CRUD EC2/RDS. Sem bloqueio T23. Recursos continuam
ativos/faturáveis; custo varia comtempo/carga, estimativa T22 não é teto/saldo.
Retomar escopo autorizado sem pedir mesma aprovação; mudança deescopo/plano e
teardown têm revisão concreta própria. Não destruir agora nem removerbackend/state.
Sem push/merge/PR; mergeT32 eentrega presencial01/10/2026 preservados.

Quatro novas evidências reais: aws-rede.txt/aws-rds.txt/aws-seguranca.txt/
terraform-outputs.txt. README/specs/matriz/AGENTS/diário sincronizados. Um commit
coerente da revisão/autorização/apply/conferência após revisar stage/segredos,
sem vazio/quantidade; suites inalteradas não repetidas. Brutos/metadados/auxiliares
privados em /tmp preservados, nenhuma credencial oustate completo versionado.

## Registro T24 — aceite executado na AWS

29/09/2026: inícioHEAD4895f98/18commits reais/feature limpa/main preservada.
Implementados scripts/deploy-api.py, deploy/install-remote.sh, unit systemd e
11testes de proteção. Imagem app do commit4895f98/checksum/configOCI conferidos;
SSH/SCP EIC existente com hostkey validada e ambiente root0600. SQL RDS efetivo
TLSv1.3/CA/rejecttrue, migração preservou OID16451/4colunas/3constraints/contagem0.
Deploy retry0/repetição0, rebootCLI0/nova boot_id/serviço automático, três HTTP200.
SóAPIcontainer/UID1000/API eDocker enabled/active. Falhas reais CRLF/digestOCI/
console e correções preservadas em ec2-deploy.txt; diário contém detalhes.
T24 verificada, R07 verificado; R06/R16/R17/R22/R29 continuam parciais.
T25 próxima, ainda pendente: seis rotas/CRUD/SQL e persistência de reserva RDS.
Sem bloqueio; nenhum dado inserido/apagado T24. App/infra/estados/evidências
anteriores preservados. Sem apply/destroy/push/merge/PR; recursos ativos/faturáveis.
Commit único coerente real, mergeT32 futuro; saldo atual não inferido.

## Registro T25 — implementação local, aceite AWS bloqueado

Verificador/testes implementados; dez testes locais0/CLIhelp0. Após usuário
renovarLab, STS0 reconheceu conta, EC2DescribeInstances254/voc-cancel-cred
impediu execução; script exit1 antes de HTTP/SQL/restart/dados. api-aws.txt/
rds-crud.txt/aws-seguranca.txt e diário registram bloqueio real. Atualizar
credenciais temporárias default (sem chat), revalidar e retomar T25; T26 futura.
Nenhum CRUD/persistênciaAWS novo comprovado; estados dos requisitos preservados.

## Atualização T25 — verificada em29/09/2026

Após credenciais atualizadas, auditoria/recuperação anteriores reais e T25
concluídas. EC2stopped ->running da mesma instância, novoIP54.234.84.228;
S3/DDB/state/locking íntegros, refresh-only0/stateoutputs novos/plano posterior0.
APIvoltouautomaticamente. Script10testes0/positivoAWS0:CRUD+SQLTLS/400/404,
ID3 persistiu apósrestart/containernovo/mesmaimagem. Negativo1detectouSQLstatus
incompatível ecleanupsóUUID/ID4; sentinelaID1 preservada e depoislimpa. Fixture0.
Bloqueio e auxiliares/correções reais anteriores preservados nas evidências,
sem inventarsucesso/dificuldade. PróximaT26, relatório com contribuição do aluno.
Sem bloqueioatual/destroy/push/merge/PR; recursosativos/faturáveis.
