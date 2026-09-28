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

Em 28/09/2026, T01–T08 foram concluídas. O commit inicial `21cb5f0` está em
`main` e o desenvolvimento segue em `feat/api-reservas`. CRUD completo e /health
estão implementados sobre o schema/pool de T06. A suíte passou 48 testes com
PostgreSQL 16.15 real: 27 HTTP em servidor nativo, 3 HTTP de indisponibilidade,
15 de banco e 3 de configuração. PUT preservou o ID; entradas rejeitadas não
alteraram dados; DELETE retornou 204 e depois 404. Health retornou 200/503
conforme o banco, recuperou 200 após unpause; as cinco rotas CRUD retornaram 503
após stop. API encerrada e banco exclusivo removido ao finalizar.

Express 5.2.1 e pg 8.23.0 estão fixados no package.json/lockfile. A imagem oficial
PostgreSQL foi fixada por digest em `app/test/postgres-image.txt`. Os seis commits
e merge da prova, Dockerfile/Compose da API, infraestrutura AWS e relatório
continuam pendentes. Próxima tarefa: T09, script de CRUD e persistência após restart da API.

## Contrato aprovado para implementação

Reserva: `id` gerado pelo PostgreSQL, `cliente`, `data` e `status`.
`cliente`, `data` e `status` são obrigatórios em POST e PUT; PUT substitui todos
os campos editáveis. Status aceitos: `pendente`, `confirmada`, `cancelada`.

POST e PUT recebem `data` como **`DD-MM-YYYY`**, com dia/mês de dois dígitos
e ano de quatro dígitos, sem horário. POST, PUT e GET devolvem esse mesmo formato.
O banco mantém `DATE`; a aplicação converte por componentes para ISO interno e
formata explicitamente por SQL. Datas válidas/bissextas foram confirmadas;
datas impossíveis, ISO externo, tipos incorretos e espaços foram rejeitados.
Cliente é texto Unicode válido, sem NUL, de 1 a 120 caracteres após trim.
O corpo deve conter exatamente cliente, data e status; PUT parcial retorna 400.

```json
{"cliente":"Cliente de teste","data":"15-10-2026","status":"pendente"}
```

Rotas disponíveis: POST/GET `/reservas`, GET/PUT/DELETE `/reservas/:id` e GET
`/health`. POST retorna 201/Location; GET retorna 200 (lista ordenada por ID);
PUT completo retorna 200 mantendo ID; DELETE retorna 204 sem corpo. ID ausente
retorna 404. Entrada inválida retorna 400, corpo acima de 16 KiB retorna 413 e
Content-Type inadequado retorna 415, com erro JSON. Falha de conexão retorna
503 BANCO_INDISPONIVEL; erro inesperado retorna 500 genérico. /health consulta
SELECT 1 com prazo de 2s e retorna 200 ou 503, somente com status/database.
Contrato completo em [specs/design.md](specs/design.md).

## Documentação e acompanhamento

- [AGENTS.md](AGENTS.md): regras de execução e comandos de validação por etapa.
- [Requisitos](specs/requirements.md): critérios do professor e do aluno, com matriz de aceite.
- [Design](specs/design.md): decisões revisadas, contratos, arquitetura e limpeza.
- [Tarefas](specs/tasks.md): dependências, estado real e próximo passo.
- [Diário de IA](docs/diario-ia.md): prompts, decisões, correções e resultados reais.
- [Evidência T04](evidencias/segredos-checklist.txt): verificação local das proteções Git/documentação.
- [Evidência T05](evidencias/git-workflow-inicial.txt): commit inicial e criação da feature branch, com saídas reais.
- [Dependências T06](evidencias/t06-dependencias.txt): instalação, npm ci e versões reais.
- [PostgreSQL T06](evidencias/t06-postgres-local.txt): migração e 18 testes com banco real.
- [Falha controlada T06](evidencias/t06-falha-controlada.txt): código não zero e limpeza confirmada.
- [HTTP e PostgreSQL local](evidencias/api-local.txt): duas execuções T07 com 35 testes e T08 com 48 testes, sem apagar histórico.
- [Saúde T08](evidencias/health-local.txt): pause/unpause/stop reais do banco exclusivo, respostas HTTP e limpeza.
- [Execução T07](evidencias/t07-execucao.txt): falhas esperadas de npm start e limpeza.
- [Auditoria Git](evidencias/git-auditoria.txt): snapshot anterior a T08 em dbcd6a1, com 4 commits reais/convencionais, feature comprovada e merge pendente; próximos marcos em specs/tasks.md.

## Executar os testes disponíveis

Dependências: Node 24, npm e Docker local com daemon acessível. Execute na raiz:

```bash
npm --prefix app ci --ignore-scripts --no-fund
npm --prefix app test
```

O runner cria seu container PostgreSQL, publica porta dinâmica em 127.0.0.1,
gera senha em memória, aplica o schema e roda `node:test`. A suíte HTTP inicia
a API nativa em porta livre e verifica requisições/SQL; limpa somente seus IDs
e encerra a API. A última suíte confere UUID/labels/porta do banco e o pausa,
retoma e encerra para verificar 503 real. Ao terminar, o runner confirma remoção
do container/dados tmpfs; se ainda estiver pausado na falha, retoma antes da limpeza.
A primeira execução pode baixar a imagem fixada por digest. Não é necessário
criar .env ou informar senha para essa suíte. Falhas resultam em exit code não zero.

O schema está em [app/sql/001-reservas.sql](app/sql/001-reservas.sql), o pool em
[app/src/db.js](app/src/db.js), e os testes reais em
[app/test/database.test.js](app/test/database.test.js) e
[app/test/api.test.js](app/test/api.test.js); indisponibilidade real em
[app/test/z-unavailable.test.js](app/test/z-unavailable.test.js).
Rotas em [app/src/app.js](app/src/app.js),
validação em [app/src/validation.js](app/src/validation.js) e inicialização em
[app/src/server.js](app/src/server.js). O SQL inicial pode ser reaplicado sem
apagar linhas; mudanças de estrutura exigirão novas migrações.

Para aplicar o schema em um banco já configurado para a tarefa, com as variáveis
PG* disponíveis no ambiente, execute `npm --prefix app run db:migrate`.
PGHOST, PGDATABASE, PGUSER, PGPASSWORD e PGSSL são obrigatórios; PGPORT assume
5432 se omitido. `PGSSL=true` exige PGSSLROOTCERT com a CA. A configuração TLS
foi testada; handshake e conexão com RDS só serão validados na etapa AWS.

Para executar a API nativa em banco próprio já configurado/migrado:

```bash
npm --prefix app start
```

O comando usa PG* do ambiente e PORT (padrão 3000), escutando em 0.0.0.0.
Não carrega .env automaticamente. Com configuração incompleta, encerra com
código 1 e mensagem sem credenciais. Com API em execução, pode conferir a lista:

```bash
curl --fail --silent --show-error http://127.0.0.1:3000/reservas
curl --fail --silent --show-error http://127.0.0.1:3000/health
```

`git status --short --branch` permite conferir o trabalho local. `.gitignore`
evita inclusão acidental de arquivos locais, mas não protege arquivos já
rastreados nem substitui a revisão antes de cada commit. Exemplos e evidências
públicas devem permanecer sem segredos.

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

Node 24.21.0, Express 5.2.1, pg 8.23.0 e PostgreSQL 16.15 foram validados
localmente em T06. A versão minor disponível no RDS e a compatibilidade do
Terraform/provider serão conferidas nas respectivas tarefas. AWS: somente Learner Lab, `us-east-1`, credenciais
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
