# Projeto Node.js Express

Este repositório contém um projeto Node.js Express que utiliza várias bibliotecas e tecnologias para criar um aplicativo web. O objetivo principal deste projeto é realizar o cadastro de alunos e seus responsáveis em uma plataforma unificada, também é possivel realizar o controle de usuários cadastrados através de um painél administrativo.<br>
*(Por enquanto, o site está otimizado para **Desktop**. Mobile algumas páginas estão de dificil preenchimento/consulta)*

## Tecnologias utilizadas

### Back-end

- Node.js
- Express.js
- Handlebars
- MongoDB
- Mongoose
- bcrypt
- jsonwebtoken
- pdfkit
- cors

### Front-end

- Bootstrap 5
- Font Awesome
- SweetAlert2
- Vanilla Masker
- Typed.js
- tsParticles

## Configuração do ambiente

Certifique-se de ter o Node.js e o MongoDB instalados em seu sistema antes de prosseguir.

1. Clone este repositório para o seu ambiente local utilizando o comando: `git clone [URL do repositório]`.
2. Instale as dependências do projeto utilizando o comando: `npm install`.
3. Renomeie o arquivo `.env.example` para `.env`.
4. Abra o arquivo `.env` e defina as seguintes variáveis de ambiente:

```env
    SECRET=[sua_chave_secreta]
    PORT=[porta_do_servidor]
    CONNECTION_STRING=[sua_string_de_conexão_do_MongoDB]
```

5. Inicie o servidor utilizando o comando: `npm start`.

## Scripts disponíveis

Você pode executar os seguintes scripts disponíveis no projeto:

- `npm run dev`: Inicia o servidor em modo de desenvolvimento utilizando o Nodemon. O servidor será reiniciado automaticamente sempre que houver alterações nos arquivos com as extensões `.js`, `.hbs`, `.handlebars`, `.css`, `.json` ou `.html`.

## Funcionalidades

Aqui estão algumas das principais funcionalidades do projeto:

- Roteamento de páginas usando o Express.js.
- Renderização de templates com Handlebars.
- Autenticação de usuários utilizando JWT e bcrypt.
- Manipulação de cookies com o cookie-parser.
- Conexão com o banco de dados MongoDB usando o Mongoose.
- Geração de PDFs utilizando a biblioteca pdfkit.

## Uso

Após iniciar o servidor, você poderá acessar o aplicativo em seu navegador usando o seguinte endereço: `http://localhost:[porta_do_servidor]`.

Certifique-se de ter um ambiente MongoDB em execução e atualize a variável `CONNECTION_STRING` no arquivo `.env` com a string de conexão correta.

## Desenvolvimento com Codespace e Container Node.js

Este projeto está sendo desenvolvido utilizando o Codespace, uma funcionalidade do GitHub que permite o desenvolvimento diretamente no navegador com um ambiente configurado. Além disso, está sendo utilizado um container Node.js para fornecer um ambiente consistente e isolado.

Ao utilizar o Codespace e o container Node.js, você terá acesso a um ambiente de desenvolvimento pré-configurado com todas as dependências necessárias já instaladas, facilitando o processo de contribuição e desenvolvimento.

Para iniciar o ambiente de desenvolvimento, siga as instruções do Codespace no repositório. Certifique-se de ter uma conexão estável com a internet para aproveitar todas as funcionalidades oferecidas pelo Codespace.

## Contribuição

Se você deseja contribuir para este projeto, siga as etapas abaixo:

1. Faça um fork deste repositório e clone-o em seu ambiente local.
2. Crie um novo branch para suas alterações: `git checkout -b minha-branch`.
3. Faça as alterações desejadas e adicione-as ao commit: `git add .`.
4. Realize o commit das alterações: `git commit -m "Descrição das alterações"`.
5. Envie as alterações para o seu fork: `git push origin minha-branch`.
6. Abra um pull request neste repositório, descrevendo suas alterações e as motivações por trás delas.

## Licença

Este projeto está licenciado sob a MIT License. Consulte o arquivo `LICENSE` para obter mais informações.

## Contato

Se você tiver alguma pergunta ou sugestão em relação a este projeto, sinta-se à vontade para entrar em contato através do meu discord: `bagreassalariado`

## Checklist -> To-Do

Melhorias planejadas para o projeto:

- Melhorar a interface de usuário (UI/UX)
- ~~Melhorar as rotas e organizar o código~~ **_MAYBE OK_**
- ~~Adicionar validação de formulários do lado do cliente e do servidor~~ **_OK_**
- Adicionar testes automatizados para garantir a qualidade do código
- ~~Melhorar a segurança da aplicação (por exemplo, adicionando proteção contra ataques de injeção de SQL ou XSS)~~ **_MAYBE OK_**
- Adicionar recursos de notificação por e-mail
- Implementar um sistema de busca avançada
