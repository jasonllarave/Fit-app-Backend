const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    familia: { 
        type: String, 
        enum: ['individuo', 'gym'], 
        required: true 
    },
    nombre: { 
        type: String, 
        required: true 
    },
    descripcion: { 
        type: String 
    },
    precioMensualCOP: { 
        type: Number, 
        required: true 
    },
    precioAnualCOP: { 
        type: Number 
    },
    // Límites
    maxRutinas: { 
        type: Number, 
        default: 1500 
    },
    maxClientes: { 
        type: Number, 
        default: 0 
    },
    maxMiembros: { 
        type: Number, 
        default: 0 
    },
    maxEntrenadores: { 
        type: Number, 
        default: 0 
    },
    // Features
    features: [{ 
        type: String 
    }],
    recompensasPropias: { 
        type: Boolean, 
        default: false 
    },
    analyticsAvanzado: { 
        type: Boolean, 
        default: false 
    },
    // Trial
    trialDias: { 
        type: Number, 
        default: 7 
    },
    // Visible en landing
    visible: { 
        type: Boolean, 
        default: true 
    },
    orden: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);