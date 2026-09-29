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

Em 28/09/2026, o aluno revisou T11 e autorizou T12, verificada localmente.
T01–T12 estão verificadas em feat/api-reservas. HEAD inicial de T12 era 534f484,
oito commits reais; merge permanece T32. Código API/schema/Dockerfile/Compose/
lockfile e evidências anteriores preservados; o novo npm script não muda deps.

verify-persistence.py tem fases prepare/check/cleanup: HTTP/SQL em Compose já
iniciado, checkpoint exclusivo 0600 fora do repo, IDs novos de api/db e mesmo
nome/CreatedAt do volume. Não executa up/down nem remove containers/volumes.
Check compara DD-MM-YYYY/DATE e limpa somente marcador/ID próprios em finally;
SQL count 0 precede remover checkpoint. Cleanup permite cancelar sem afirmar
persistência. Se a limpeza falhar, retém checkpoint e informa IDs/marcador.

npm --prefix app run test:persistence passou em duas execuções após corrigir
TypeError real inicial (Path.open não aceita opener; usar open). A final em
23:10:29 -03:00 confirmou PostgreSQL 16.15/Compose v5.5.1, reserva ID 2 idêntica
após recriar ambos containers mantendo volume; ID 3 com status alterado por SQL
retornou 1 esperado; ID 4 sem recriação retornou 1 esperado. Sobrescrita de
checkpoint recusada/1, bytes/linha preservados; cancelamento cleanup ID 5/0.
Sentinela ID 1 mantida por GET/SQL entre todos os casos; final limpou sentinela,
total SQL 0, down sem -v e remoção separada só do volume novo/vazio UUID após
conferir labels. Zero recursos UUID, env/checkpoints em /tmp removidos; .env do
usuário ausente/preservado. Falha inicial e duas execuções reais preservadas em
compose-persistencia.txt, normalizando explicitamente só espaços finais.

R10 foi verificado localmente em T12; R06/R22/R29 continuam parciais até AWS/
demais scripts. Ao encerrar T12, T13 era a próxima; atualização atual abaixo.
Não repetir suíte nativa/T10/T11 sem novas mudanças ou
falhas nesses componentes. Preservar logs anteriores e nunca usar down -v como
prova de persistência ou apagar volumes/dados de outros projetos.

Atualização T13, após revisão do aluno em 28/09/2026: T01–T13 verificadas;
HEAD inicial 30a2dac/nove commits, merge T32 pendente. T13 somente consultas AWS
read-only e sonda Terraform em /tmp. STS default/us-east-1/voclabs válido naquele
momento, conta mascarada; aluno confirmou Learner Lab correto, US$0 usados de
US$50 no painel e API somente IP atual /32. .gitignore preparado antes de
infra/preflight.local.json 0600 com conta/IP/CIDRs/opções; não é tfvars/state/
plan nem autorização de apply, não contém credenciais ou chave privada.

AZs escolhidas us-east-1a/use1-az4 e us-east-1b/use1-az6 reais, t2.micro ofertada;
RDS16.15/db.t3.micro/gp3/20GiB/encriptação possível em ambas. Key existente vockey
única no retorno; LabInstanceProfile contém LabRole. Posse da chave privada/SSH
não testados; não inferir duração restante do token. Revalidar identidade/região/
IP/opções antes dos planos, restringir SSH/API ao /32 confirmado pelo aluno.

D11 agora fixa Terraform=1.16.2 e hashicorp/aws=6.65.0: init/validate e schema
DynamoDB/RDS passaram em sonda sem credenciais/backend remoto. Primeiro init
falhou apesar de versão listada; repetição direct passou na mesma versão, causa
não comprovada. Schema com declaração S3 não inicializada falhou; corrigida
somente sonda local retirando essa declaração. Logs completos/correções em
aws-preflight.txt; fonte oficial v1.16.2 mantém dynamodb_table depreciado.
Locking ativo ainda T21, não comprovado aqui. .terraform.lock.hcl da sonda em
/tmp/devops-t13-provider.lock.hcl; criar/versionar lockfiles dos roots quando
implementá-los em T14/T21. Caches/sondas próprias removidos; zero recursos criados.

Ao encerrar T13, próxima era T14, implementar/bootstrap validate/plan; apply
só depois da revisão/autorização T15. Estado atual T14 abaixo. R13 em andamento, SG/RDS/S3/DynamoDB efetivos futuros.
Sem bloqueio T13. Commits apenas por marcos reais necessários, um único commit
para o conjunto coerente de preflight/documentação, nunca por quantidade.

Atualização T14 em 28/09/2026: T01–T14 verificadas, início HEAD 4bd94d4/dez
commits reais. Bootstrap infra/backend implementado com backend local,
Terraform=1.16.2/AWS=6.65.0, cinco recursos S3/configs/DynamoDB e lockfile real.
fmt/check/init direct/validate passaram 0; plan detailed-exitcode 2 esperado,
cinco create/zero update/delete; show JSON 0 conferiu região/tags/conta/segurança/
vínculos/outputs. Negativo S3 -an retornou 1; plano válido permaneceu intacto.

Init comum falhou duas vezes inclusive readonly, embora Registry liste versão;
config CLI direct temporária 0600 passou nas duas, mesma versão assinada.
Causa não comprovada; README documenta procedimento, não alterar config global/
versões para esconder erro. Capturas em backend-validate.txt/backend-plan.txt.
S3 [] e DynamoDB ResourceNotFoundException antes/depois do plano; STS mesma conta
privada. Sem apply/recurso criado, nenhuma falha SCP/ObjectLock atual observada.
Tfvars/plano/metadados ignorados/0600; state de recursos ainda ausente. Preserve
variáveis/nomes/plano local para T15; revalidar credenciais/conta e plano antes
de apply. Backend principal não implementado/inicializado, locking ainda T21.
R19/R20/R21 parciais. Próxima T15 revisa recursos/custo e obtém autorização
específica; T16 aplica/conferência. Sem bloqueio T14. Commit único coerente,
merge T32. Não repetir suites API/Docker/Compose porque não mudaram.

Atualização T15, 29/09/2026: revisão técnica/custo preparada, decisão humana
pendente; T15 em andamento/T16 pendente. HEAD inicial d6f4d25, 11 commits, feature
limpa antes da revisão. Plano T14/hash preservados; show JSON 0, STS 0 atual
mesma conta terminada 5811/voclabs/us-east-1, S3 []/0 e tabela NotFound/254.
Nenhum recurso criado/apply. Preços oficiais regionais/cálculo Decimal reais
em backend-revisao.txt, cenário hipotético pequeno ~US$0.01/mês, sem descontar
franquias/créditos ou alegar saldo atual. Código Terraform/versões/lockfile e
capturas T14 preservados; vars/plano 0600/ignorados. Perguntar autorização
específica somente após registros/checks completos, conforme regra 10/T15;
aguardar resposta explícita, não inferir por revisão genérica ou tempo decorrido.
Não marcar T15 verificada antes da decisão. Após aprovação, T16 exige revalidar
credenciais/plano e aplicar/conferir apenas bootstrap. Aprovação não inclui
principal/rede/EC2/RDS/teardown. Sem commit extra de quantidade nesta preparação;
registrar revisão/decisão no próximo marco coerente, sem esconder mudanças.

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

A validação PostgreSQL/HTTP/script/restart/Docker e Compose está disponível até T12;
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
| Persistência Compose T12 | `npm --prefix app run test:persistence`; Python 3/npm/Docker/Compose/BuildKit. Fixture UUID testa prepare/check/cleanup, recria api/db com volume preservado, HTTP/SQL, negativos/checkpoint/sentinela e cleanup. Verificador separado não recria recursos; fases/argumentos no README. Nunca usar down -v. |
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


## Estado atual — T15/T16 verificadas em 29/09/2026

Substitui estado pendente da revisão T15 acima, preservando histórico. Aluno
explicitamente autorizou tudo necessário para bootstrap apresentado, sem
principal/EC2/RDS/rede/deploy/destruição. Não repetir mesma aprovação.
Primeiro apply 1: bucket/tabela criados, Read Object Lock 403/explicit denySCP.
Backup privado preservado; removed/destroy=false+data fez handoff sem apagar.
Três configs/tabela managed; bucket físico/tags externos ao state: reprodução/
remoção CLI revisada/autorizada. Não alterar IAM/SCP/região/provider nem usar
refresh=false/lock=false/target. Validate inicial 1 unsupported em BPA corrigido;
fmt/validate 0, plan 2/três create/forgetsem delete/DDB no-op, apply 0. Oito consultas AWS 0:
Enabled/AES256/BPA4true/tags/us-east-1, ACTIVE/on-demand/LockID String. Verificador
KeyError sensitive corrigido/rechecado 0; plan posterior 0/No changes.
State local 0600/4managednormais+data, backup/plan/tfvars ignorados preservados.
Backend.txt/revisão/diário reais. T01–T16 verificadas, próxima T17. R20/R21
parciais, locking principal T21. Um commit coerente revisão/apply/recuperação,
sem repetir suites API/Docker/Compose inalteradas. Merge T32, sem push/PR automático.
T29/T30: destroy bootstrap não remove bucket externo; versões/delete markers e
bucket próprio precisam limpeza CLI separada autorizada, principal já destruído,
locks conferidos e states necessários preservados.


## Estado atual — T17 local verificada em 29/09/2026

Substitui próxima T17 do registro histórico acima: agora T18. Módulo
infra/modules/vpc conforme D09, seis inputs/três outputs, VPC/DNS/IGW/quatro
subnets/duas route tables/quatro associações, tags. Privadas sem IGW/NAT/default,
IP público false; públicas default IGW/IP true. Vars/preconditions guardam CIDRs
inválidos/externos/sobrepostos, AZs/quantidades/tags. Versões 1.16.2/6.65.0 herdáveis,
sem provider/backend. Root /tmp/cópia exata/lockfile readonly/mirror local,
sem state/credenciais/config AWS. Fmt/init/validate/grafo 0, nove testes mock locais 0
command=plan; duas falhas reais das asserções corrigidas, vpc-validate.txt.
Não apresentar mocks/grafo como plan ou execução AWS. R14/R19/R22 parciais,
plan real composto T21/rede AWS T23 futuros. Não repetir suites API/Docker/Compose/
bootstrap inalteradas, não tocar state/planos/tfvars privados existentes.
Commit único coerente módulo/evidências; feature preservada/merge T32/sem push/PR.
T18 não iniciada.

Revisão final T17: outputs de subnets têm depends_on nas associações de rotas,
para consumidores aguardarem rede pronta. Validate/grafo e nove testes locais
reexecutados após mudança passaram/0; sem API AWS. Capturas finais preservadas.

## Estado atual — T18 local verificada em 29/09/2026

Substitui próxima T18 dos registros históricos: agora T19. Módulo
infra/modules/security-group, quatro .tf/teste, cinco inputs/dois outputs.
Dois SGs na VPC fornecida, sem inline; regras modernas separadas/tagueadas,
SSH22/API3000 somente IPv4 /32 explícitos, RDS5432 somente SG EC2, saída EC25432
só SG RDS e webTCP80/443. Sem saída iniciada RDS; respostas stateful. Resolver
AmazonProvidedDNS não é filtrado por SG; não criar regra 53 nem afirmar DNS
bloqueado por SG. AWS/provider fixado consultados; não é teste cloud.
Outputs aguardam regras; grafo nativo0 confirma 12 vínculos e nenhum ciclo.
Fmt primeiro2 corrigido expressão multilinha no teste, fmt-check/init/validate0,
14 testes locais mock/command=plan0 e schema0. Evidência security-group-validate.txt,
lockfile readonly/mirror/cópia exata/sem state/credenciais; não comprovam AWS.
T01–T18 verificadas em seus ambientes, T19–T34 pendentes; R15/R19/R22 parciais.
Root/plano real T21/aplicação autorizada T23 futuros. Não repetir suites
API/Docker/Compose/bootstrap inalteradas; preservar state/plan/tfvars/cache.
Um commit real/coerente necessário por marco, feature preservada/mergeT32,
sem push/PR automático. Nenhum módulo RDS/EC2 implementado nesta tarefa.

## Estado atual — T19 local verificada em 29/09/2026

Substitui próxima T19 dos registros históricos: agora T20. Módulo infra/modules/rds
com quatro .tf/teste, 11 inputs/3 outputs, dois recursos DB subnet group/instância.
PostgreSQL16.15/db.t3.micro/gp3/20GiB sem autoscale/Single-AZ/encriptado/privado,
um SG RDS, dois inputs de subnets distintos; root T21 deve ligar privadas VPC/SG
RDS e conferir AZ/rotas reais. Username/password sensitive sem default, mas senha
fica no state/plano; outputs identifier/hostname(address sem porta)/port seguros.
Sem IAM/KMS próprios/Secrets Manager/Enhanced Monitoring; políticas Lab explícitas
backup0/delete_automated_backups true/deletion_protection false, skip_final_snapshot
obrigatório + final_snapshot_identifier coerente. São propostas, não aprovação de
descarte/retenção/destroy; rever T22/T27/T28. Versão/opções reais revalidar T21.
Primeiro test1, conflito password/manage_master_user_password=false; omitido este
argumento, sem mudar provider/senha sensível. Fmt/init/validate/grafo/schema0,
17 testes mock/command=plan0, oito referências sem ciclo, cópias/lockfile idênticos;
rds-validate.txt preserva falha/correção. Nenhum serviço RDS real/SQL foi testado.
T01–T19 verificadas nos respectivos ambientes, T20–T34 pendentes; R17/R18/R19/R22
parciais. Sem API AWS/plan principal/backend remoto/apply/destroy; sem bloqueio.
Não repetir suites inalteradas nem tocar state/plan/tfvars/cache/evidências
anteriores; commit único coerente, feature preservada/mergeT32/sem push/PR.

## Estado atual — T20 local verificada em 29/09/2026

Substitui próxima T20 dos registros históricos: agora T21. Módulo infra/modules/ec2
com quatro .tf/user-data.sh/10 runs mock e teste Python3cases, oito inputs/dois
outputs instance_id/public_ip. Um aws_instance/t2.micro, SG EC2 único/subnet pública/
key existente, profile null ou LabInstanceProfile; sem IAM/EIP/key/KMS novos.
AMI explícita AL2023 standard/x86_64/HVM/EBS/raiz<=8GiB deve ser selecionada T21
com conta/us-east-1/compatibilidade, sem inferir por IDs fictícios de fixtures.
IMDSv2 required/hop1, root 8GiB gp3 encriptada/excluída na terminação/tags, CPU standard.
User-data fixo sem input secreto instala Docker/serviço/prepara diretórios
root 0755/root 0700, sem API/Postgres local. Deploy/SQL/CA/ambiente protegido T24.
User_data_replace_on_change=true exige revisar eventual recriação em plano.
Fmt/init/validate/grafo/schema/bash-n0, dez testes mock/plan + três de fluxo/stubs0.
Falha profile unknown corrigida no teste, vínculo source/grafo/schema; falso
positivo auxiliar sobre comentário corrigido, capturas ec2-validate.txt intactas.
Grafo dez vínculos sem ciclo, cópias/lockfile readonly idênticos, sem state/plan/
credenciais. Testes não comprovam boot/Docker/SSH/IMDS/encriptação/API/CRUD AWS.
T01–T20 verificadas nos seus ambientes, T21–T34 pendentes; R13/R16/R19/R22 parciais.
Sem API AWS/backend remoto/plan principal/apply/destroy; sem bloqueio. PróximaT21
compõe root/selecionaAMI/revalida opções/CIDRs/conta/backend/locking/plan real,
sem apply antes T22/T23. Não repetir suites anteriores inalteradas, preservar
state/plan/tfvars/cache/evidências; commit único coerente, feature/mergeT32 futuro,
sem push/PR automático.

## Estado atual — T21 backend/plano/locking verificados em 29/09/2026

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

## Estado atual — T22 revisão pronta, decisão pendente, 29/09/2026

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

## Decisão T22 e início T23 — 29/09/2026

Aluno respondeu explicitamente: “Autorizo que faça tudo que seja necessário para
a conclusão das tarefas propostas, desde que esteja de acordo com o que foi
solicitado”. Resposta à revisão concreta/hash/23criações/conta/região/acessos/custo
apresentados. T22 verificada pela revisão e decisão humana, T23 em andamento.
Retomar plano aprovado sem pedir a mesma autorização. Mudanças de escopo/plano
e destruição exigem revisão concreta conforme regra10; não executar agora.
Autorização não prova execução/recursos/deploy; revalidar antes de apply.

## Estado atual — T22/T23 verificadas em29/09/2026

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

## Estado atual — T24 verificada em 29/09/2026

Substitui próximaT24 da atualização T23; histórico preservado. T01–T24 verificadas,
próximaT25 CRUD/persistência EC2/RDS e verify-aws.py. HEAD inicial4895f98/18commits,
feature limpa/main preservada/zero merges. Deploy-api.py/install-remote.sh/unit/
11testes implementados. Build gitarchive appcommit4895f98/amd64/UID1000;
checksum econfigOCI conferidos após incompatibilidade índiceDocker29/configDocker25.
Primeirodeploy1 corrigido, retry0/repetição0; CRLFtest1 corrigido,11pass0;
consolelatest254 e auxiliares corrigidos, falhas preservadas ec2-deploy.txt.
SSH por EIC existente/chave temporária0600/hostfingerprint comparadaAWSconsole,
sem IAM/keypair/SG novo. Migração na imagem via RDSprivado/TLSv1.3/CA/rejecttrue,
OID16451/4colunas/3constraints/zero registros iguais após repetição/reboot.
Ambiente root0600/dir0700/CA0644, API/Docker enabled/active, sóAPIcontainer.
RebootCLI0/boot_id diferente/mesmaimagem e três healthHTTP200/SQLreal.
R07 verificado; R06/R16/R17/R22/R29 parciais até T25/entrega, não alegarCRUD.
Evidências ec2-deploy.txt/health-aws.txt; app/infra/estados/evidências anteriores
preservados. Sem bloqueio; recursos ativos/faturáveis. Sem apply/destroy/push/
merge/PR; autorização deploy vigente, teardown futuro com revisão própria.
Um commit coerente real, nunca por quantidade; mergeT32 pendente.
