const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
    },

    email: {
        type: String,
    },
    
    senha: {
        type: String,
    },

    tipoUsuario: {
        type: String,
    },

    dataNascimento: {
        type: String,
    },

    turmasPermitidas: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Turma' 
    }],


}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;