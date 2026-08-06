const mongoose = require('mongoose');

const EsquemaSuscripcion = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tipo: {
        type: String,
        enum: ['mensual', 'trimestral', 'anual'],
        required: true
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaFin: {
        type: Date,
        required: true
    },
    activa: {
        type: Boolean,
        default: true
    },
    gymsVisitados: [{
        gymId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gym'
        },
        fechaVisita: Date,
        sesionesRealizadas: {
            type: Number,
            default: 0
        }
    }],
    pagos: [{
        monto: Number,
        fecha: Date,
        metodo: String,
        referencia: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Suscripcion', EsquemaSuscripcion);