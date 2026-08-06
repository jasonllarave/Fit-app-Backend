const Suscripcion = require('../models/Suscripcion');
const User = require('../models/Users');

// CREAR SUSCRIPCIÓN
exports.crearSuscripcion = async (req, res) => {
    try {
        const { tipo, fechaFin } = req.body;
        const usuario = req.usuario._id;

        // Verificar que no tenga suscripción activa
        const existeActiva = await Suscripcion.findOne({ usuario, activa: true });
        
        if (existeActiva) {
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Ya tienes una suscripción activa'
            });
        }

        const nuevaSuscripcion = new Suscripcion({
            usuario,
            tipo,
            fechaFin,
            activa: true
        });

        const suscripcionGuardada = await nuevaSuscripcion.save();

        // Activar usuario
        await User.findByIdAndUpdate(usuario, { suscripcionActiva: true });

        res.status(201).json({
            exitoso: true,
            mensaje: 'Suscripción creada',
            datos: suscripcionGuardada
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al crear suscripción',
            error: error.message
        });
    }
};

// TRAER MI SUSCRIPCIÓN
exports.traerMiSuscripcion = async (req, res) => {
    try {
        const suscripcion = await Suscripcion.findOne({ 
            usuario: req.usuario._id,
            activa: true 
        });

        if (!suscripcion) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No tienes suscripción activa'
            });
        }

        res.status(200).json({
            exitoso: true,
            datos: suscripcion
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error',
            error: error.message
        });
    }
};

// REGISTRAR VISITA A GYM
exports.registrarVisita = async (req, res) => {
    try {
        const { gymId } = req.body;
        const usuario = req.usuario._id;

        const suscripcion = await Suscripcion.findOne({ usuario, activa: true });

        if (!suscripcion) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes suscripción activa'
            });
        }

        // Verificar si ya visitó este gym
        const visitaExistente = suscripcion.gymsVisitados.find(
            v => v.gymId.toString() === gymId
        );

        if (visitaExistente) {
            visitaExistente.sesionesRealizadas += 1;
        } else {
            suscripcion.gymsVisitados.push({
                gymId,
                fechaVisita: new Date(),
                sesionesRealizadas: 1
            });
        }

        await suscripcion.save();

        res.status(200).json({
            exitoso: true,
            mensaje: 'Visita registrada',
            datos: suscripcion
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error',
            error: error.message
        });
    }
};