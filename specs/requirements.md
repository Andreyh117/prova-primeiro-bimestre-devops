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
na verificação Git/documental local. Ainda não há teste API/Docker/Terraform/AWS.
Nome, RA e entrega foram informados pelo aluno; T05 está em andamento e R02
permanece parcial até seis commits e merge reais. Caminhos de evidência são
planejados, exceto arquivos efetivamente criados e registrados em tasks/diário.

## Matriz requisito → verificação → evidência → estado

| ID / origem | Requisito e aceite observável | Verificação | Evidência esperada | Estado |
|---|---|---|---|---|
| R01 / P | Repositório próprio público `prova-primeiro-bimestre-devops`, README na raiz com nome completo, RA e descrição; estrutura `app/`, `infra/`, `evidencias/` e `relatorio.md` conforme enunciado. | Conferir arquivos e acesso público ao GitHub sem login; placeholders resolvidos antes da entrega. | README, URL pública e `evidencias/entrega-checklist.txt`. | em andamento |
| R02 / P | Pelo menos seis commits reais usando Conventional Commits; feature branch e merge demonstráveis. | Contar commits, revisar mensagens e grafo; localizar commits exclusivos da feature e merge. | `evidencias/git-workflow-inicial.txt` (T05); `evidencias/git-log.txt` e `evidencias/git-branches.txt` (final). | em andamento |
| R03 / P+U | `.gitignore` protege node_modules, .env, .terraform, state/backups, PEM, planos binários e variáveis locais sensíveis; nenhum segredo rastreado. | `git check-ignore` em caminhos representativos e revisão de arquivos staged/rastreados, incluindo evidências. | `.gitignore` e `evidencias/segredos-checklist.txt`, sem segredos. | verificado |
| R04 / P | API Node.js/Express com `id`, `cliente`, `data`, `status` e POST/GET `/reservas`, GET/PUT/DELETE `/reservas/:id`. | Criar, listar, buscar, atualizar e excluir a mesma reserva; verificar corpo e persistência. | `evidencias/api-local.txt`, `evidencias/api-aws.txt`. | pendente |
| R05 / P | POST valida campos obrigatórios; GET por ID inexistente retorna 404. | Omitir cada obrigatório, enviar vazio/inválido e buscar ID ausente; não gravar entradas rejeitadas. As demais regras são decisões D01–D04. | Testes de integração e logs de CRUD. | pendente |
| R06 / P | CRUD usa PostgreSQL real localmente e RDS na nuvem, lendo e gravando no banco; sem armazenamento em memória substituindo persistência. | Conferir a linha por SQL, reiniciar a API e consultá-la novamente nos dois ambientes. | `evidencias/postgres-local.txt`, `evidencias/rds-crud.txt`. | pendente |
| R07 / P | GET `/health` implementado e usado pelo healthcheck da API no Compose. | Inspecionar healthcheck e resposta HTTP; para a decisão D05, testar também indisponibilidade do banco. | `evidencias/health-local.txt`, `evidencias/health-aws.txt`, Compose. | pendente |
| R08 / P | `app/Dockerfile` funcional, usuário não-root e `app/.dockerignore`; build e execução comprovados. Multi-stage é recomendado, não obrigatório. | Build real, UID não zero, API executada em container e banco real acessível. | `evidencias/docker-build.txt`, `evidencias/docker-run.txt`. | pendente |
| R09 / P | `docker-compose.yml` inicia API + PostgreSQL com um comando após configurar o ambiente. | `docker compose up --build --wait`; ambos saudáveis e CRUD funcional. | `evidencias/compose-ps.txt`, `evidencias/api-local.txt`. | pendente |
| R10 / P | Volume nomeado mantém os dados PostgreSQL. | Criar reserva, recriar containers sem remover volume e confirmar linha por API e SQL. | `evidencias/compose-persistencia.txt`. | pendente |
| R11 / P | Rede bridge customizada; healthcheck PostgreSQL; API depende do banco com condição de saúde. | Conferir configuração/rede efetiva e subida desde banco parado; API só inicia após banco saudável. | Compose e `evidencias/compose-rede-saude.txt`. | pendente |
| R12 / P | `.env.example` versionado sem senhas reais; `.env` ignorado. | Comparar nomes de variáveis com app/Compose; validar ambiente sem imprimir valores. | `.env.example`, `.gitignore`, checklist. | pendente |
| R13 / P | AWS Academy Learner Lab em `us-east-1`, credenciais temporárias com token; nenhum IAM user/group/role novo; usar LabRole/LabInstanceProfile existentes quando necessário. | Confirmar conta/região e expiração sem divulgar credenciais; revisar plano e instance profile efetivo. | `evidencias/aws-seguranca.txt`, plano sanitizado. | pendente |
| R14 / P | Módulo `vpc` cria VPC e subnets públicas/privadas em duas AZs. | Plano e AWS mostram duas subnets públicas, duas privadas, AZs distintas e rotas coerentes. | Módulo e `evidencias/aws-rede.txt`. | pendente |
| R15 / P+U | Módulo `security-group`: EC2 22/3000 com menor privilégio, SSH restrito ao IP/CIDR do aluno e API aos clientes necessários; RDS 5432 somente do SG da EC2. | Inspecionar regras e origens em plano/AWS; negar SG do RDS com CIDR público ou origem adicional. | `evidencias/aws-seguranca.txt`. | pendente |
| R16 / P | Módulo `ec2`: t2.micro pública executando a API; LabInstanceProfile se houver acesso a serviços. | Conferir tipo/subnet/IP/profile e chamar as seis rotas na EC2 após deploy. | `evidencias/ec2-deploy.txt`, `evidencias/api-aws.txt`. | pendente |
| R17 / P | Módulo `rds`: PostgreSQL db.t3.micro provisionado e funcional como banco da API na nuvem. | RDS `available`; SQL pela EC2 confirma dados do CRUD e o endpoint realmente usado pela API. | `evidencias/rds-crud.txt`, `evidencias/aws-rds.txt`. | pendente |
| R18 / P | RDS `publicly_accessible=false`, `storage_encrypted=true`, subnet group nas privadas e acesso só do SG EC2 na 5432. | Conferir valores efetivos em AWS, subnet group e SG, além de revisar Terraform. | `evidencias/aws-rds.txt`, `evidencias/aws-seguranca.txt`. | pendente |
| R19 / P | `infra/modules/{vpc,security-group,ec2,rds}`; composição de outputs/inputs em `infra/main.tf`; variables/outputs/providers; tags e outputs IP EC2, endpoint RDS e URL API. | `validate`, plano e revisão dos vínculos; tags em todos os recursos que suportam tagging e outputs sem senhas. | Código futuro e `evidencias/terraform-validate.txt`, `evidencias/terraform-plan.txt`, `evidencias/terraform-outputs.txt`. | pendente |
| R20 / P | State principal remoto em S3 versionado/encriptado; locking DynamoDB ativo. | Conferir configuração efetiva do bucket/tabela, objeto de state e uso de lock no backend, sem divulgar conteúdo do state. | `evidencias/backend.txt`, `evidencias/backend-locking.txt`. | pendente |
| R21 / U; dica P | Criar `infra/backend` antes de inicializar o backend S3 principal; preservar state bootstrap separado. | Registrar sequência: bootstrap init/validate/plan, apply autorizado, conferência de S3/DynamoDB, init principal. | `evidencias/backend.txt` e diário. | pendente |
| R22 / P+U | Evidências reais de build, execução, Compose, `terraform validate` e `plan` sem erros, CRUD local e nuvem; separar estática/local/AWS. | Cada aceite tem comando, ambiente, resultado e arquivo real; plano não serve como prova de CRUD/deploy. | Arquivos em `evidencias/` com índice no README. | pendente |
| R23 / P+U | Executar `terraform destroy` após coletar evidências; preparar limpeza do backend separadamente, preservando state até encerrar. | Plano de destruição revisado/autorizado, destroy principal real e ausência de recursos confirmada; explicitar retenções/pendências do backend. | `evidencias/terraform-destroy.txt`, `evidencias/aws-pos-destroy.txt`, `evidencias/backend-teardown.txt`. | pendente |
| R24 / P | Usar Kiro ou outra LLM como copiloto para parte da solução e documentar uso crítico. | Histórico e diário identificam Codex, prompts, revisão humana, geração e correções efetivamente ocorridas. | `docs/diario-ia.md`, `relatorio.md`. | em andamento |
| R25 / P | `relatorio.md` identifica IA no início; quatro respostas dissertativas com mínimo de dez linhas por questão sobre jornada 01–07, IA/manual, arquitetura/segurança/Lab e validação/responsabilidade. | Conferir quatro respostas, extensão e coerência com diário/evidências; aluno contribui com experiência pessoal. | `relatorio.md` e checklist. | pendente |
| R26 / P | No fork da disciplina, PR altera apenas `entregas/provaPrimeiroBi/6325231/entrega.md`, com link do projeto e evidências; modelo traz aluno, RA, data, IA e checklist. | Conferir diff contra base correta; links funcionais e somente o arquivo de entrega no PR. | Arquivo no fork separado e diff de submissão. | pendente |
| R27 / P | Apenas um PR por aluno, aberto presencialmente no dia da prova; nenhum commit posterior no PR. | Confirmar data com aluno/professor antes da abertura e revisar submissão completa; registrar URL/base/head/commit final. | PR e `evidencias/entrega-checklist.txt`; abertura fora desta etapa. | pendente |
| R28 / U | Primeiro inspecionar sem sobrescrever, produzir AGENTS e três specs, separar exigências/decisões e obter revisão antes de código; tarefas pequenas e matriz sincronizada. | Conferência documental T01/T02; aprovação do aluno T03. | Os quatro documentos e registro da etapa em tasks. | verificado |
| R29 / U | Scripts reproduzíveis documentam dependências, saída clara e exit code não zero na falha; não provisionam/destruem infraestrutura. | Testar caso válido e falha controlada; revisar efeitos de cada script e seu uso no README. | Scripts futuros e logs de execução por ambiente. | pendente |
| R30 / U | Diário registra prompts, decisões, correções e resultados reais; nunca inventar identidade, experiência, evidências ou histórico. | Confrontar diário/relatório com comandos, Git e relato do aluno; usar placeholders enquanto faltarem informações. | `docs/diario-ia.md`, specs e relatório. | em andamento |
| R31 / U | Antes de provisionar/destruir, apresentar plano e obter autorização específica; sem auto-approve ou apagamento antecipado de state/dados. | Diário registra revisão, escopo e autorização antes de cada operação; scripts só verificam. | Diário, planos locais ignorados e evidências sanitizadas. | pendente |
| R32 / U | Data civil em `DD-MM-YYYY` nas entradas POST/PUT e nas respostas JSON de reservas; PostgreSQL permanece DATE. | Testar datas válidas e bissextas, rejeitar impossíveis/outros formatos e conferir ida/volta via SQL sem deslocamento de dia. Decisão D02 revisada. | Testes futuros, api-local.txt, api-aws.txt e rds-crud.txt. | pendente |

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
toda a matriz, inclusive destroy e submissão no momento correto; nenhuma operação
AWS foi executada. Requisitos contínuos, como R03, devem ser revalidados antes do Git.
