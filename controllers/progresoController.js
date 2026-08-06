const Sesion = require('../models/Sesion');



// HISTORIAL DE PESO POR EJERCICIO
exports.historialEjercicio = async (req, res) => {
    try {
        const { ejercicio, cliente } = req.query;
        const usuarioActual = req.usuario;

        // Si es usuario normal, solo ve su propio progreso
        let clienteId = cliente;

        if (usuarioActual.rol === 'usuario') {
            clienteId = usuarioActual._id.toString();
        }

         if (!ejercicio || !clienteId) {
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Se requiere ejercicio y cliente'
            });
        }

        // Buscar sesiones que contengan ese ejercicio
        const sesiones = await Sesion.find({
            cliente: clienteId,
            'ejercicios.ejercicio': ejercicio,
            completada: true
        })
        .select('fecha ejercicios duracionMinutos')
        .sort({ fecha: 1 });

          // Extraer solo las series de ese ejercicio
        const historial = [];

        sesiones.forEach(sesion => {
            const ejercicioSesion = sesion.ejercicios.find(
                e => e.ejercicio.toString() === ejercicio
            );
            
            if (ejercicioSesion) {
                // Tomar el peso máximo de la sesión
                const pesoMaximo = Math.max(...ejercicioSesion.series.map(s => s.pesoReal));
                const repeticionesTotales = ejercicioSesion.series.reduce((sum, s) => sum + s.repeticionesRealizadas, 0);

                historial.push({
                    fecha: sesion.fecha,
                    pesoMaximo,
                    repeticionesTotales,
                    seriesCompletadas: ejercicioSesion.series.filter(s => s.completada).length,
                    duracionMinutos: sesion.duracionMinutos
                });
            }
        });

          res.status(200).json({
            exitoso: true,
            cantidad: historial.length,
            datos: historial
        });

         } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener historial',
            error: error.message
        });
    }
};


// RESUMEN GENERAL DEL CLIENTE
exports.resumenCliente = async (req, res) => {
    try {
        const { cliente } = req.query;
        const usuarioActual = req.usuario;

        let clienteId = cliente;

        if (usuarioActual.rol === 'usuario') {
            clienteId = usuarioActual._id.toString();
        }

        const totalSesiones = await Sesion.countDocuments({ cliente: clienteId, completada: true });
        
        const sesiones = await Sesion.find({ cliente: clienteId, completada: true });

        const ejerciciosUnicos = new Set();

        let totalSeries = 0;
        let pesoMaximoGlobal = 0;

        sesiones.forEach(sesion => {
            sesion.ejercicios.forEach(ej => {
                ejerciciosUnicos.add(ej.ejercicio.toString());
                totalSeries += ej.series.length;
                ej.series.forEach(s => {
                    if (s.pesoReal > pesoMaximoGlobal) pesoMaximoGlobal = s.pesoReal;
                });
            });
        });

         res.status(200).json({
            exitoso: true,
            datos: {
                totalSesiones,
                totalSeries,
                ejerciciosDiferentes: ejerciciosUnicos.size,
                pesoMaximoGlobal,
                primeraSesion: sesiones.length > 0 ? sesiones[0].fecha : null,
                ultimaSesion: sesiones.length > 0 ? sesiones[sesiones.length - 1].fecha : null
            }
        });

        } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener resumen',
            error: error.message
        });
    }
};
