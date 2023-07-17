const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.post('/deletarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
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

module.exports = router;