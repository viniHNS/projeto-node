const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const conn = require('../db/conn');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cookieParser = require('cookie-parser');

conn();

router.get('/register', (req, res) => {
  res.render('login/register', { layout: 'login' });
});

router.post('/register', async (req, res) => {
  const { nome, email, password, password2, dataNascimento } = req.body;

  if (!nome) {
    return res.status(422).send('<script>alert("Nome não informado"); window.location.href = "/login";</script>');
  }

  if (!email) {
    return res.status(422).send('<script>alert("Email não informado"); window.location.href = "/login";</script>');
  }

  if (!password) {
    return res.status(422).send('<script>alert("Senha não informada"); window.location.href = "/login";</script>');
  }

  if (password !== password2) {
    return res.status(422).send('<script>alert("Senhas não conferem"); window.location.href = "/login";</script>');
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).send('<script>alert("Email já cadastrado"); window.location.href = "/login";</script>');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    nome: nome,
    email: email,
    senha: passwordHash,
    dataNascimento: dataNascimento,
    tipoUsuario: 'comum',
  });

  try {
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
})

module.exports = router;