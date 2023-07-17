const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const User = require('../../models/User');

conn();

router.get('/editarUsuario/:id', async (req, res) => {

  const usuario = require('../../models/User.js');
  let id = req.params.id;
  try {
    const dados = await usuario.findById(id).lean();
    res.render('editar/editarUsuario', { layout: 'admin', dados: dados });
    console.log(dados.nome);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/editarUsuario/:id', async (req, res) => {
  const usuario = require('../../models/User.js');
  const { nome, email, senha } = req.body;
  const id = req.params.id;
  const senhaAntiga = usuario.senha;
  const nomeAntigo = usuario.nome;
  const emailAntigo = usuario.email;

  if(!nome) {
    return res.status(422).render('editar/editarUsuario', { layout: 'admin', errorNomeVazio: 'Nome não informado' });
  }

  if(!email) {
    return res.status(422).render('editar/editarUsuario', { layout: 'admin', errorEmailVazio: 'Email não informado' });
  }

  if(nome || email || senha) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);
      const senhaNova = hash;

      if(nome == nomeAntigo){
        nome = nomeAntigo;
      }

      if(email == emailAntigo){
        email = emailAntigo;
      }

      if(senhaNova == senhaAntiga){
        senhaNova = senhaAntiga;
      }

      const dados = await usuario.findByIdAndUpdate(id, { nome: nome, email: email, senha: senhaNova });
      res.redirect('/controlaUsuario');
    } catch (error) {
      console.error('Erro ao alterar dados:', error);
      res.status(500).redirect('https://http.cat/images/500.jpg');
    }
  }
});

module.exports = router;