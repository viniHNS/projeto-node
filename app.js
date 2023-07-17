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

//rotas
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const homeRoute = require('./routes/home');
const ajudaRoute = require('./routes/ajuda');
const relatorioRoute = require('./routes/relatorio');
const cadastroAlunoRoute = require('./routes/cadastros/aluno');
const consultaAlunoRoute = require('./routes/consultas/aluno');
const editarAlunoRoute = require('./routes/edicoes/aluno');

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
app.engine('handlebars', engine({ defaultLayout: 'main', partialsDir: __dirname + '/views/partials', layoutsDir: __dirname + '/views/layouts'}))
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

app.get('/', loginRoute );

app.get('/home', checkToken, homeRoute);

app.get('/login', loginRoute);

app.post('/login', loginRoute);

app.post('/logout', loginRoute);

app.get('/register', registerRoute);

app.post('/register', registerRoute);

app.get('/ajuda', checkToken, ajudaRoute);

app.get('/ajuda/ajudaCadastroAluno', checkToken, ajudaRoute);

app.get('/ajuda/ajudaConsultaAluno', checkToken, ajudaRoute);

app.get('/ajuda/ajudaAulas', checkToken, ajudaRoute);

app.post('/relatorio/aluno/:id', checkToken, relatorioRoute);

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

app.get('/cadastroAluno', checkToken, cadastroAlunoRoute);

app.post('/cadastroAluno', checkToken, cadastroAlunoRoute);

app.get('/consultaAluno', checkToken, consultaAlunoRoute);

app.get('/editarAluno/:id', checkToken, editarAlunoRoute);

app.post('/editarAluno/:id', checkToken, editarAlunoRoute);

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
    let turmas = await turma.find().sort({periodo: 1}).lean();

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

app.get('/listarTurma/:id', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  const aluno = require('./models/Aluno.js');

  let id = req.params.id;
  try {
    let turmas = await turma.findById(id).lean();
    let alunos = await aluno.find({ 'turma.id': id }).lean();
    res.render('listar/listarTurma', { layout: 'admin', turmas: turmas,  alunos: alunos });
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/editarTurma/:id', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  let id = req.params.id;

  try {
    let turmas = await turma.findById(id).lean();

    res.render('editar/editarTurma', { layout: 'admin', turmas: turmas});
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/editarTurma/:id', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  let id = req.params.id;

  let nome = req.body.nome;
  let periodo = req.body.periodo_turma
  let ativo = req.body.ativo
  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }

  try {
    await turma.findByIdAndUpdate(id, { nome: nome, periodo: periodo, ativo: ativo });
    console.log('Dados da Turma atualizados com sucesso')
    res.redirect('/consultaTurma');
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.post('/deletarTurma/:id', checkToken, isAdmin, async (req, res) => {
  const turma = require('./models/Turma.js');
  let id = req.params.id;

  try {
    await turma.findByIdAndDelete(id);
    console.log('Turma deletada com sucesso')
    res.redirect('/consultaTurma');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.get('/editarAluno/:id', checkToken, isAdmin, async (req, res) => {
  const aluno = require('./models/Aluno.js');
  const turma = require('./models/Turma.js');
  let id = req.params.id;

  try {
    let alunos = await aluno.findById(id).lean();
    let turmas = await turma.find().lean();

    res.render('editar/editarAluno', { layout: 'admin', alunos: alunos, turmas: turmas});
  } catch (error) {
    console.error('Erro ao buscar dados do aluno: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`.rainbow.bold.underline);
});