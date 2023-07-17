const express = require('express');
const router = express.Router();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const conn = require('../db/conn');
const User = require('../models/User');
const pdfKit = require('pdfkit');

conn();

router.post('/relatorio/aluno/:id', async (req, res) => {
  const aluno = require('../models/Aluno.js');
  let id = req.params.id;
  try {
    let alunos = await aluno.findById(id).lean();

    //geração do PDF
    const doc = new pdfKit({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.font('Helvetica');
    doc.fontSize(24).text('Informações do Formulário:', { align: 'center', lineGap: 10 });
    doc.fontSize(18).moveDown().text(`Dados do aluno`, { lineGap: 10 });
    doc.fontSize(14).text(`Nome: ${alunos.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Sexo: ${alunos.sexo}`, { lineGap: 10 });
    doc.fontSize(14).text(`Data de nascimento: ${alunos.data_nascimento}`, { lineGap: 10 });
    doc.fontSize(14).text(`Periodo em que estuda: ${alunos.periodoEstudo}`, { lineGap: 10 });
    doc.fontSize(14).text(`Turma: ${alunos.turma.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Observação: ${alunos.observacao == "" ? "Não informado" : alunos.observacao}`, { lineGap: 10 });
    doc.fontSize(18).moveDown().text(`Dados do responsável`, { lineGap: 10 });
    doc.fontSize(14).text(`Nome: ${alunos.responsavel.nome}`, { lineGap: 10 });
    doc.fontSize(14).text(`Telefone: ${alunos.responsavel.telefone}`, { lineGap: 10 });
    doc.fontSize(14).text(`Email: ${alunos.responsavel.email}`, { lineGap: 10 });
    doc.fontSize(14).text(`Endereço: ${alunos.responsavel.endereco}`, { lineGap: 10 });
    doc.fontSize(14).text(`Ativo: ${alunos.ativo}`, { lineGap: 10 });

    doc.end();

  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).redirect('https://http.cat/images/500.jpg');
  }
});

module.exports = router;