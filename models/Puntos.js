const mongoose = require('mongoose');

const EsquemaPuntos = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    tipo: {
        type: String,
        enum: ['ganado', 'canjeado', 'bono'],
        required: true
    },
    motivo: {
        type: String,
        required: true
    },
    sesion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sesion',
        default: null
    },
    recompensa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recompensa',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Puntos', EsquemaPuntos);