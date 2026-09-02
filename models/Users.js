const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

    nombres:{
        type: String,
        required:[true, 'Es necesario su nombre'],
        trim: true,
        minlength:[4, 'Es necesario que el nombre tenga minimo 4 caracteres'],
        maxlength:[30, 'No puede exceder 30 caracteres']
    },

    apellidos:{
        type: String,
        required:[true, 'son necesarios sus apellidos'],
        trim: true,
        minlength:[4, 'Es necesario que el nombre tenga minimo 4 caracteres'],
        maxlength:[30, 'No puede exceder 30 caracteres']    
    },

    email:{
        type: String,
        required:[true, 'Es necesario escribir su correo electronico'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']

    },

    password:{
        type: String,
        required:[true, 'Requiere de contraseña'],
        minlength: [6, 'Debe tener almenos 6 caracteres la contraseña'],
        select: false
    },

    telefono:{
        type: String,
        sparse: true
    },

    ciudad:{
        type: String,
        default: 'no especificada'
    },

    rol:{
        type: String,
        enum: ['usuario', 'entrenador', 'admin', 'superadmin'],
        default:'usuario'
    },

     tipoUsuario: {
        type: String,
        enum: ['gym', 'independiente'],
        default: 'independiente'
    },

    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        default: null,
        required: function() {
            return this.tipoUsuario === 'gym';  // ← Solo obligatorio si es tipo gym
        }
    },   

    suscripcionActiva: {
        type: Boolean,
        default: false
    },

    fechaRegistro:{
        type:Date,
        default: Date.now
    },

        // Sistema de referidos
    codigoReferido: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    referidoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    puntosReferidos: {
        type: Number,
        default: 0
    },
    totalReferidos: {
        type: Number,
        default: 0
    },
    totalReferidosPagados: {
        type: Number,
        default: 0
    },
    
    // Plan individual (para B2C)
    planIndividual: {
        type: String,
        enum: ['free', 'pro', 'coach'],
        default: 'free'
    },
    estadoPlanIndividual: {
        type: String,
        enum: ['trial', 'activo', 'vencido', 'cancelado'],
        default: 'trial'
    },
    fechaInicioPlan: {
        type: Date
    },
    fechaFinPlan: {
        type: Date
    },
    
    // Configuración personal
    diaDescanso: {
        type: String,
        enum: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'ninguno'],
        default: 'domingo'
    },
    
    // Racha actual
    rachaActual: {
        type: Number,
        default: 0
    },
    ultimoEntrenamiento: {
        type: Date
    },
    
    // Puntos totales (recompensas + referidos)
    puntos: {
        saldo: { type: Number, default: 0 },
        historial: [{
            concepto: String,
            cantidad: Number,
            tipo: { type: String, enum: ['ganado', 'gastado'] },
            fecha: { type: Date, default: Date.now }
        }]
    }

    

}, {timestamps: true});


//userSchema.pre('save', ...): un hook que corre justo antes de guardar. 
UserSchema.pre('save', async function (){
    if(!this.isModified('password')){
        return;
    }
   
 const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
      
});

UserSchema.methods.compararPassword = async function (passwordIngresada){
    return await bcrypt.compare(passwordIngresada, this.password);
}



module.exports = mongoose.model('User', UserSchema)