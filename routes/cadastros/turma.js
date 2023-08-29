const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/cadastroTurma', async (req, res) => {
  const user = require('../../models/User')
  try {
    const professores = await user.find({ tipoUsuario: { $ne: 'administrador' } }).lean();
    res.render('cadastroTurma', { dadosProf: professores });
  } catch (error) {
    console.error('Erro ao buscar dados dos professores:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }

});

router.post('/cadastroTurma', async (req, res) => {
  const turma = require('../../models/Turma.js');
  
  let nome = req.body.nome;
  let periodo = req.body.periodo_turma
  let ativo = req.body.ativo
  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }
  let professoresSelecionados = req.body.professores;

  try {
    
    const turmaExistente = await turma.findOne({ nome: nome, periodo: periodo }).lean();

    if (turmaExistente) {
      console.error('Já existe uma turma com o mesmo nome e período');
      return res.render('cadastroTurma', {  error: 'Já existe uma turma com o mesmo nome e período' });
    }

    await turma.create({ nome: nome, periodo: periodo, ativo: ativo });
    console.log('Dados da Turma inseridos com sucesso');

    res.render('cadastroTurma');
    
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;