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
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;