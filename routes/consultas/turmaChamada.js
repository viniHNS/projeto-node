const express = require('express');
const router = express.Router();
const turma = require('../../models/Turma.js');
const aluno = require('../../models/Aluno.js');
const user = require('../../models/User.js');

router.get('/consultaTurmaChamada', async (req, res) => {
  try {
    const professoresVinculados = req.userId; 

    // Consulta apenas as turmas em que o professor está vinculado
    const turmas = await turma.find({ professoresVinculados: professoresVinculados }).sort({ periodo: 1 }).lean();

    for (let i = 0; i < turmas.length; i++) {
      const turmaId = turmas[i]._id;
      const quantidadeAlunos = await aluno.countDocuments({ 'turma.id': turmaId });
      turmas[i].quantidadeAlunos = quantidadeAlunos;
    }

    res.render('consulta/consultaTurmaChamada', { layout: 'admin', turmas: turmas });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;