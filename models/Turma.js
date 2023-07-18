const mongoose = require('mongoose');
const { Schema } = mongoose;

const turmaSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },

    periodo: {
        type: String,
        required: true,
    },

    professoresVinculados: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Professor',
        },
      ],

    ativo: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const Turma = mongoose.model('Turma', turmaSchema);
module.exports = Turma;