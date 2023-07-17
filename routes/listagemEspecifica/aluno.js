const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const User = require('../../models/User');

conn();

router.get('/listarAluno/:id', async (req, res) => {
  const aluno = require('../../models/Aluno.js');
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
      res.render('listar/listarAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', alunos, dataEdicao, observacao });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});



module.exports = router;