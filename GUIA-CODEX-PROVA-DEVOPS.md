# Prova DevOps — resumo e prompt para Codex no VS Code

Fonte: https://github.com/AleTavares/devops_20262/blob/main/provas/prova-primeiro-bimestre.md
Lido em 27/09/2026, commit `637fef4f422a4a0a0a2a074d24374c7111a2e862`.
Método alinhado à aula 07: requisitos → design → tarefas → implementação validada.
Este arquivo prepara a execução; não constitui uma solução implementada nem evidência de testes.

## Resumo da prova

Construir uma API de Reservas Node.js/Express, com PostgreSQL real: localmente via Docker Compose e na AWS via EC2 + RDS, provisionados com Terraform modularizado e state remoto. Documentar o uso crítico da IA e entregar pelo GitHub.

| Entrega | Requisitos que não podem desaparecer do resumo |
|---|---|
| Git | Repositório público `prova-primeiro-bimestre-devops`; pelo menos 6 Conventional Commits reais; feature branch + merge; README com nome, RA e descrição. |
| API | Campos `id`, `cliente`, `data`, `status`; POST e GET `/reservas`; GET, PUT e DELETE `/reservas/:id`; GET `/health`; validar obrigatórios; busca inexistente retorna 404; CRUD persistido no PostgreSQL local e RDS. |
| Docker | `app/Dockerfile` funcional, usuário não-root, `.dockerignore`; multi-stage recomendado; evidências de build e execução. |
| Compose | `docker-compose.yml`: API + PostgreSQL, volume nomeado, rede bridge customizada, healthcheck do banco, `depends_on` condicionado à saúde; usar `/health` no healthcheck da API; `.env.example` sem segredos. |
| AWS | Learner Lab, `us-east-1`, credenciais temporárias com session token; não criar IAM users/groups/roles; usar `LabRole`/`LabInstanceProfile` quando necessário. |
| Rede | Módulo `vpc`: subnets públicas e privadas em 2 AZs. Módulo `security-group`: EC2 nas portas 22/3000 com menor privilégio; RDS 5432 somente a partir do SG da EC2. |
| Compute/banco | Módulo `ec2`: t2.micro pública executando API; módulo `rds`: PostgreSQL db.t3.micro funcional em subnets privadas, `publicly_accessible=false`, `storage_encrypted=true`, subnet group privado. |
| Terraform | Composição entre módulos; tags em todos os recursos que as suportem; outputs IP EC2, endpoint RDS e URL API; backend S3 com versionamento/encriptação + DynamoDB locking. Criar backend antes da infraestrutura principal. |
| Evidências | Build, execução, Compose, validate/plan; comprovar CRUD local e na nuvem; executar `terraform destroy` após capturar evidências. |
| Relatório | `relatorio.md`: ferramenta de IA e 4 respostas dissertativas, mínimo de 10 linhas por questão, baseadas no processo real. |
| Submissão | No fork da disciplina, apenas `entregas/provaPrimeiroBi/SEU-RA/entrega.md`, contendo link do projeto e evidências. Um único PR, presencialmente no dia da prova; não adicionar commits ao PR depois de aberto. |

O relatório vale 40% da nota; Git/Docker 15%, Compose 10%, Terraform 25% e uso de IA 10%. A data exata da prova não está informada no enunciado consultado.

## Como usar

1. Abra no VS Code a pasta do seu projeto `prova-primeiro-bimestre-devops`.
2. Coloque este arquivo na raiz. Tenha uma cópia do enunciado original disponível ao Codex.
3. Cole o prompt abaixo no Codex. Ele prepara primeiro os documentos para sua revisão.
4. Depois de revisar requisitos, design e tarefas, use o comando de execução ao final.

Spec-driven define o que construir, como e em quais passos. Harness é a estrutura de contexto, regras, ferramentas, verificações e registro de progresso que guia a execução. Aqui, `AGENTS.md`, os documentos em `specs/` e os scripts de validação concretizam essa estrutura. São escolhas de organização para este projeto, não requisitos adicionais do professor nem um modo especial do Codex.

## Prompt inicial — copiar no Codex

```text
Atue como meu copiloto e mentor nesta prova individual de DevOps.
Leia GUIA-CODEX-PROVA-DEVOPS.md e o enunciado original. O enunciado
define os requisitos da entrega; preserve todos os critérios obrigatórios.
Não copie soluções de outros alunos. Responda em português.

OBJETIVO
Entregar a API de Reservas especificada, com CRUD em PostgreSQL,
Docker/Compose local, EC2/RDS via Terraform modularizado, S3+DynamoDB,
evidências reais, histórico Git e relatório do processo.

PRIMEIRA ETAPA: ESPECIFICAR
Inspecione a pasta, o Git e instruções existentes sem sobrescrever trabalho.
Leia somente os materiais relevantes; não carregue entregas de colegas.
Crie ou complemente, preservando o conteúdo existente:
- AGENTS.md: contexto, regras e comandos reais de validação do projeto.
- specs/requirements.md: requisitos R01... com critérios observáveis de aceite.
- specs/design.md: arquitetura, contratos da API, esquema PostgreSQL,
  configuração, deploy, rede, módulos, bootstrap/state e teardown.
- specs/tasks.md: tarefas pequenas ordenadas, dependências, requisito
  relacionado, teste e evidência esperada; estados pendente/em andamento/
  verificado/bloqueado.
Separe exigências do professor de decisões técnicas suas. Defina e justifique
os detalhes não especificados, como tipo de data, status aceitos e semântica
de PUT. Não invente meu RA, nome completo, GitHub ou data da prova.
Use placeholders quando possível e pergunte apenas pelo que bloquear o passo.
Nesta primeira etapa, entregue os documentos e pontos para revisão antes
de gerar código da aplicação. Quero compreender e revisar a especificação.

REGRAS DO HARNESS A REGISTRAR EM AGENTS.md
1. Trabalhe em uma tarefa por vez: ler requisito → implementar → executar
   verificação → corrigir falha → registrar evidência → atualizar tasks.
2. Não marque como verificado algo apenas gerado ou não executado.
   Distinga validação estática, teste local e teste efetivo na AWS.
3. Explique brevemente a decisão de cada etapa e como posso conferi-la.
4. Mantenha specs sincronizadas com decisões e registre o motivo de mudanças.
5. Não exponha credenciais em respostas, logs, exemplos ou commits.
   Ignore node_modules, .env, .terraform, *.tfstate*, *.pem, planos binários
   e arquivos locais de variáveis com segredos. Revise evidências antes do Git.
6. AWS é Learner Lab, us-east-1. Não criar IAM users/groups/roles.
   Usar LabRole/LabInstanceProfile existentes quando necessário.
7. Não substituir RDS por PostgreSQL em container na nuvem. O CRUD da EC2
   precisa realmente ler e gravar no RDS privado.
8. Manter DynamoDB no locking, conforme a prova. Selecionar versões
   compatíveis e verificar documentação oficial diante de incompatibilidades.
9. Fazer commits coerentes com as etapas reais, pelo menos seis; preservar
   feature branch e merge como evidência. Não inventar histórico retroativo.
10. Antes de apply, apresentar o plano e confirmar a autorização para
    provisionar. Após evidências, preparar teardown com escopo explícito;
    não apagar dados ou state sem minha autorização. Não usar auto-approve
    para eliminar revisão. Retomar automaticamente as tarefas já autorizadas.
11. Não abrir o PR de entrega automaticamente. Ele só pode ser aberto
    presencialmente no dia da prova, uma única vez, sem commits posteriores.
12. Registrar prompts, decisões, correções e resultados reais em
    docs/diario-ia.md. Não inventar dificuldades ou experiências para o relatório.

SEQUÊNCIA DE EXECUÇÃO, APÓS REVISÃO DAS SPECS
A. Git/.gitignore/README; API, schema e testes de CRUD com PostgreSQL real.
B. Dockerfile não-root/.dockerignore; build e execução.
C. Compose completo; CRUD, healthchecks e persistência após recriar
   containers sem remover o volume.
D. Bootstrap infra/backend: S3 versionado/encriptado e DynamoDB;
   inicializar o backend principal somente após esses recursos existirem.
E. Módulos vpc, security-group, ec2, rds e composição; revisar segurança,
   conectividade e plano antes de provisionar.
F. Deploy reproduzível da API na EC2, schema no RDS, CRUD e /health
   na nuvem, com evidências reais e sem segredos.
G. Relatório, evidências de Git, checklist e destruição da infraestrutura
   após coleta. Tratar backend separadamente: nunca removê-lo antes de
   destruir a infraestrutura que depende dele; explicar retenção/limpeza
   do bucket versionado e preservar o state necessário até encerrar.
H. Preparar entrega.md no caminho do fork, revisar a submissão inteira
   e aguardar a data correta para a abertura do único PR.

VALIDAÇÃO REPRODUZÍVEL
Crie scripts de verificação compatíveis com o projeto, com dependências
documentadas, saída clara e exit code não zero quando houver falha.
Não execute provisionamento nem destruição nos scripts de teste.
- API: criar, listar, buscar, atualizar, excluir, entrada inválida e 404.
- Banco: comprovar persistência com PostgreSQL real, local e RDS.
- Docker: build, usuário não-root, execução e Compose saudável.
- Terraform: fmt -check -recursive, init/validate e plan nos diretórios
  adequados, respeitando a ordem bootstrap → backend → infra.
- AWS: RDS privado e encriptado, SG 5432 apenas da EC2, SSH restrito ao
  meu IP/CIDR, porta 3000 limitada ao acesso necessário, sem IAM próprio.
- Entrega: arquivos, evidências, seis commits, branch/merge, quatro
  respostas e destroy comprovado. Plan aprovado não comprova deploy.
Mantenha a matriz requisito → verificação → evidência → estado.

RELATÓRIO
Organize relatorio.md em quatro respostas dissertativas de pelo menos
10 linhas cada: (1) jornada das aulas 01–07; (2) prompts, acertos/correções
da IA e comparação com processo manual; (3) arquitetura, segurança e
restrições do Learner Lab; (4) checklist pré-apply, validação e responsabilidade.
Baseie o texto no diário e peça minha contribuição sobre a experiência.
Identifique o Codex e as ferramentas realmente utilizadas.

Agora execute somente a primeira etapa: inspecionar e produzir as specs
e AGENTS.md. Mostre o que preciso revisar antes da implementação.
```

## Prompt para executar depois da revisão

```text
Revisei as specs. Execute a próxima tarefa pendente de specs/tasks.md,
seguindo AGENTS.md. Implemente, valide, corrija e registre evidências reais.
Explique o conceito aplicado, os arquivos alterados, o teste executado e
o próximo passo. Se houver bloqueio, registre-o sem simular sucesso.
```

## Prompt para retomar outra sessão

```text
Leia AGENTS.md, specs/tasks.md e as partes relevantes das demais specs.
Confira git status e o diário. Resuma o estado real, retome a próxima tarefa
pendente e preserve meu trabalho. Não repita tarefas concluídas sem motivo.
```

## Referências

- Enunciado: https://github.com/AleTavares/devops_20262/blob/main/provas/prova-primeiro-bimestre.md
- Método apresentado na aula 07: https://github.com/AleTavares/devops_20262/blob/main/aula-07/aula-07.md
- Instruções de projeto do Codex: https://developers.openai.com/codex/guides/agents-md

Os documentos e scripts sugeridos organizam o trabalho; a responsabilidade
pela revisão, compreensão e demonstração da solução continua sendo do aluno.
