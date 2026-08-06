const mongoose = require('mongoose');

const EsquemaSerie = new mongoose.Schema({
    numeroSerie: {
          type: Number,
        required: true
    },
    repeticiones: {
        type: Number,
        required: true
    },
    pesoObjetivo: {
        type: Number,
        default: 0
    },
    descansoSegundos: {
        type: Number,
        default: 60
    }
}, { _id: false });


const EsquemaEjercicioRutina = new mongoose.Schema({
    ejercicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ejercicio',
        required: [true, 'El ejercicio es obligatorio']
    },
    series: [EsquemaSerie],
    notas: {
        type: String,
        trim: true
    }
}, { _id: false });


const EsquemaRutina = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la rutina es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: false,
        default: null 

    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El cliente es obligatorio']
    },
    entrenador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, 
        default: null
    },
    ejercicios: [EsquemaEjercicioRutina],
    frecuencia: {
        type: String,
        enum: ['diaria', 'semanal', 'personalizada'],
        default: 'semanal'
    },
    diasSemana: [{
        type: String,
        enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    }],
    activa: {
        type: Boolean,
        default: true
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaFin: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Rutina', EsquemaRutina);