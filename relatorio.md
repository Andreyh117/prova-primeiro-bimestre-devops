# Relatório da prova de DevOps

**Aluno:** Andreyh Rodrigues de Souza — **RA:** 6325231
**IA utilizada:** Codex, como copiloto de especificação, implementação e revisão.
**Ferramentas utilizadas:** Git, Node.js/npm, PostgreSQL, Docker/Compose, Terraform, AWS CLI, Python e navegador para consultas técnicas.
**Estado:** parte factual conferida; contribuição e revisão pessoal do aluno pendentes em T30A, antes da entrega.

## 1. Jornada das aulas 01–07

O projeto começou pela leitura do enunciado e do método da aula 07, antes de escrever a aplicação.
Os requisitos, o design e as tarefas separaram exigências da prova de escolhas de implementação.
Após a revisão do aluno, a API passou a receber e devolver datas DD-MM-YYYY, guardadas como `DATE` no PostgreSQL.
O schema e a conexão parametrizada foram validados com um banco PostgreSQL real.
As rotas Express implementaram criação, listagem, consulta por ID, atualização e exclusão de reservas.
Os testes conferiram respostas HTTP e registros SQL, inclusive datas inválidas e erros de entrada.
A imagem Docker fixou dependências e executou a API com usuário sem privilégios.
O Compose integrou API e banco com verificação de saúde e um volume persistente.
Um teste recriou os contêineres e confirmou que a reserva continuou no mesmo volume.
O Terraform preparou S3 e DynamoDB antes da rede, da EC2 e do RDS; depois, o deploy e o CRUD na AWS foram comprovados.

**Contribuição pessoal pendente:** registrar o aprendizado e as dificuldades reais do aluno nas aulas 01–07.

## 2. IA e comparação com processo manual

O Codex foi orientado a trabalhar uma tarefa por vez, com implementação, teste, correção e evidência.
O aluno revisou as especificações e decidiu alterar o formato público de data para DD-MM-YYYY.
O diário registra prompts relevantes, comandos, saídas e correções, permitindo conferir as sugestões da IA.
Os testes reais impediram que código apenas gerado fosse tratado como solução validada.
Na T24, foi preciso corrigir uma falha de quebra de linha CRLF no deploy.
A mesma etapa registrou uma incompatibilidade de digest de imagem Docker, sem apagar o resultado anterior.
Na T25, uma resposta STS válida não impediu que uma credencial cancelada bloqueasse a consulta EC2.
Depois da renovação, foi necessário iniciar a EC2 parada e atualizar os outputs de IP e URL no state.
Sem IA, a solução exigiria ler requisitos, desenhar arquitetura, programar, testar e interpretar falhas manualmente.
Essa comparação não afirma que houve outra implementação manual nem inventa uma medição de tempo.

**Contribuição pessoal pendente:** registrar como a IA afetou a compreensão do aluno e o que ele faria sem ela.

## 3. Arquitetura, segurança e Learner Lab

A API Node.js/Express roda em contêiner na EC2 e usa PostgreSQL no RDS privado.
O banco da nuvem não foi substituído por um PostgreSQL em contêiner na EC2.
A rede usa sub-redes públicas e privadas distribuídas em duas zonas de disponibilidade.
O grupo de segurança do RDS aceita a porta 5432 a partir do grupo da EC2.
SSH e porta 3000 foram restringidos ao IP /32 indicado pelo aluno.
O RDS foi verificado como privado e encriptado, e o CRUD usou conexão TLS com certificado validado.
A aplicação usa usuário sem privilégios e configuração de ambiente protegida, sem senhas nas evidências Git.
O state principal usa S3 versionado e encriptado, com bloqueio público e locking em DynamoDB.
O Learner Lab forneceu `LabRole` e `LabInstanceProfile`, sem criação de identidades IAM para contornar limites.
Uma restrição SCP bloqueou a leitura de Object Lock no bootstrap; a recuperação e o limite ficaram documentados.

## 4. Checklist, validação e responsabilidade

Antes de cada `apply`, foram revisados conta, região, plano, acessos, recursos e custo estimado.
As aplicações seguiram os escopos apresentados e autorizados pelo aluno.
`terraform fmt`, `validate` e `plan` verificaram código e proposta, mas não substituíram a execução na AWS.
Os testes locais cobriram PostgreSQL, HTTP, Docker, Compose e persistência do volume.
As consultas AWS verificaram recursos, backend remoto, deploy, saúde da API e acesso ao RDS privado.
A T25 executou seis rotas com leitura e escrita SQL por TLS no RDS.
Uma reserva persistiu após reiniciar apenas o serviço da API e criar outro contêiner da mesma imagem.
O teste negativo detectou divergência deliberada no SQL, retornou erro e limpou somente seu registro.
Uma reserva sentinela distinta foi preservada durante o teste e removida separadamente ao final.
Os recursos AWS ainda estão ativos; destroy, revisão final, merge e PR presencial pertencem às próximas tarefas.

**Revisão pessoal pendente:** confirmar a descrição e acrescentar a visão do aluno sobre validação e responsabilidade.
