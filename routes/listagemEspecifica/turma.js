const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');

conn();

router.get('/listarTurma/:id', async (req, res) => {
  const turma = require('../../models/Turma.js');
  const aluno = require('../../models/Aluno.js');
  const professor = require('../../models/User.js');

  let id = req.params.id;
  try {
    let turmas = await turma.findById(id).lean();
    let alunos = await aluno.find({ 'turma.id': id }).lean();
    const user = await professor.findById(req.userId).lean();

    let tipoUsuario = user.tipoUsuario;

    let professoresVinculadosIds = Array.isArray(turmas.professoresVinculados) ? turmas.professoresVinculados : [turmas.professoresVinculados];

    // Consultar os professores vinculados pelo ID e obter os nomes
    let professoresVinculados = await professor.find({ _id: { $in: professoresVinculadosIds } }).lean();
    let nomesProfessores = professoresVinculados.map(professor => professor.nome);

    turmas.professoresVinculados = nomesProfessores; // Array com os nomes dos professores vinculados

    res.render('listar/listarTurma', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', turmas: turmas, alunos: alunos });
  } catch (error) {
    console.error('Erro ao buscar dados da turma: ', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;