import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import pdfKit from 'pdfkit';

const app = express();
const port = 3000;


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.render('home');
});

app.post('/gerarPDF', (req, res) => {
    const email = req.body.email;
    const name = req.body.nome;
    const telefone = req.body.telefone;
    const observacao = req.body.observacao;
    
    const doc = new pdfKit();

    // Define o cabeçalho HTTP para o PDF
    res.setHeader('Content-Disposition', 'attachment; filename="example.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe o PDF para a resposta
    doc.pipe(res);

    // Adiciona o conteúdo do formulário ao PDF
    doc.font('Helvetica');
    doc.fontSize(24).text('Informações do Formulário:', { align: 'center' });
    doc.fontSize(14).text(`Nome: ${name}`);
    doc.fontSize(14).text(`E-mail: ${email}`);
    doc.fontSize(14).text(`Telefone: ${telefone}`);
    doc.fontSize(14).text(`Observação: ${observacao}`);

    // Finaliza o PDF e encerra a resposta
    doc.end();

  });

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

