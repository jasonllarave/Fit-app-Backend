const mongoose = require('mongoose');

const EsquemaRecompensa = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['badge', 'descuento', 'producto', 'servicio'],
        required: true
    },
    puntosNecesarios: {
        type: Number,
        required: true,
        min: 1
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        default: null  // null = recompensa global de la plataforma
    },
    imagen: {
        type: String
    },
    activa: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: -1  // -1 = ilimitado
    }
}, { timestamps: true });

module.exports = mongoose.model('Recompensa', EsquemaRecompensa);