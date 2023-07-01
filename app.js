const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const pdfKit = require('pdfkit');
const cors = require('cors');
const mongoose = require('mongoose');
const conn = require('./db/conn.js');

const app = express();
const port = 3000;

app.use(cors());
app.engine('handlebars', engine({ defaultLayout: 'main', partialsDir: __dirname + '/views/partials' }))
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

conn();

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/gerarPDF', (req, res) => {
    res.render('geradorPDF');
});

app.post('/gerarPDF', async (req, res) => {
    let email = req.body.email;
    let nome = req.body.nome;
    let telefone = req.body.telefone;
    let observacao = req.body.observacao;
    let sexo = req.body.sexo;
    if(sexo == "" || sexo == undefined){
        sexo = "Não informado";
    }

    const pdf = require('./models/pdf.js');

    try { 
        await pdf.create({nome, sexo, email, telefone, observacao});
        console.log('Dados inseridos com sucesso');
        res.render('geradorPDF');
        //
      } catch (error) {
        console.error('Erro ao inserir dados:', error);
      }

    
    /*
    //geração do PDF

    const lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea eos, ducimus dicta odio ipsa natus. Aperiam obcaecati provident iusto recusandae, a consectetur ad? Magni reiciendis quam mollitia et, tempora totam.";

    const doc = new pdfKit();

    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.font('Helvetica');
    doc.fontSize(24).text('Informações do Formulário:', { align: 'center' , lineGap: 10});
    doc.fontSize(14).moveDown().text(`Nome: ${name}`, {lineGap: 10});
    doc.fontSize(14).text(`Sexo: ${sexo}`, {lineGap: 10});
    doc.fontSize(14).text(`E-mail: ${email}`, {lineGap: 10});
    doc.fontSize(14).text(`Telefone: ${telefone}`, {lineGap: 10});
    doc.fontSize(14).text(`Observação: ${observacao}`, {lineGap: 10});
    doc.fontSize(14).moveDown().text(`${lorem}`, {lineGap: 10, align: 'justify'});

    doc.end();
    */
});

app.get('/cadastroAluno', (req, res) => {
    res.render('cadastroAluno');
});

app.post('/cadastroAluno', async (req, res) => {
    let nome = req.body.nome;
    let sexo = req.body.sexo;
    let dataNascimento = req.body.dataNascimento;
    let periodo = req.body.periodo;
    let observacao = req.body.observacao;
    let nomeResponsavel = req.body.nomeResponsavel;
    let telefoneResponsavel = req.body.telefoneResponsavel;
    let emailResponsavel = req.body.emailResponsavel;
    let enderecoResponsavel = req.body.enderecoResponsavel;

    const aluno = require('./models/aluno.js');

    try { 
        await aluno.create({nome: nome, data_nascimento: dataNascimento, sexo: sexo, periodoEstudo: periodo, observacao: observacao, responsavel: {nome: nomeResponsavel, telefone: telefoneResponsavel, email: emailResponsavel, endereco: enderecoResponsavel}});
        console.log('Dados inseridos com sucesso');
        res.render('cadastroAluno');
        
      } catch (error) {
        console.error('Erro ao inserir dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');
      }
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

