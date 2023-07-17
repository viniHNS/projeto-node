const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../db/conn');
const User = require('../models/User');

conn();

router.get('/', async (req, res) => {
  res.redirect('/home');
});

router.get('/home', async (req, res) => {

  try {
    const user = await User.findById(req.userId).lean();
    const alunos = require('../models/Aluno.js');

    const dataHoje = new Date().toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const dataAniversario = new Date(user.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    
    const isAniversario = dataHoje == dataAniversario ? true : false;

    const allAlunos = await alunos.find().lean();
    let tipoUsuario = user.tipoUsuario;
    let nome = user.nome;

    if (tipoUsuario == 'administrador') {
      res.render('home', { nome, layout: 'admin', allAlunos, isAniversario });
    }

    if (tipoUsuario != 'administrador') {
      res.render('home', { nome, layout: 'main', isAniversario });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;