const express = require('express');
const router = express.Router();
const turma = require('../../models/Turma.js');
const aluno = require('../../models/Aluno.js');
const User = require('../../models/User.js');

router.get('/listaTurmaChamada/:id', async (req, res) => {

    const turmaId = req.params.id;

    try {
        const user = await User.findById(req.userId).lean();
        const tipoUsuario = user.tipoUsuario;

        const turmas = await turma.findById(turmaId).lean();
        const nomeAlunos = await aluno.find({ 'turma.id': turmaId }).select('nome').lean();

        for (let i = 0; i < nomeAlunos.length; i++) {
            nomeAlunos[i] = nomeAlunos[i].nome;
        }
        turmas.nomeAlunos = nomeAlunos;

        res.render('listar/listarTurmaChamada.handlebars', { layout: tipoUsuario === 'administrador' ? 'admin' : 'main', turmas: turmas });
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).redirect('https://http.cat/images/500.jpg');
    }
});

module.exports = router;