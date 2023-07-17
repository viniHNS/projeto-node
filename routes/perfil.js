const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../db/conn');
const User = require('../models/User');
conn();

router.get('/perfil', async (req, res) => {

  try {
    const user = await User.findById(req.userId).lean();
    const tipoUsuario = user.tipoUsuario;

    let usuario = require('../models/User.js');
    usuario = await usuario.findById(req.userId).select('-senha -__v -createdAt -updatedAt').lean();

    res.render('meuPerfil', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', usuario: usuario });
    
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;