const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/consultaTurma', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const aluno = require('../../models/Aluno.js');

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

module.exports = router;