const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
//const User = require('../../models/User');

conn();

router.get('/editarUsuario/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const usuario = require('../../models/User.js');
  let id = req.params.id;
  const dados = await usuario.findById(id).lean();


  try {
    const dadosTurma = await turma.find().lean();
    res.render('editar/editarUsuario', {
      layout: 'admin',
      dados: dados,
      turmas: dadosTurma
    });
  }
    catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/editarUsuario/:id', async (req, res) => {
  const usuario = require('../../models/User.js');
  const turma = require('../../models/Turma.js');

  let { nome, email, senha, ativo } = req.body;
  let dadosCorpo = req.body;

  const turmasSelecionadas = Object.keys(dadosCorpo)
    .filter(key => key.startsWith('turma-'))
    .map(key => key.split('-')[1]);

  
  const id = req.params.id;
  const dados = await usuario.findById(id).lean();
  let senhaAntiga = dados.senha;
  let nomeAntigo = dados.nome;
  let emailAntigo = dados.email;
  let isAtivo = dados.ativo;


  if(ativo == 'on'){
    isAtivo = true;
  } else {
    isAtivo = false;
  }

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

      await usuario.findByIdAndUpdate(id, { nome: nome, email: email, senha: senhaNova, ativo: isAtivo, turmasPermitidas: turmasSelecionadas });

      res.redirect('/controlaUsuario');
    } catch (error) {

      console.error('Erro ao alterar dados:', error);
      res.status(500).redirect('https://http.cat/images/500.jpg');
    }
  }
});

module.exports = router;