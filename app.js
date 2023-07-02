const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const pdfKit = require('pdfkit');
const cors = require('cors');
const mongoose = require('mongoose');
const conn = require('./db/conn.js');
const colors = require('colors');

require("dotenv").config();
const app = express();

const handlebars = require('handlebars');

handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case '!=':
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case '&&':
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case '||':
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

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
        res.status(500).redirect('https://http.cat/images/500.jpg');
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
    let periodoEstudo = req.body.periodoEstudo;
    let observacao = req.body.observacao;
    let nomeResponsavel = req.body.nomeResponsavel;
    let telefoneResponsavel = req.body.telefoneResponsavel;
    let emailResponsavel = req.body.emailResponsavel;
    let enderecoResponsavel = req.body.enderecoResponsavel;

    const aluno = require('./models/aluno.js');

    try { 
        await aluno.create({nome: nome, data_nascimento: dataNascimento, sexo: sexo, periodoEstudo: periodoEstudo, observacao: observacao, responsavel: {nome: nomeResponsavel, telefone: telefoneResponsavel, email: emailResponsavel, endereco: enderecoResponsavel}});
        console.log('Dados inseridos com sucesso');
        res.render('cadastroAluno');
        
      } catch (error) {
        console.error('Erro ao inserir dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');
      }
});

app.get('/consultaAluno', async (req, res) => {
    const aluno = require('./models/aluno.js');
    
    try {
        let alunos = await aluno.find().lean();
        res.render('./consulta/consultaAluno', {alunos: alunos});
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }
});

app.get('/editarAluno/:id', async (req, res) => {
    const aluno = require('./models/aluno.js');
    let id = req.params.id;
    try {
        let alunoEdit = await aluno.findById(id).lean();
        res.render('./editar/editarAluno', {aluno: alunoEdit});
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }
});

app.post('/editarAluno/:id', async (req, res) => {
    const aluno = require('./models/aluno.js');
    let id = req.params.id;
    let nome = req.body.nome;
    let sexo = req.body.sexo;
    let dataNascimento = req.body.dataNascimento;
    let periodoEstudo = req.body.periodoEstudo;
    let observacao = req.body.observacao;
    let nomeResponsavel = req.body.nomeResponsavel;
    let telefoneResponsavel = req.body.telefoneResponsavel;
    let emailResponsavel = req.body.emailResponsavel;
    let enderecoResponsavel = req.body.enderecoResponsavel;

    try {
        let alunoEdit = await aluno.findById(id);
        alunoEdit.nome = nome;
        alunoEdit.sexo = sexo;
        alunoEdit.data_nascimento = dataNascimento;
        alunoEdit.periodoEstudo = periodoEstudo;
        alunoEdit.observacao = observacao;
        alunoEdit.responsavel.nome = nomeResponsavel;
        alunoEdit.responsavel.telefone = telefoneResponsavel;
        alunoEdit.responsavel.email = emailResponsavel;
        alunoEdit.responsavel.endereco = enderecoResponsavel;
        await alunoEdit.save();
        res.redirect('/consultaAluno');

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }

});


app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`.rainbow.bold.underline);
});

