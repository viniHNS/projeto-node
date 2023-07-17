const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const User = require('../../models/User');

conn();

router.post('/deletarAluno/:id', async (req, res) => {
  const aluno = require('../../models/Aluno.js');
  let id = req.params.id;
  try {
    await aluno.findByIdAndDelete(id);
    res.redirect('/consultaAluno');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;