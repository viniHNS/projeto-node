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
    let email = req.body.email;
    let name = req.body.nome;
    let telefone = req.body.telefone;
    let observacao = req.body.observacao;
    let sexo = req.body.sexo;
    if(sexo == "" || sexo == undefined){
        sexo = "Não informado";
    }
    
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea eos, ducimus dicta odio ipsa natus. Aperiam obcaecati provident iusto recusandae, a consectetur ad? Magni reiciendis quam mollitia et, tempora totam.";
    const doc = new pdfKit();

    //res.setHeader('Content-Disposition', 'attachment; filename="example.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.font('Helvetica');
    doc.fontSize(24).text('Informações do Formulário:', { align: 'center' , lineGap: 10});
    doc.fontSize(14).moveDown().text(`Nome: ${name}`, {lineGap: 10});
    doc.fontSize(14).text(`Sexo: ${sexo}`, {lineGap: 10});
    doc.fontSize(14).text(`E-mail: ${email}`, {lineGap: 10});
    doc.fontSize(14).text(`Telefone: ${telefone}`, {lineGap: 10});
    doc.fontSize(14).text(`Observação: ${observacao}`, {lineGap: 10});
    doc.fontSize(14).moveDown().text(`${lorem}`, {lineGap: 10, align: 'justify'});

    doc.end();

  });

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

