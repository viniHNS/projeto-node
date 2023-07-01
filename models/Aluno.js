const mongoose = require('mongoose');
const { Schema } = mongoose;

const alunoSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    data_nascimento: {
        type: String,
        required: true,
    },
    sexo: {
        type: String,
        required: true,
    }, 
    periodoEstudo: {
        type: String,
        required: true,
    },
    responsavel: {
        nome: {
            type: String,
            required: true,
        },
        telefone: {
            type: String,
        },
        email: {
            type: String,
        },
        endereco: {
            type: String,
            
        },
    },
    
    observacao: {
        type: String,
    }  
     
}, { timestamps: true });

const Aluno = mongoose.model('Aluno', alunoSchema);

module.exports = Aluno;