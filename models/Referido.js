const mongoose = require('mongoose');

const ReferidoSchema = new mongoose.Schema({
    // Quien invita
    referidor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Quien se registra
    referido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Email del invitado (para tracking antes de registro)
    emailInvitado: {
        type: String,
        lowercase: true,
        trim: true
    },
    // Código único del link
    codigo: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Estado
    estado: {
        type: String,
        enum: ['pendiente', 'registrado', 'pagado', 'cancelado'],
        default: 'pendiente'
    },
    // Puntos que ganó el referidor
    puntosGanados: {
        type: Number,
        default: 0
    },
    // Si el referido pagó un plan de pago
    conversion: {
        type: Boolean,
        default: false
    },
    fechaRegistroReferido: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Referido', ReferidoSchema);