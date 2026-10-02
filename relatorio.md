# Relatório da prova de DevOps

**Aluno:** Andreyh Rodrigues de Souza — **RA:** 6325231
**IA utilizada:** Codex, como copiloto de especificação, implementação e revisão.
**Ferramentas utilizadas:** Git, Node.js/npm, PostgreSQL, Docker/Compose, Terraform, AWS CLI, Python e navegador para consultas técnicas.

## 1. Jornada das aulas 01–07

Na realização da prova, conectei os conteúdos das aulas 1 a 7 para construir a API de Reservas e preparar sua execução local e na AWS.
O projeto me ajudou a entender como versionamento, containers, infraestrutura como código e inteligência artificial podem fazer parte do mesmo processo.

Os conhecimentos da **aula 1, sobre Git e Docker**, apareceram na organização do repositório e no registro das alterações por meio de Conventional Commits em uma feature branch.
Também apliquei essa aula na criação do Dockerfile da API em Node.js/Express.
Com isso, a aplicação e suas dependências passaram a ter um ambiente de execução definido, facilitando sua reprodução.

A **aula 2, sobre Docker Compose e IA como copiloto**, foi utilizada para integrar a API ao PostgreSQL no ambiente local.
No Compose, configurei os serviços, a rede de comunicação, o volume para persistir os dados e o healthcheck do banco, junto à condição de inicialização da API.
As variáveis de ambiente permitiram separar as configurações do código.
Essa aula também serviu de base para utilizar o Codex como apoio durante o desenvolvimento.

Depois de preparar e testar o ambiente local, passei para a infraestrutura na AWS.
A **aula 3, sobre Terraform e IAM**, apareceu na definição dos recursos em arquivos de infraestrutura como código e no uso dos comandos de inicialização, planejamento e aplicação.
Os conceitos de IAM ajudaram a compreender as permissões necessárias e as limitações do Learner Lab, utilizando as credenciais temporárias e os recursos de acesso existentes, sem criar usuários, grupos ou roles próprios.

A **aula 4, sobre VPC, redes e EC2**, foi aplicada na construção da rede da aplicação, com subnets públicas e privadas em duas zonas de disponibilidade, rotas e acesso à internet.
Também utilizei esses conhecimentos para posicionar a EC2 na subnet pública e configurar os Security Groups, controlando o tráfego permitido até a aplicação e o banco.

A **aula 5, sobre RDS e Remote State**, apareceu em duas partes.
A primeira foi o PostgreSQL no RDS, utilizado pela API na nuvem e mantido em subnets privadas, com acesso pela porta 5432 permitido apenas a partir do Security Group da EC2.
A segunda foi a configuração do estado remoto do Terraform em um bucket S3 com versionamento e criptografia, junto ao DynamoDB para locking.
Aprendi que o state registra a relação entre o código Terraform e os recursos provisionados, e que o locking ajuda a evitar alterações simultâneas conflitantes.

Na **aula 6, sobre módulos Terraform**, encontrei a base para separar a infraestrutura nos módulos de VPC, Security Groups, EC2 e RDS.
Utilizei variáveis de entrada e outputs para conectar esses módulos, por exemplo, passando os IDs das subnets para os recursos que dependiam delas.
Essa organização facilitou a leitura do código e deixou mais claras as responsabilidades de cada parte da infraestrutura.

A **aula 7, sobre decomposição, Harness e Spec-Driven**, foi aplicada desde o planejamento.
Utilizei os requisitos do enunciado para orientar o Codex e dividir o trabalho em etapas menores, com contexto, restrições e critérios de validação.
Isso ajudou a acompanhar o desenvolvimento e a conferir cada parte antes de avançar.

A sequência adotada foi organizar o repositório, desenvolver a API, containerizá-la, validar sua integração com o banco local e então preparar a infraestrutura na AWS.
Na parte do Terraform, preparei o backend antes de configurar seu uso pelo projeto principal.
Essa ordem permitiu verificar primeiro o funcionamento da aplicação e depois sua execução na nuvem, facilitando a identificação de problemas em cada etapa.

## 2. IA e comparação com processo manual

Durante a atividade, utilizei o Codex integrado ao VS Code como copiloto.
Estruturei o prompt inicial com os requisitos da prova e pedi que organizasse o trabalho em requisitos, design e tarefas antes de gerar a solução.
Nos pedidos seguintes, orientei o desenvolvimento de uma tarefa por vez, com implementação, teste, correção, evidência e explicação do resultado.
O Codex ajudou a criar a API, o Dockerfile, o Compose, os módulos Terraform e scripts de verificação, que depois precisaram ser executados e conferidos.

Achei muito interessante aplicar o Spec Driven que aprendi na aula 7.
A partir da especificação dos requisitos, o Codex organizou o trabalho em tasks, cada uma voltada para um tipo de atividade.
Essa divisão facilitou acompanhar o andamento do projeto e entender o que estava sendo desenvolvido em cada etapa.
Foi dessa forma que utilizei o Spec Driven na prática, com tarefas definidas e validações ao longo da execução.

Os testes também ficaram muito mais fáceis com a IA como copiloto, pois ela ajudou a executar as verificações e interpretar os resultados.
No resultado final, não percebi erros visíveis no funcionamento do código; isso não significa que as primeiras versões tenham passado sem correções.
Acredito que a forma como montei o prompt, com requisitos claros e tarefas organizadas, contribuiu para o resultado, embora isso não garanta a ausência de falhas.

Um exemplo concreto de correção foi o teste de persistência: o script inicialmente usou `Path.open(..., opener=...)`, chamada que gerou `TypeError`, e precisou passar a usar `open` da biblioteca padrão.
No deploy, a verificação encontrou um problema de quebra de linha CRLF e uma divergência entre o digest do índice OCI e o digest da configuração da imagem; os testes foram corrigidos e repetidos.
Esses casos mostram onde a IA atrapalhou: o código sugerido parecia plausível, mas exigiu investigação e execução real antes de poder ser aceito.
Na AWS, parte dos problemas teve outra origem, como credenciais temporárias sem acesso e permissões negadas pelo Learner Lab.
Nessas situações, foi necessário verificar a causa, atualizar as credenciais quando cabível e conferir as permissões disponíveis para continuar.

Comparando com o processo manual, o Codex facilitou a criação dos arquivos, a execução dos comandos e principalmente os testes.
Fazer tudo manualmente exigiria mais tempo para escrever, consultar a documentação e investigar os problemas; não fiz uma implementação paralela nem medi essa diferença em horas.
Ainda assim, precisei acompanhar as etapas e analisar os resultados.
Essa experiência me mostrou como uma especificação clara e o trabalho dividido em tasks podem tornar o uso da IA mais organizado e facilitar a validação das entregas.

## 3. Arquitetura, segurança e Learner Lab

Durante a validação, a infraestrutura foi provisionada por módulos Terraform em `us-east-1`: uma VPC com duas subnets públicas e duas privadas, distribuídas entre `us-east-1a` e `us-east-1b`.
As subnets públicas tinham rota para o Internet Gateway; as privadas mantinham apenas a rota local da VPC, sem rota para Internet Gateway ou NAT.
A instância EC2 ficou em uma subnet pública, com IP público, para permitir o acesso controlado por SSH e à API Node.js/Express executada em contêiner.
No Security Group da EC2, as entradas nas portas 22 e 3000 ficaram restritas ao endereço `/32` aprovado para o teste, em vez de abertas a toda a internet.
O PostgreSQL ficou no RDS, associado a um DB subnet group formado pelas duas subnets privadas, com `publicly_accessible = false` e armazenamento criptografado.
Essa posição reduziu a exposição do banco: não havia caminho de entrada direto da internet para o RDS, enquanto a EC2 conseguia alcançá-lo pela rede interna da VPC.
O Security Group do RDS permitia a porta 5432 somente a partir do Security Group da EC2; a comunicação API–banco foi conferida com CRUD real e TLS com certificado validado.
A senha do PostgreSQL era uma credencial própria do banco, mantida fora do código e das evidências versionadas; o acesso ao RDS não dependia de criar um usuário IAM.

O Terraform usou primeiro um backend com bucket S3 versionado, criptografado e sem acesso público, mais uma tabela DynamoDB para bloquear operações simultâneas no state.
Para a EC2, o projeto referenciou `LabInstanceProfile`, já existente no Learner Lab, no atributo `iam_instance_profile` da instância; esse perfil continha a role existente `LabRole`.
O instance profile é o vínculo que entrega a identidade IAM à EC2, enquanto a role define as permissões associadas; nenhum usuário, grupo, role ou profile IAM novo foi criado pelo projeto.
Isso adaptou o exercício de IAM ao ambiente da AWS Academy, que fornece identidades e permissões previamente configuradas e restringe sua administração pelo aluno.

Os comandos Terraform e AWS CLI usaram as credenciais temporárias da sessão local do Learner Lab, incluindo o token de sessão; elas eram distintas do instance profile associado à EC2.
Foi necessário conferir repetidamente a conta e a região `us-east-1` antes dos planos e das aplicações.
Quando uma sessão perdeu acesso, foi necessário renovar as credenciais do Lab e validar novamente as consultas antes de continuar; uma resposta válida do STS, isoladamente, não garantiu permissão para todas as operações.
Outra limitação apareceu no bootstrap: uma SCP negou a leitura da configuração de S3 Object Lock e interrompeu o primeiro `apply`, mesmo após parte dos recursos ter sido criada.
A recuperação foi documentada e feita dentro das permissões disponíveis, sem alterar IAM, SCP, região ou substituir os recursos exigidos apenas para contornar a restrição.
Após validar a API, o banco e o state remoto com evidências reais, a infraestrutura principal e o backend foram removidos nas etapas autorizadas de limpeza.

## 4. Checklist, validação e responsabilidade

Antes de cada `terraform apply`, conferi se o código Terraform correspondia aos requisitos da prova e ao escopo que havia sido autorizado para aquela etapa.
Revisei os arquivos dos módulos, as variáveis, os outputs, as versões fixadas do Terraform e do provider AWS e a ausência de recursos IAM criados para contornar o Learner Lab.
Também verifiquei a conta e a região `us-east-1`, a validade das credenciais temporárias e o endereço `/32` que poderia acessar SSH e a API.
Executei `terraform fmt`, `init` e `validate` e li o `plan` completo, inclusive a quantidade de recursos a criar, alterar ou excluir; essas verificações analisam a configuração e a proposta, mas não provam que a nuvem já está correta.
No plano, confirmei as subnets e rotas, as regras dos Security Groups, o RDS sem acesso público e criptografado, a EC2 com IMDSv2 e disco criptografado e o uso do `LabInstanceProfile` existente.
Revisei ainda o backend S3 com versionamento, criptografia e bloqueio público, o locking em DynamoDB, o custo estimado e a política de backup e snapshot do RDS.
Tratei senha, credenciais, `tfvars`, plano binário e state como dados sensíveis: ficaram fora do Git, e as evidências foram revisadas antes do versionamento.
O bootstrap do backend e a infraestrutura principal tiveram planos e autorizações separados; uma mudança de escopo exigiria nova revisão antes de aplicar.

Depois do `apply`, usei consultas AWS e o state remoto para conferir a VPC, as subnets, os Security Groups, a EC2, o RDS privado e criptografado e os atributos efetivos do backend.
Um novo `terraform plan` sem mudanças confirmou que o estado observado estava alinhado ao código naquele momento, mas a validação também precisou testar a aplicação em funcionamento.
Os testes locais passaram por PostgreSQL real, HTTP, Docker, Compose e persistência; na AWS, a API respondeu às rotas de CRUD e leu e gravou no RDS por TLS com certificado validado.
A reserva que permaneceu após reiniciar o serviço e recriar o contêiner, junto à checagem SQL, ajudou a confirmar que os dados estavam no RDS e não apenas na memória da API.
As falhas reais e as correções foram preservadas nas evidências; depois dos testes, a remoção da infraestrutura e do backend foi autorizada em etapas separadas e conferida por consultas AWS.

Se eu aceitasse o código da IA sem revisar, poderia abrir SSH, API ou banco para endereços indevidos, publicar segredos no Git ou criar recursos diferentes dos pedidos e sujeitos a cobrança.
Também poderia executar um plano destrutivo, perder dados sem snapshot ou confundir um `validate` bem-sucedido com a prova de que a API funciona na EC2 e usa o RDS.
Git me deu histórico, diff e a possibilidade de inspecionar cada mudança; Docker e Compose tornaram a aplicação reproduzível e testável com um banco real antes da nuvem.
Terraform acrescentou um plano explícito das mudanças e a comparação com os recursos efetivos; os módulos separaram VPC, segurança, EC2 e RDS e deixaram suas dependências visíveis.
Essa evolução me permitiu pedir ajuda à IA em tarefas menores, comparar o resultado com os requisitos e exigir testes e evidências antes de aceitar cada etapa.
A responsabilidade pela decisão de aplicar, proteger dados e conferir o resultado continuou sendo humana, mesmo quando a IA ajudou a produzir o código e interpretar os testes.
