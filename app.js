const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const pdfKit = require('pdfkit');
const cors = require('cors');
const mongoose = require('mongoose');
const conn = require('./db/conn');
const colors = require('colors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config();

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
app.use(cookieParser());

conn(); //faz a conexão com o banco de dados

function checkToken(req, res, next) {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(401).redirect('https://http.cat/images/401.jpg');
  }

  try {
    const secret = process.env.SECRET;
    const decodedToken = jwt.verify(token, secret);
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    console.error('Erro ao verificar token: ', error);
    return res.status(400).redirect('https://http.cat/images/400.jpg');
  }
}

async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).lean();

    if (user) {
      if (user.tipoUsuario === 'administrador') {
        next();
      } else {
        console.error('Você não possui os privilégios necessários');
        res.status(401).redirect('https://http.cat/images/401.jpg');
      }
    } else {
      console.error('Usuário não encontrado');
      res.status(404).redirect('https://http.cat/images/404.jpg');
    }
  } catch (error) {
    console.error('Erro ao verificar privilégios do usuário:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }

}

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/home', checkToken, async (req, res) => {

  try {
    const user = await User.findById(req.userId).lean();
    const alunos = require('./models/Aluno.js');
    const allAlunos = await alunos.find().lean();
    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    if (tipoUsuario == 'administrador') {
      res.render('home', { nome, layout: 'admin', allAlunos });
    }

    if (tipoUsuario != 'administrador') {
      res.render('home', { nome, layout: 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/login', (req, res) => {
  res.render('login/login', { layout: 'login' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).send('<script>alert("Email não informado"); window.location.href = "/login";</script>');
  }

  if (!password) {
    return res.status(422).send('<script>alert("Senha não informada"); window.location.href = "/login";</script>');
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).send('<script>alert("Email não encontrado"); window.location.href = "/login";</script>');
  }

  const checkPassword = await bcrypt.compare(password, user.senha);

  if (!checkPassword) {
    return res.status(404).send('<script>alert("Senha incorreta"); window.location.href = "/login";</script>');
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign({ id: user._id }, secret);

    res.cookie('auth-token', token, { httpOnly: true, expires: new Date(Date.now() + 1800000) });
    res.redirect('/home');

  } catch (error) {
    console.error('Erro ao gerar token: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('login/register', { layout: 'login' });
});

app.post('/register', async (req, res) => {
  const { nome, email, password, password2 } = req.body;

  if (!nome) {
    return res.status(422).send('<script>alert("Nome não informado"); window.location.href = "/login";</script>');
  }

  if (!email) {
    return res.status(422).send('<script>alert("Email não informado"); window.location.href = "/login";</script>');
  }

  if (!password) {
    return res.status(422).send('<script>alert("Senha não informada"); window.location.href = "/login";</script>');
  }

  if (password !== password2) {
    return res.status(422).send('<script>alert("Senhas não conferem"); window.location.href = "/login";</script>');
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).send('<script>alert("Email já cadastrado"); window.location.href = "/login";</script>');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    nome: nome,
    email: email,
    senha: passwordHash,
    tipoUsuario: 'comum',
  });

  try {
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/ajuda', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajuda', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/ajuda/ajudaCadastroAluno', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    
    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaCadastroAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/ajuda/ajudaConsultaAluno', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaConsultaAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main'});
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/ajuda/ajudaAulas', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaAulas', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/relatorio/aluno/:id', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  let id = req.params.id;
  try {
    let alunos = await aluno.findById(id).lean();

    //geração do PDF
    const doc = new pdfKit({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.font('Helvetica');
    doc.fontSize(24).text('Informações do Formulário:', { align: 'center', lineGap: 10 });
    doc.fontSize(18).moveDown().text(`Dados do aluno`, { lineGap: 10 });
    doc.fontSize(14).text(`Nome: ${alunos.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Sexo: ${alunos.sexo}`, { lineGap: 10 });
    doc.fontSize(14).text(`Data de nascimento: ${alunos.data_nascimento}`, { lineGap: 10 });
    doc.fontSize(14).text(`Periodo em que estuda: ${alunos.periodoEstudo}`, { lineGap: 10 });
    doc.fontSize(14).text(`Turma: ${alunos.turma.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Observação: ${alunos.observacao == "" ? "Não informado" : alunos.observacao}`, { lineGap: 10 });
    doc.fontSize(18).moveDown().text(`Dados do responsável`, { lineGap: 10 });
    doc.fontSize(14).text(`Nome: ${alunos.responsavel.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Telefone: ${alunos.responsavel.telefone}`, { lineGap: 10 });
    doc.fontSize(14).text(`Email: ${alunos.responsavel.email}`, { lineGap: 10 });
    doc.fontSize(14).text(`Endereço: ${alunos.responsavel.endereco}`, { lineGap: 10 });
    doc.fontSize(14).text(`Ativo: ${alunos.ativo}`, { lineGap: 10 });

    doc.end();

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/deletarAluno/:id', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  let id = req.params.id;
  try {
    await aluno.findByIdAndDelete(id);
    res.redirect('/consultaAluno');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/listarAluno/:id', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  let id = req.params.id;
  let dataEdicao = await aluno.findById(id).select('updatedAt').lean();
  let alunoData = await aluno.findById(id).select('observacao').lean();
  let observacao = alunoData.observacao ? alunoData.observacao.trim() : '';

  dataEdicao = dataEdicao.updatedAt.toLocaleString('pt-BR');
  try {
    let alunos = await aluno.findById(id).lean();
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    if (tipoUsuario == 'administrador') {
      res.render('./listar/listarAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', alunos, dataEdicao, observacao });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/cadastroAluno', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    const turma = require('./models/Turma.js');

    let turmas = await turma.find().lean();
    let tipoUsuario = user.tipoUsuario;
    
    if (tipoUsuario == 'administrador') {
      res.render('cadastroAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' , turmas});
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/cadastroAluno', checkToken, async (req, res) => {
  let nome = req.body.nome;
  let sexo = req.body.sexo;
  let dataNascimento = req.body.dataNascimento;
  let periodoEstudo = req.body.periodoEstudo;
  let serieEstuda = req.body.turma;
  let observacao = req.body.observacoes;
  let nomeResponsavel = req.body.nomeResponsavel;
  let telefoneResponsavel = req.body.telefoneResponsavel;
  let emailResponsavel = req.body.emailResponsavel;
  let enderecoResponsavel = req.body.enderecoResponsavel;
  let ativo = req.body.ativo;

  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }

  const aluno = require('./models/Aluno.js');
  const turma = require('./models/Turma.js');

  try {
    serieEstuda = serieEstuda.trim();
    let seriePartes = serieEstuda.split(' - ');
    let SerieprimeiraParte = seriePartes[0];
    let SeriesegundaParte = seriePartes[1];


    let dadosTurma = await turma.findOne({nome: SerieprimeiraParte, periodo: SeriesegundaParte}).lean();
    
    console.group('Dados do aluno: ', serieEstuda, dadosTurma);

    if (!nome || !sexo || !dataNascimento || !periodoEstudo || !nomeResponsavel || !enderecoResponsavel || !periodoEstudo) {
      console.log("Preencha os campos obrigatórios");
    } else {
  
      await aluno.create({ nome: nome, data_nascimento: dataNascimento, sexo: sexo, periodoEstudo: periodoEstudo, observacao: observacao, responsavel: { nome: nomeResponsavel, telefone: telefoneResponsavel, email: emailResponsavel, endereco: enderecoResponsavel, ativo: ativo}, turma: {id: dadosTurma._id, nome: dadosTurma.nome + " " + dadosTurma.periodo} });

      console.log('Dados do aluno inseridos com sucesso');
      res.render('cadastroAluno', { layout: 'admin' });
    }
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/consultaAluno', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  const user = require('./models/User.js');

  try {
    let alunos = await aluno.find().sort({ ativo: -1 }).lean();
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    if (tipoUsuario == 'administrador') {
      res.render('./consulta/consultaAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', alunos: alunos });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/editarAluno/:id', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  const turma = require('./models/Turma.js');
  let id = req.params.id;
  try {
    let alunoEdit = await aluno.findById(id).lean();
    let turmas = await turma.find().lean();
    let observacao = alunoEdit.observacao ? alunoEdit.observacao.trim() : '';
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    if (tipoUsuario == 'administrador') {
      res.render('./editar/editarAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', aluno: alunoEdit, observacao, turmas});
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/editarAluno/:id', checkToken, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  const turma = require('./models/Turma.js');
  let id = req.params.id;
  let nome = req.body.nome;
  let sexo = req.body.sexo;
  let dataNascimento = req.body.dataNascimento;
  let periodoEstudo = req.body.periodoEstudo;
  let observacao = req.body.observacoes;
  let turmaEstuda = req.body.turma;
  observacao = observacao.trim();

  let nomeResponsavel = req.body.nomeResponsavel;
  let telefoneResponsavel = req.body.telefoneResponsavel;
  let emailResponsavel = req.body.emailResponsavel;
  let enderecoResponsavel = req.body.enderecoResponsavel;
  let ativo = req.body.ativo;

  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }

  try {
    let seriePartes = turmaEstuda.split(' - ');
    let SerieprimeiraParte = seriePartes[0];
    let SeriesegundaParte = seriePartes[1];
    let achaTurma = await turma.findOne({nome: SerieprimeiraParte, periodo: SeriesegundaParte}).lean();

    let alunoEdit = await aluno.findById(id);
    alunoEdit.nome = nome;
    alunoEdit.sexo = sexo;
    alunoEdit.data_nascimento = dataNascimento;
    alunoEdit.periodoEstudo = periodoEstudo;
    alunoEdit.turma.id = achaTurma._id;
    alunoEdit.turma.nome = achaTurma.nome + " " + achaTurma.periodo;
    alunoEdit.observacao = observacao;
    alunoEdit.responsavel.nome = nomeResponsavel;
    alunoEdit.responsavel.telefone = telefoneResponsavel;
    alunoEdit.responsavel.email = emailResponsavel;
    alunoEdit.responsavel.endereco = enderecoResponsavel;
    alunoEdit.ativo = ativo;
    await alunoEdit.save();

    console.log('Dados do aluno atualizados com sucesso');
    res.redirect('/consultaAluno');

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/controlaUsuario', checkToken, isAdmin, async (req, res) => {

  const usuario = require('./models/User.js');
  const usuarioAtualID = req.userId;
  try {

    let usuarios = await usuario.find({ _id: { $ne: usuarioAtualID } })
      .select('-senha -__v -createdAt -updatedAt')
      .lean();
    res.render('controlaUsuario', { layout: 'admin', usuarios: usuarios })
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/perfil', checkToken, async (req, res) => {

  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    let usuario = require('./models/User.js');
    usuario = await usuario.findById(req.userId).select('-senha -__v -createdAt -updatedAt').lean();

    res.render('meuPerfil', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', usuario: usuario });
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }

});

app.post('/deletarUsuario/:id', checkToken, isAdmin, async (req, res) => {
  const usuario = require('./models/User.js');
  let id = req.params.id;
  try {
    await usuario.findByIdAndDelete(id);
    res.redirect('/controlaUsuario');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/cadastroTurma', checkToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    res.render('cadastroTurma', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
})

app.post('/cadastroTurma', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  const user = await User.findById(req.userId).lean();
  let tipoUsuario = user.tipoUsuario;
  
  let nome = req.body.nome;
  let periodo = req.body.periodo_turma
  let ativo = req.body.ativo
  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }

  try {
    
    const turmaExistente = await turma.findOne({ nome: nome, periodo: periodo }).lean();

    if (turmaExistente) {
      console.error('Já existe uma turma com o mesmo nome e período');
      return res.render('cadastroTurma', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', error: 'Já existe uma turma com o mesmo nome e período' });
    }

    await turma.create({ nome: nome, periodo: periodo, ativo: ativo });
    console.log('Dados da Turma inseridos com sucesso');

    if (tipoUsuario == 'administrador') {
      res.render('cadastroTurma', { layout: 'admin' });
    }
    if (tipoUsuario != 'administrador') {
      res.render('cadastroTurma', { layout: 'main' });
    }

  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
})

app.get('/consultaTurma', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  const aluno = require('./models/Aluno.js');

  try {
    let turmas = await turma.find().lean();

    for (let i = 0; i < turmas.length; i++) {
      let turmaId = turmas[i]._id;

      let quantidadeAlunos = await aluno.countDocuments({ 'turma.id': turmaId });

      turmas[i].quantidadeAlunos = quantidadeAlunos;
    }

    res.render('consulta/consultaTurma', { layout: 'admin', turmas: turmas });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`.rainbow.bold.underline);
});