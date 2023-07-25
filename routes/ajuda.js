const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../db/conn');
const User = require('../models/User');

conn();

router.get('/ajuda', async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    res.render('ajuda/ajuda', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.get('/ajuda/ajudaCadastroAluno', async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;
    
    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaCadastroAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.get('/ajuda/ajudaConsultaAluno', async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaConsultaAluno', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main'});
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.get('/ajuda/ajudaAulas', async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    if (tipoUsuario == 'administrador') {
      res.render('ajuda/ajudaAulas', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});


module.exports = router;
