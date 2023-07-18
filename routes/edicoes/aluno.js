const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const User = require('../../models/User');
conn();

router.get('/editarAluno/:id', async (req, res) => {
  const aluno = require('../../models/Aluno.js');
  const turma = require('../../models/Turma.js');
  let id = req.params.id;
  try {
    let alunoEdit = await aluno.findById(id).lean();
    let turmas = await turma.find().lean();
    let observacao = alunoEdit.observacao ? alunoEdit.observacao.trim() : '';
    const user = await User.findById(req.userId).lean();

    res.render('editar/editarAluno', { layout: user.tipoUsuario === 'administrador' ? 'admin' : 'main', aluno: alunoEdit, observacao, turmas});
    

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/editarAluno/:id', async (req, res) => {
  const aluno = require('../../models/Aluno.js');
  const turma = require('../../models/Turma.js');
  let id = req.params.id;
  let nome = req.body.nome;
  let sexo = req.body.sexo;
  let dataNascimento = req.body.dataNascimento;
  let periodoEstudo = req.body.periodoEstudo;
  let observacao = req.body.observacoes;
  let turmaEstuda = req.body.turma;
  observacao = observacao.trim();

  let nomeResponsavel = req.body.nomeResponsavel;
  let telefoneResponsavel = req.body.telefoneResponsavel;
  let emailResponsavel = req.body.emailResponsavel;
  let enderecoResponsavel = req.body.enderecoResponsavel;
  let ativo = req.body.ativo;

  if (ativo == 'on') {
    ativo = true;
  } else {
    ativo = false;
  }

  try {
    let seriePartes = turmaEstuda.split(' - ');
    let SerieprimeiraParte = seriePartes[0];
    let SeriesegundaParte = seriePartes[1];
    let achaTurma = await turma.findOne({nome: SerieprimeiraParte, periodo: SeriesegundaParte}).lean();

    let alunoEdit = await aluno.findById(id);
    alunoEdit.nome = nome;
    alunoEdit.sexo = sexo;
    alunoEdit.data_nascimento = dataNascimento;
    alunoEdit.periodoEstudo = periodoEstudo;
    alunoEdit.turma.id = achaTurma._id;
    alunoEdit.turma.nome = achaTurma.nome + " " + achaTurma.periodo;
    alunoEdit.observacao = observacao;
    alunoEdit.responsavel.nome = nomeResponsavel;
    alunoEdit.responsavel.telefone = telefoneResponsavel;
    alunoEdit.responsavel.email = emailResponsavel;
    alunoEdit.responsavel.endereco = enderecoResponsavel;
    alunoEdit.ativo = ativo;
    await alunoEdit.save();

    console.log('Dados do aluno atualizados com sucesso');
    res.redirect('/consultaAluno');

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;