const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/listarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const aluno = require('../../models/Aluno.js');

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

module.exports = router;