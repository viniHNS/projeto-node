import express from 'express';
import { engine } from 'express-handlebars';
import fs from 'fs';


const app = express();
const port = 3000;


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use('/public', express.static('public'));


app.get('/', (req, res) => {
    res.render('home');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);

});

