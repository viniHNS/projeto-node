const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
//const User = require('../../models/User');

conn();

router.get('/controlaUsuario', async (req, res) => {

  const usuario = require('../../models/User.js');
  const usuarioAtualID = req.userId;
  try {

    let usuarios = await usuario.find({ _id: { $ne: usuarioAtualID } })
      .select('-senha -__v -createdAt -updatedAt')
      .lean();
    res.render('controlaUsuario', { layout: 'admin', usuarios: usuarios })
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;