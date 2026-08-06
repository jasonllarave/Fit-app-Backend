const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: [true, 'El nombre del gimnasio es obligatorio'],
        trim: true,
        minlength: [3, 'Mínimo 3 caracteres'],
        maxlength: [50, 'Máximo 50 caracteres']
    },

     direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true
    },

    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio']
    },

    ciudad: {
        type: String,
        default: 'no especificada'
    },

     emailContacto: {
        type: String,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },

    plan: {
        type: String,
        enum: ['inicial', 'crecimiento', 'profesional'],
        default: 'inicial'
    },

     recompensasActivas: {           
        type: Boolean,
        default: true
    },

    modoRecompensas: {              
        type: String,
        enum: ['propias', 'globales', 'desactivadas'],
        default: 'propias'
    },

    activo: {
        type: Boolean,
        default: true
    }
    
    }, { timestamps: true });

module.exports = mongoose.model('Gym', GymSchema);
