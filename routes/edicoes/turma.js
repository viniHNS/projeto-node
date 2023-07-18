const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/editarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const user = require('../../models/User')
  let id = req.params.id;

  try {
    let turmas = await turma.findById(id).lean();
    const professores = await user.find({ tipoUsuario: { $ne: 'administrador' } }).lean();

    res.render('editar/editarTurma', { layout: 'admin', turmas: turmas, dadosProf: professores});
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/editarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const professor = require('../../models/User.js');
  let id = req.params.id;

  let nome = req.body.nome;
  let periodo = req.body.periodo_turma
  let ativo = req.body.ativo
  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }
  let professorSelecionado = req.body.professores;

  if (typeof professorSelecionado === 'string') {
    professorSelecionado = [professorSelecionado];
  }

  try {
    // Consultar a turma atual no banco de dados
    let turmaAtual = await turma.findById(id);

    // Remover professores que foram desmarcados
    turmaAtual.professoresVinculados = [];

    console.log(professorSelecionado);

    if(professorSelecionado == undefined){
      turmaAtual.professoresVinculados = [];
    } else if (professorSelecionado.length > 0) {
      let professoresAdicionados = await professor.find({ _id: { $in: professorSelecionado } }).exec();
      turmaAtual.professoresVinculados.push(...professoresAdicionados);
    }

    // Atualizar os dados da turma no banco de dados
    await turma.findByIdAndUpdate(id, { nome: nome, periodo: periodo, ativo: ativo, professoresVinculados: turmaAtual.professoresVinculados });

    console.log('Dados da Turma atualizados com sucesso');
    res.redirect('/consultaTurma');
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;