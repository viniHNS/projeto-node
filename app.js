import express from 'express';
import { engine } from 'express-handlebars';
import fs from 'fs';
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
    const doc = new pdfKit();

    doc.pipe(fs.createWriteStream('output.pdf'));

    doc.text(req.body.nome);

    

    const stream = doc.pipe(blobStream());


    doc.end();
    stream.on('finish', function() {
        const blob = stream.toBlob('application/pdf');

  
        const url = stream.toBlobURL('application/pdf');
        iframe.src = url;
    });




});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);

});

