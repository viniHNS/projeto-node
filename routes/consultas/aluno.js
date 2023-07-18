const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const User = require('../../models/User');

conn();

router.get('/consultaAluno', async (req, res) => {
  const user = await User.findById(req.userId).lean();
  const aluno = require('../../models/Aluno.js');
  
  try {
    let alunos = await aluno.find().sort({ ativo: -1, turma: 1 }).lean();
  
    res.render('consulta/consultaAluno', { layout: user.tipoUsuario === 'administrador' ? 'admin' : 'main', alunos: alunos });
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;