# API de Reservas — instruções de trabalho

## Contexto e autoridade

Prova individual de DevOps, aulas 01–07. Entregar Node.js/Express com CRUD
persistido em PostgreSQL, Docker/Compose local e EC2/RDS no AWS Academy
Learner Lab, com Terraform modularizado, S3+DynamoDB, evidências e relatório.
Responder em português BR, explicar as decisões e permitir que o aluno as confira.

Fontes consultadas em 27/09/2026:

- [Enunciado](https://github.com/AleTavares/devops_20262/blob/637fef4f422a4a0a0a2a074d24374c7111a2e862/provas/prova-primeiro-bimestre.md): define a entrega obrigatória.
- [Aula 07](https://github.com/AleTavares/devops_20262/blob/637fef4f422a4a0a0a2a074d24374c7111a2e862/aula-07/aula-07.md): requisitos → design → tarefas → implementação validada.
- `GUIA-CODEX-PROVA-DEVOPS.md` e o pedido do aluno: definem o modo de trabalho.
- `specs/requirements.md`, `specs/design.md`, `specs/tasks.md`: requisitos,
  decisões propostas e acompanhamento. Não transformar escolhas do design em
  critérios que o professor teria exigido.

Em 28/09/2026, o aluno revisou T10 e autorizou T11. T01–T11 estão verificadas em
`feat/api-reservas`. T10 foi commitada em 49dbd5e, sete commits reais; merge em T32
continua pendente. Código da API/schema/Dockerfile/lockfile e evidências T06–T10
preservados. Suíte nativa de 51 testes (T09) e test:docker (T10) não repetidos:
T11 verificou o Compose com healthchecks e os mesmos códigos.

`npm --prefix app run test:compose` passou com Compose v5.5.1, exit 0. Config
sem senha retornou 1 esperado; config válido/JSON privado conferiu mapeamento
POSTGRES_* -> PG*. Containers partiram parados: db saudável às 22:41:56.797
-03:00, API iniciou às 22:41:57.175 -03:00; ps mostrou ambos healthy. Rede bridge
reservas-net por projeto, banco sem porta publicada, API loopback 32775 no teste
(padrão 3000), volume nomeado reservas-data e SQL bootstrap read-only confirmados.
/health, seis rotas e SQL reais com PostgreSQL 16.15/UID API 1000. JSON 01-10-2026,
SQL DATE 2026-10-01; zero linhas ao final. Fixture UUID foi encerrado, volume
novo/exclusivo removido separadamente após conferir labels; zero recursos do teste.
Ambiente temporário 0600 em /tmp removido; nenhum .env do usuário criado/alterado.

Evidências reais em compose-ps.txt e compose-rede-saude.txt; trecho HTTP/SQL
anexado a api-local.txt mantendo integralmente seu histórico. .env.example com
quatro variáveis/placeholders conferido por config --quiet; valores padrão e variáveis derivadas
conferidos só em memória. Espaços finais das novas transcrições normalizados de modo
explícito, sem apagar avisos/resultados. Sem falha inesperada ou bloqueio local.
R09/R11/R12 verificados; R10 permanece pendente da prova de persistência ao recriar containers.
Próxima tarefa: T12, verify-persistence.py e persistência ao recriar containers.
Não avançar para T12 no encerramento de T11. Terraform, AWS, merge e publicação
seguem futuros. Nunca usar down -v para testar persistência ou descartar dados
do usuário; a limpeza T11 remove somente volume novo do fixture UUID conferido.

O contrato aprovado exige data civil `DD-MM-YYYY` nas entradas e saídas JSON.
Manter PostgreSQL `DATE` e conversão explícita por componentes; não depender de
parser JavaScript/localidade/timezone para interpretar esse formato.

Dados informados pelo aluno em 28/09/2026: Andreyh Rodrigues de Souza,
RA 6325231, data de entrega 01/10/2026. Usar esses dados em README e submissão;
não confundir a data da sessão com a data de entrega. A data não autoriza abertura
antecipada nem automática do PR. O remote local aponta para
`https://github.com/Andreyh117/prova-primeiro-bimestre-devops.git`; isso identifica
a configuração observada, mas não comprova existência, propriedade ou visibilidade
pública do repositório remoto. Não preencher identidade com memórias de outras aulas.

## Regras do harness

1. Executar uma tarefa de `specs/tasks.md` por vez: ler requisito → implementar
   → verificar → corrigir falha → registrar evidência → atualizar estado.
   Antes de retomar, conferir `git status`, a tarefa e as partes relevantes das specs.
   Preservar arquivos e alterações preexistentes; não ler/copiar entregas de colegas.
2. Marcar `verificado` somente quando o aceite daquela tarefa tiver sido executado.
   Separar revisão/validação estática, teste local e execução efetiva na AWS.
   Arquivo gerado, ferramenta instalada ou plan aprovado não comprova deploy.
3. Explicar brevemente o conceito, a decisão, os arquivos alterados, a verificação
   e a maneira de o aluno conferir. Não avançar além do escopo autorizado.
4. Sincronizar specs e implementação; registrar motivo e impacto de alterações.
   Manter a matriz requisito → verificação → evidência → estado atualizada.
5. Nunca expor credenciais em respostas, logs, exemplos ou commits. Antes de criar
   segredos, preparar `.gitignore` para `node_modules/`, `.env` e variantes locais
   (preservando `.env.example`), `.terraform/`, `*.tfstate*`, `*.pem`, planos
   binários e arquivos locais de variáveis/backend com segredos. Versionar os
   lockfiles de dependências. Revisar/redigir evidências antes do Git.
6. Usar somente Learner Lab em `us-east-1`, com credenciais temporárias incluindo
   session token. Não criar IAM users/groups/roles/policies para contornar o Lab;
   usar `LabRole`/`LabInstanceProfile` existentes quando necessário. Não imprimir
   `~/.aws/credentials` nem dumps de ambiente. `ExpiredToken` pede renovar o Lab.
7. Na nuvem, a API na EC2 deve realmente ler/gravar no RDS privado; não substituir
   RDS por PostgreSQL em container. Comprovar CRUD e conexão ao banco real.
8. Manter DynamoDB no locking exigido pela prova. Fixar versões compatíveis;
   consultar documentação oficial e validar antes de qualquer mudança. Não trocar
   silenciosamente por locking exclusivo em S3 nem usar `-lock=false`.
9. Criar pelo menos seis Conventional Commits correspondentes às etapas reais.
   Preservar feature branch e merge como evidência. Não inventar commits
   retroativos, datas, branches ou dificuldades; não fazer commits vazios para
   completar a contagem. Revisar os arquivos antes de cada commit.
10. Antes de cada `apply`, apresentar o plano concreto, conta/região, recursos,
    acessos e custo previsto, e obter autorização para aquele escopo. Após coletar
    evidências, preparar teardown e obter autorização para apagar recursos/dados.
    Não apagar state/backend antes da infraestrutura dependente; não usar
    `-auto-approve` para suprimir revisão. Retomar tarefas já autorizadas sem
    pedir a mesma autorização novamente; mudança de escopo exige nova revisão.
11. Não abrir automaticamente o PR de entrega. A abertura só ocorre presencialmente
    no dia confirmado da prova, uma única vez. O PR contém apenas
    `entregas/provaPrimeiroBi/6325231/entrega.md` no fork da disciplina. Depois de
    aberto, não acrescentar commits ao PR. Revisar tudo antes dessa abertura.
12. Na execução, manter `docs/diario-ia.md` com prompts relevantes, decisões,
    correções, comandos, resultados e limitações reais, sem segredos. Usar o diário
    como base do relatório, identificar Codex e ferramentas realmente usadas e
    pedir a contribuição do aluno sobre sua experiência. Não escrever vivências
    pessoais em nome dele. O registro inicial desta etapa está em `specs/tasks.md`.

## Estado observado e comandos

Em 27/09/2026, antes destas specs: apenas o guia estava presente; `main` não tinha
commits, `git ls-files` estava vazio e nenhum AGENTS.md herdado foi encontrado nos
diretórios ancestrais. Não há aplicação ou infraestrutura testável ainda.

Foram consultadas versões, sem iniciar serviços: Git 2.43.0, Node 24.21.0,
npm 11.19.0, Docker CLI 29.8.1, Terraform 1.16.2, AWS CLI 2.35.6 e Python 3.12.3.
Naquela consulta apenas versões foram lidas. Em T06, o daemon Docker foi validado
com banco real. Em T11 o plugin Compose v5.5.1 foi validado; credenciais AWS e
permissões de nuvem continuam futuras.
O terminal isolado falhou com `mountinfo path is not absolute`; as leituras foram
executadas fora desse isolamento. Essa falha é do ambiente, não da aplicação.

Comandos aplicáveis agora, na raiz:

```bash
git status --short --branch
git ls-files
rg --files --hidden -g '!.git/**' -g '!node_modules/**'
```

A validação PostgreSQL/HTTP/script/restart/Docker e Compose está disponível até T11;
os demais comandos dependem
das respectivas tarefas. Não anunciar sucesso quando arquivos/dependências não
existirem. Scripts devem ter saída clara e exit code não zero na falha.

| Verificação | Comando e pré-condição |
|---|---|
| PostgreSQL, HTTP e restart (T09 disponível) | `npm --prefix app ci --ignore-scripts --no-fund`; `npm --prefix app test`. Node 24, Python 3 (validado 3.12.3) e Docker local: 51 testes, incluindo script/restart e pause/unpause/stop somente do banco UUID/labels verificados; limpeza confirmada. |
| API nativa (T07 disponível) | Configurar PG* em banco próprio e aplicar `npm --prefix app run db:migrate`; executar `npm --prefix app start`. PORT padrão 3000; não usar dados de outros projetos. |
| Build Docker (T10 disponível) | `docker build -t prova-reservas:local app`; Docker/BuildKit, acesso às imagens/npm na primeira execução; digest/lockfile fixos. |
| Usuário da imagem (T10 disponível) | `docker run --rm --entrypoint id prova-reservas:local -u`; UID 1000 validado. |
| Docker com banco real (T10 disponível) | `npm --prefix app run test:docker`; Node 24, Python 3 e Docker/BuildKit. Exporta contexto, cria banco/rede UUID exclusivos, migra via imagem, testa PID 1/UID/health/CRUD/SQL/SIGTERM e limpa somente seus recursos; senha em memória. Imagem local fica disponível. |
| Compose (T11 disponível) | Copiar .env.example para .env ignorado/0600, trocar senha; `docker compose config --quiet`; `docker compose up --build --wait`; `docker compose ps`. Compose com start_interval (>=2.20.2), validado v5.5.1. Não publicar config completo, que expande senhas. |
| Teste Compose isolado (T11 disponível) | `npm --prefix app run test:compose`; Node 24/Python 3/Docker/Compose. Usa env privado/projeto UUID, parte de containers parados e confere saúde/ordem/rede/volume/CRUD/SQL. Limpa só seus recursos e o volume novo exclusivo; não toca .env/volumes do usuário nem testa recriação T12. |
| Saúde local (T08 disponível) | `curl --fail --silent --show-error http://127.0.0.1:3000/health`, com API nativa ou Compose configurado em execução; PORT publicado pode variar. |
| CRUD local (T09 disponível) | `python3 scripts/verify-api.py --base-url http://127.0.0.1:3000`; Python stdlib, API/banco já iniciados; cria marcador/IDs próprios, confere HTTP/JSON e limpa em finally. Código 1 na falha; configuração CLI inválida retorna 2. |
| Persistência Compose | `python3 scripts/verify-persistence.py`; script futuro recria containers preservando o volume e confere dados no banco real; nunca usa `down -v`. |
| Formatação Terraform | `terraform fmt -check -recursive infra`. |
| Bootstrap | `terraform -chdir=infra/backend init`; `terraform -chdir=infra/backend validate`; `terraform -chdir=infra/backend plan -out=backend.tfplan`; variáveis locais e credenciais válidas. Plano binário ignorado. |
| Infra, revisão estática | `terraform -chdir=infra init -backend=false`; `terraform -chdir=infra validate`; baixa providers, mas não provisiona nem valida recursos na AWS. |
| Infra, backend efetivo | Após bootstrap aprovado e aplicado: `terraform -chdir=infra init -reconfigure -backend-config=backend.local.hcl`; `terraform -chdir=infra validate`; `terraform -chdir=infra plan -out=infra.tfplan`. |
| CRUD na EC2/RDS | `python3 scripts/verify-api.py --base-url "$API_URL"`; `python3 scripts/verify-aws.py`; banco privado acessado pela EC2, conta/região conferidas e dados exclusivos de teste. |
| Entrega | `python3 scripts/verify-delivery.py`; conferir documentos, seis commits, branch/merge, quatro respostas, evidências reais e limpeza AWS. |

As variáveis de shell acima devem ser configuradas conforme o README futuro.
`verify-aws.py` usará AWS CLI e SSH, sem imprimir segredos; scripts de validação
nunca executarão `apply` ou `destroy`. Terraform deve respeitar bootstrap →
backend remoto → infraestrutura. Planos e sua saída só podem ser publicados
depois da revisão de conteúdo sensível.

## Histórico, relatório e entrega

Planejar commits reais de documentação, API, Docker, Compose, backend, módulos,
deploy e evidências. Depois do commit inicial, desenvolver em feature branch e
fazer merge com preservação de seus commits e da referência da branch.

`relatorio.md` deverá identificar a IA no início e conter quatro respostas
dissertativas, cada uma com no mínimo dez linhas de conteúdo: jornada das aulas;
processo com IA e comparação manual; arquitetura/segurança/Learner Lab; checklist,
validação e responsabilidade. Quebras artificiais e títulos não substituem texto.

Trabalhar no fork da disciplina em checkout/worktree separado. Não presumir
autenticação GitHub, remote público, PR ou deploy só pela configuração local.
Não realizar push/publicação nesta etapa. Consultar `specs/tasks.md` para retomar.
