const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/editarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  let id = req.params.id;

  try {
    let turmas = await turma.findById(id).lean();

    res.render('editar/editarTurma', { layout: 'admin', turmas: turmas});
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/editarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
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

module.exports = router;