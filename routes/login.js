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

router.get('/', (req, res) => {
  res.redirect('login');
});

router.get('/login', (req, res) => {
  res.render('login/login', { layout: 'login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send('<script>alert("Informe o email e a senha"); window.location.href = "/login";</script>');
  }

  if (!email) {
    return res.status(422).send('<script>alert("Email não informado"); window.location.href = "/login";</script>');
  }

  if (!password) {
    return res.status(422).send('<script>alert("Senha não informada"); window.location.href = "/login";</script>');
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).send('<script>alert("Email não encontrado"); window.location.href = "/login";</script>');
  }

  const checkPassword = await bcrypt.compare(password, user.senha);

  if (!checkPassword) {
    return res.status(404).send('<script>alert("Senha incorreta"); window.location.href = "/login";</script>');
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign({ id: user._id }, secret);

    const expirationTime = 20 * 60 * 60 * 1000; // 20 horas em milissegundos
    const expires = new Date(Date.now() + expirationTime);

    res.cookie('auth-token', token, { httpOnly: true, expires: expires});
    res.redirect('/home');

  } catch (error) {
    console.error('Erro ao gerar token: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.redirect('/login');
});

module.exports = router;