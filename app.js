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
const homeRoute = require('./routes/home');

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');

const ajudaRoute = require('./routes/ajuda');

const relatorioRoute = require('./routes/relatorio');
const cadastroAlunoRoute = require('./routes/cadastros/aluno');
const consultaAlunoRoute = require('./routes/consultas/aluno');
const editarAlunoRoute = require('./routes/edicoes/aluno');
const deletaAlunoRoute = require('./routes/deletes/aluno');
const listaAlunoEspecificoRoute = require('./routes/listagemEspecifica/aluno');

const perfilRoute = require('./routes/perfil');

const consultaUsuarioRoute = require('./routes/consultas/usuario');
const deletaUsuarioRoute = require('./routes/deletes/usuario');
const editarUsuarioRoute = require('./routes/edicoes/usuario');

const cadastroTurmaRoute = require('./routes/cadastros/turma');
const consultaTurmaRoute = require('./routes/consultas/turma');
const listaTurmaEspecificaRoute = require('./routes/listagemEspecifica/turma');
const editarTurmaRoute = require('./routes/edicoes/turma');
const deletaTurmaRoute = require('./routes/deletes/turma');

const consultaTurmaChamadaRoute = require('./routes/consultas/turmaChamada');
const listaTurmaChamadaRoute = require('./routes/listagemEspecifica/turmaChamada');

require("dotenv").config();
const handlebars = require('handlebars');

handlebars.registerHelper('isInTurmasPermitidas', function (turmaId, turmasPermitidas, options) {
  if (turmasPermitidas && turmasPermitidas.includes(turmaId.toString())) {
    return options.fn(this);
  }
  return options.inverse(this);
});

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

//conn(); 

//middleware para verificar se o usuário está logado
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
//******************************************************************************************** */

//middleware para verificar se o usuário é administrador
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
//******************************************************************************************** */


//rotas da homepage
app.get('/home', checkToken, homeRoute);
app.get('/', checkToken, homeRoute);
//***************************************************************************************


//Rotas de login, logout e registro
app.get('/login', loginRoute);
app.post('/login', loginRoute);
app.post('/logout', loginRoute);
app.get('/register', registerRoute);
app.post('/register', registerRoute);
//***************************************************************************************


//rotas de ajuda
app.get('/ajuda', checkToken, ajudaRoute);
app.get('/ajuda/ajudaCadastroAluno', checkToken, ajudaRoute);
app.get('/ajuda/ajudaConsultaAluno', checkToken, ajudaRoute);
app.get('/ajuda/ajudaAulas', checkToken, ajudaRoute);
//***************************************************************************************

//rotas de chamada, etc.
app.get('/consultaTurmaChamada', checkToken, consultaTurmaChamadaRoute)
app.get('/listaTurmaChamada/:id', checkToken, listaTurmaChamadaRoute)
//*************************************************************************************** 


//Rotas referente aos alunos
app.get('/cadastroAluno', checkToken, cadastroAlunoRoute);
app.post('/cadastroAluno', checkToken, cadastroAlunoRoute);

app.get('/consultaAluno', checkToken, consultaAlunoRoute);

app.get('/editarAluno/:id', checkToken, editarAlunoRoute);
app.post('/editarAluno/:id', checkToken, editarAlunoRoute);

app.get('/listarAluno/:id', checkToken, listaAlunoEspecificoRoute);

app.post('/relatorio/aluno/:id', checkToken, relatorioRoute);

app.post('/deletarAluno/:id', checkToken, deletaAlunoRoute);
//***************************************************************************************


//Rotas sobre o perfil do usuário logado
app.get('/perfil', checkToken, perfilRoute);
//***************************************************************************************

//Rotas do administrador
app.get('/controlaUsuario', checkToken, isAdmin, consultaUsuarioRoute);

app.post('/deletarUsuario/:id', checkToken, isAdmin, deletaUsuarioRoute);

app.get('/editarUsuario/:id', checkToken, isAdmin, editarUsuarioRoute);
app.post('/editarUsuario/:id', checkToken, isAdmin, editarUsuarioRoute);
//***************************************************************************************

//Rotas de cadastro, consulta, edição e exclusão da turma
app.get('/cadastroTurma', checkToken,  cadastroTurmaRoute);
app.post('/cadastroTurma', checkToken, cadastroTurmaRoute);

app.get('/consultaTurma', checkToken, consultaTurmaRoute);

app.get('/listarTurma/:id', checkToken, listaTurmaEspecificaRoute);

app.get('/editarTurma/:id', checkToken, editarTurmaRoute);
app.post('/editarTurma/:id', checkToken, editarTurmaRoute);

app.post('/deletarTurma/:id', checkToken, deletaTurmaRoute);
//*************************************************************************************

//***************************************************************************************

/*app.get('/editarAluno/:id', checkToken, isAdmin, async (req, res) => {
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
}); */

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`.rainbow.bold.underline);
});