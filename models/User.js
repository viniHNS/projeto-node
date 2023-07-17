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

    turmasPermitidas: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Turma'
            },
            
        }
    ],

    ativo: {
        type: Boolean,
        default: true,
    },


}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;