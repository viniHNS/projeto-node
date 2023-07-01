const mongoose = require('mongoose');
const { Schema } = mongoose;

const pdfSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    sexo: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    telefone: {
        type: String,
    },
    observacao: {
        type: String,
    },
}, { timestamps: true });

const Pdf = mongoose.model('Pdf', pdfSchema);
module.exports = Pdf;