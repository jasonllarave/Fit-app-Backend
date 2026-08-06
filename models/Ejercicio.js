const mongoose = require('mongoose');

const EsquemaEjercicio = new mongoose.Schema({
    idEjercicio: {
        type: String,
        required: [true, 'El ID del ejercicio es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true
    },
    parteCuerpo: {
        type: String,
        required: [true, 'La parte del cuerpo es obligatoria'],
        trim: true
    },
    equipo: {
        type: String,
        required: [true, 'El equipo es obligatorio'],
        trim: true
    },
    musculoObjetivo: {
        type: String,
        required: [true, 'El músculo objetivo es obligatorio'],
        trim: true
    },
    grupoMuscular: {
        type: String,
        trim: true
    },
    musculosSecundarios: [{
        type: String,
        trim: true
    }],
    instrucciones: {
        es: {
            type: String
        },
        en: {
            type: String
        }
    },
    idMedia: {
        type: String
    },
    imagen: {
        type: String
    },
    gif: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Ejercicio', EsquemaEjercicio);