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

app.get('/ajuda', (req, res) => {
    res.render('ajuda');
});

app.post('/relatorio/aluno/:id', async (req, res) => {
    const aluno = require('./models/aluno.js');
    let id = req.params.id;
    try {
        let alunos = await aluno.findById(id).lean();
        
        //geração do PDF
        const doc = new pdfKit({ size: 'A4', margin: 50});
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        doc.font('Helvetica');
        doc.fontSize(24).text('Informações do Formulário:', { align: 'center' , lineGap: 10});
        doc.fontSize(18).moveDown().text(`Dados do aluno`, {lineGap: 10});
        doc.fontSize(14).text(`Nome: ${alunos.nome}`, {lineGap: 10});
        doc.fontSize(14).text(`Sexo: ${alunos.sexo}`, {lineGap: 10});
        doc.fontSize(14).text(`Data de nascimento: ${alunos.data_nascimento}`, {lineGap: 10});
        doc.fontSize(14).text(`Periodo em que estuda: ${alunos.periodoEstudo}`, {lineGap: 10});
        doc.fontSize(14).text(`Observação: ${alunos.observacao}`, {lineGap: 10});
        doc.fontSize(18).moveDown().text(`Dados do responsável`, {lineGap: 10});
        doc.fontSize(14).text(`Nome: ${alunos.responsavel.nome}`, {lineGap: 10});
        doc.fontSize(14).text(`Telefone: ${alunos.responsavel.telefone}`, {lineGap: 10});
        doc.fontSize(14).text(`Email: ${alunos.responsavel.email}`, {lineGap: 10});
        doc.fontSize(14).text(`Endereço: ${alunos.responsavel.endereco}`, {lineGap: 10});
        doc.fontSize(14).text(`Ativo: ${alunos.ativo}`, {lineGap: 10});
        
        doc.end();

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }
});


app.post('/deletarAluno/:id', async (req, res) => {
    const aluno = require('./models/aluno.js');
    let id = req.params.id;
    try {
        await aluno.findByIdAndDelete(id);
        res.redirect('/consultaAluno');
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }
});

app.get('/listarAluno/:id', async (req, res) => {
    const aluno = require('./models/aluno.js');
    let id = req.params.id;
    let dataEdicao = await aluno.findById(id).select('updatedAt').lean();
    let alunoData = await aluno.findById(id).select('observacao').lean();
    let observacao = alunoData.observacao ? alunoData.observacao.trim() : '';

    dataEdicao = dataEdicao.updatedAt.toLocaleString('pt-BR');
    try {
        let alunos = await aluno.findById(id).lean();
        res.render('./listar/listarAluno', {alunos, dataEdicao, observacao});
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');    
    }
});

app.get('/cadastroAluno', (req, res) => {
    res.render('cadastroAluno');
});

app.post('/cadastroAluno', async (req, res) => {
    let nome = req.body.nome;
    let sexo = req.body.sexo;
    let dataNascimento = req.body.dataNascimento;
    let periodoEstudo = req.body.periodoEstudo;
    let observacao = req.body.observacoes;
    let nomeResponsavel = req.body.nomeResponsavel;
    let telefoneResponsavel = req.body.telefoneResponsavel;
    let emailResponsavel = req.body.emailResponsavel;
    let enderecoResponsavel = req.body.enderecoResponsavel;
    let ativo = req.body.ativo;

    if(ativo == 'on') {
      ativo = true;
    } else {
      ativo = false;
    }

    const aluno = require('./models/aluno.js');

    try { 
        await aluno.create({nome: nome, data_nascimento: dataNascimento, sexo: sexo, periodoEstudo: periodoEstudo, observacao: observacao, responsavel: {nome: nomeResponsavel, telefone: telefoneResponsavel, email: emailResponsavel, endereco: enderecoResponsavel, ativo: ativo}});
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
        let observacao = alunoEdit.observacao ? alunoEdit.observacao.trim() : '';
        res.render('./editar/editarAluno', {aluno: alunoEdit, observacao});
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
    let observacao = req.body.observacoes;
    observacao = observacao.trim();
    let nomeResponsavel = req.body.nomeResponsavel;
    let telefoneResponsavel = req.body.telefoneResponsavel;
    let emailResponsavel = req.body.emailResponsavel;
    let enderecoResponsavel = req.body.enderecoResponsavel;
    let ativo = req.body.ativo;

    if(ativo == 'on') {
        ativo = true;
    } else {
        ativo = false;
    }

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
        alunoEdit.ativo = ativo;
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

