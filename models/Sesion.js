const mongoose = require('mongoose');

const EsquemaSerieReal = new mongoose.Schema({
    
    numeroSerie: {
         type: Number,
          required: true
         },
    repeticionesRealizadas: {
         type: Number,
          required: true 
        },
    pesoReal: {
         type: Number, 
         default: 0
         },
    completada: { 
        type: Boolean, 
        default: true
     },
     estado: {                                                  
        type: String,
        enum: ['pendiente', 'ejecucion', 'descanso', 'completada'],
        default: 'pendiente'
    },
     segundosEjecucion: {
         type: Number, 
         default: 0 
        }, 
      segundosDescansoRestante: { 
        type: Number, 
        default: 0
      },  
    notas: {
         type: String,
          trim: true
         }
}, { _id: false });

const EsquemaEjercicioSesion = new mongoose.Schema({
    
    ejercicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ejercicio',
        required: true
    },
    series: [EsquemaSerieReal]
}, { _id: false });

const EsquemaSesion = new mongoose.Schema({
    
    rutina: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rutina',
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: false,
        default: null
    },

    ejercicios: [EsquemaEjercicioSesion],
    
    fecha: {
        type: Date,
        default: Date.now
    },
    duracionMinutos: {
        type: Number,
        default: 0
    },
    segundosTranscurridos: {         
        type: Number,
        default: 0
    },
    segundosMinimo: {                 
        type: Number,
        default: 900 // 15 min en segundos
    },
    completada: {
        type: Boolean,
        default: false
    },
    sensacion: {
        type: String,
        enum: ['muy facil', 'facil', 'normal', 'dificil', 'muy dificil']
    }
}, { timestamps: true });

module.exports = mongoose.model('Sesion', EsquemaSesion);