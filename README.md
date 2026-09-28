# API de Reservas — Prova do Primeiro Bimestre de DevOps

**Aluno:** Andreyh Rodrigues de Souza

**RA:** 6325231

**Data de entrega:** 01/10/2026

Projeto individual de uma API Node.js/Express para criar, listar, consultar,
atualizar e excluir reservas, persistindo em PostgreSQL. A entrega final terá
Docker/Compose local e EC2/RDS no AWS Academy Learner Lab, usando Terraform
modularizado com state S3 e locking DynamoDB, evidências reais e relatório.

A URL configurada no origin local é
`https://github.com/Andreyh117/prova-primeiro-bimestre-devops.git`.
Existência, acesso público e identidade do proprietário do remote ainda não
foram verificados. Nome completo, RA e data de entrega acima foram informados
pelo aluno em 28/09/2026.

## Estado real

Em 28/09/2026, T01–T04 foram concluídas com revisão e validação local. Os dados
do aluno foram preenchidos e T05 está em andamento: commit inicial dos documentos
revisados e criação da feature branch. A aplicação, Dockerfile, Compose,
infraestrutura, scripts de validação e relatório ainda não foram implementados.
Não há build, CRUD, deploy, apply ou destroy comprovado. Após T05, a próxima
tarefa é T06: dependências, schema e conexão com PostgreSQL real de teste.

## Contrato aprovado para implementação

Reserva: `id` gerado pelo PostgreSQL, `cliente`, `data` e `status`.
`cliente`, `data` e `status` são obrigatórios em POST e PUT; PUT substitui todos
os campos editáveis. Status aceitos: `pendente`, `confirmada`, `cancelada`.

A API recebe e devolve `data` como **`DD-MM-YYYY`**, com dia/mês de dois dígitos e
ano de quatro dígitos, sem horário. O banco mantém o tipo `DATE`, com conversão
explícita e validação do calendário. A API rejeitará datas impossíveis e formato
ISO externo; essa validação ainda não está implementada/testada.

```json
{"cliente":"Cliente de teste","data":"15-10-2026","status":"pendente"}
```

Rotas planejadas: POST/GET `/reservas`, GET/PUT/DELETE `/reservas/:id` e GET
`/health`. O healthcheck verificará o banco real, retornando 503 se indisponível.
Contrato completo em [specs/design.md](specs/design.md).

## Documentação e acompanhamento

- [AGENTS.md](AGENTS.md): regras de execução e comandos de validação por etapa.
- [Requisitos](specs/requirements.md): critérios do professor e do aluno, com matriz de aceite.
- [Design](specs/design.md): decisões revisadas, contratos, arquitetura e limpeza.
- [Tarefas](specs/tasks.md): dependências, estado real e próximo passo.
- [Diário de IA](docs/diario-ia.md): prompts, decisões, correções e resultados reais.
- [Evidência T04](evidencias/segredos-checklist.txt): verificação local das proteções Git/documentação.

## Verificação possível nesta etapa

Dependências para estas verificações: Git e Python 3. Os demais comandos em
AGENTS dependem de implementações futuras; não há comando de subir a API ainda.

```bash
git status --short --branch
git ls-files --cached
git check-ignore -v -- .env infra/terraform.tfstate chave.pem infra/infra.tfplan
```

Os caminhos no último comando são consultas de regras, não arquivos de segredo
criados para o teste. `.gitignore` evita inclusão acidental de arquivos locais;
ele não protege arquivos já rastreados, não encripta segredos e não substitui a
revisão antes de cada commit. Exemplos e evidências públicas devem estar sem segredos.

## Configuração prevista

Nenhum valor de credencial foi criado nesta tarefa. `.env.example` será preparado
na tarefa Compose, com placeholders, e `.env` permanecerá ignorado. Nomes de
variáveis previstos, em acordo com o design:

| Variável | Finalidade futura |
|---|---|
| `PORT` | Porta HTTP da API (3000). |
| `PGHOST`, `PGPORT` | Host/porta do PostgreSQL local ou RDS. |
| `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Banco e autenticação; senha só em ambiente local protegido. |
| `PGSSL`, `PGSSLROOTCERT` | TLS e CA oficial ao conectar ao RDS. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Inicialização do PostgreSQL no Compose local. |

Node 24, PostgreSQL 16 e Terraform 1.16.2 são as escolhas registradas no design;
a disponibilidade das imagens, engine RDS e versões compatíveis será validada nas
tarefas correspondentes. AWS: somente Learner Lab, `us-east-1`, credenciais
temporárias com token e LabRole/LabInstanceProfile existentes, sem IAM próprio.

## AWS e entrega

Provisionamento e destruição exigem plano revisado e autorização específica.
RDS privado/encriptado é o banco real da API na EC2; a limpeza principal acontece
antes da limpeza do backend. Não há execução AWS nesta etapa.

A submissão da disciplina ficará somente em
`entregas/provaPrimeiroBi/6325231/entrega.md` no fork separado. A data de entrega
informada é 01/10/2026. Um único PR deve ser
aberto presencialmente no dia confirmado da prova, sem commits posteriores no PR.
O relatório será escrito com base no diário e na experiência real do aluno.
