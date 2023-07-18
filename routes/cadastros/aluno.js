const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../../db/conn');
const User = require('../../models/User');
conn();

router.get('/cadastroAluno', async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    const turma = require('../../models/Turma.js');

    let turmas = await turma.find().lean();
    
    res.render('cadastroAluno', { layout: user.tipoUsuario === 'administrador' ? 'admin' : 'main' , turmas: turmas});

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

router.post('/cadastroAluno', async (req, res) => {
  const user = await User.findById(req.userId).lean();
  let nome = req.body.nome;
  let sexo = req.body.sexo;
  let dataNascimento = req.body.dataNascimento;
  let periodoEstudo = req.body.periodoEstudo;
  let serieEstuda = req.body.turma;
  let observacao = req.body.observacoes;
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

  const aluno = require('../../models/Aluno.js');
  const turma = require('../../models/Turma.js');

  try {
    serieEstuda = serieEstuda.trim();
    let seriePartes = serieEstuda.split(' - ');
    let SerieprimeiraParte = seriePartes[0];
    let SeriesegundaParte = seriePartes[1];

    let dadosTurma = await turma.findOne({nome: SerieprimeiraParte, periodo: SeriesegundaParte}).lean();
    
    if (!nome || !sexo || !dataNascimento || !periodoEstudo || !nomeResponsavel || !enderecoResponsavel || !periodoEstudo) {
      console.log("Preencha os campos obrigatórios");
    } else {
      await aluno.create({ nome: nome, data_nascimento: dataNascimento, sexo: sexo, periodoEstudo: periodoEstudo, observacao: observacao, responsavel: { nome: nomeResponsavel, telefone: telefoneResponsavel, email: emailResponsavel, endereco: enderecoResponsavel, ativo: ativo}, turma: {id: dadosTurma._id, nome: dadosTurma.nome + " " + dadosTurma.periodo} });

      console.log('Dados do aluno inseridos com sucesso');
      res.render('cadastroAluno', { layout: user.tipoUsuario === 'administrador' ? 'admin' : 'main' });
    }
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;