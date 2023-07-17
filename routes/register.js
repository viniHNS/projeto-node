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

  if(dataNascimento == '' || dataNascimento == null || dataNascimento == undefined) {
    dataNascimento = "Não informado"
  }

  if (!nome) {
    return res.status(422).render('login/register', { layout: 'login', errorNomeVazio: 'Nome não informado'});
  }

  if (!email) {
    return res.status(422).render('login/register', { layout: 'login', errorEmailVazio: 'Email não informado'});
  }

  if (!password) {
    return res.status(422).render('login/register', { layout: 'login', errorPassVazio: 'Senha não informada'});
  }

  if (password !== password2) {
    return res.status(422).render('login/register', { layout: 'login', errorPassDiferente: 'Senhas não conferem'});
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).render('login/register', { layout: 'login', errorUserExists: 'Usuário já cadastrado'});
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