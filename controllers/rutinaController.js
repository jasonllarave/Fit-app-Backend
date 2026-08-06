const Rutina = require('../models/Rutina');

// CREAR RUTINA
exports.crearRutina = async (req, res) => {
    try {
        const { nombre, descripcion, gymId, cliente, ejercicios, frecuencia, diasSemana, fechaFin } = req.body;
        const usuarioActual = req.usuario;

        let datosRutina = {
            nombre,
            descripcion,
            ejercicios,
            frecuencia,
            diasSemana,
            fechaFin
        };

        // Entrenador/Admin: gymId del body o del usuario
        if (['entrenador', 'admin', 'superadmin'].includes(usuarioActual.rol)) {
            datosRutina.cliente = cliente;
            datosRutina.entrenador = usuarioActual._id;
            datosRutina.gymId = gymId || usuarioActual.gymId; // ← body o perfil
        }
        // Usuario normal: solo para sí, gymId de su perfil
       else if (usuarioActual.rol === 'usuario') {
            datosRutina.cliente = usuarioActual._id;
            datosRutina.entrenador = null;
            datosRutina.gymId = usuarioActual.gymId || null;
        }
        else {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'Rol no autorizado para crear rutinas'
            });
        }

        // Validar gymId SOLO si es usuario de tipo gym
        if (usuarioActual.tipoUsuario === 'gym' && !datosRutina.gymId) {
            return res.status(400).json({
                exitoso: false,
                mensaje: 'El gimnasio es obligatorio para usuarios de gimnasio'
            });
        }

        const nuevaRutina = new Rutina(datosRutina);
        const rutinaGuardada = await nuevaRutina.save();

        res.status(201).json({
            exitoso: true,
            mensaje: 'Rutina creada correctamente',
            datos: rutinaGuardada
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al crear rutina',
            error: error.message
        });
    }
};

// TRAER TODAS LAS RUTINAS
exports.traerRutinas = async (req, res) => {
    try {
        const { gymId, cliente, activa, entrenador } = req.query;
        const usuarioActual = req.usuario;
        
        let filtro = {};

        // Superadmin ve todo (sin filtro de gym)
        if (usuarioActual.rol !== 'superadmin') {
            // Admin/entrenador: solo su gym
            if (usuarioActual.gymId) {
                filtro.gymId = usuarioActual.gymId;
            }
            // Usuario normal: solo sus rutinas (ya filtra cliente abajo)
        }

        if (cliente) filtro.cliente = cliente;
        if (activa !== undefined) filtro.activa = activa === 'true';
        if (entrenador) filtro.entrenador = entrenador;

        // Usuario normal solo ve las suyas
        if (usuarioActual.rol === 'usuario') {
            filtro.cliente = usuarioActual._id;
        }

        const rutinas = await Rutina.find(filtro)
            .populate('cliente', 'nombres apellidos email')
            .populate('entrenador', 'nombres apellidos email')
            .populate('ejercicios.ejercicio', 'nombre imagen gif categoria equipo')
            .sort({ createdAt: -1 });

        res.status(200).json({
            exitoso: true,
            cantidad: rutinas.length,
            datos: rutinas
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener rutinas',
            error: error.message
        });
    }
};

// TRAER UNA RUTINA POR ID
exports.traerRutinaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActual = req.usuario;

        const rutina = await Rutina.findById(id)
            .populate('cliente', 'nombres apellidos email')
            .populate('entrenador', 'nombres apellidos email')
            .populate('ejercicios.ejercicio', 'nombre imagen gif categoria equipo musculoObjetivo instrucciones');

        if (!rutina) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Rutina no encontrada'
            });
        }

        // Verificar permisos
        const esPropietario = rutina.cliente?._id?.toString() === usuarioActual._id.toString();
        const esCreador = rutina.entrenador?._id?.toString() === usuarioActual._id.toString();
        const esAdminOSuper = ['admin', 'superadmin'].includes(usuarioActual.rol);

        if (!esPropietario && !esCreador && !esAdminOSuper) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes permiso para ver esta rutina'
            });
        }

        res.status(200).json({
            exitoso: true,
            datos: rutina
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener rutina',
            error: error.message
        });
    }
};

// ACTUALIZAR RUTINA
exports.actualizarRutina = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActual = req.usuario;

        const rutina = await Rutina.findById(id);

        if (!rutina) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Rutina no encontrada'
            });
        }

        // Verificar permisos
        const esPropietario = rutina.cliente?.toString() === usuarioActual._id.toString();
        const esCreador = rutina.entrenador?.toString() === usuarioActual._id.toString();
        const esAdminOSuper = ['admin', 'superadmin'].includes(usuarioActual.rol);

        if (!esPropietario && !esCreador && !esAdminOSuper) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes permiso para editar esta rutina'
            });
        }

        // Usuario normal NO puede cambiar el cliente
        if (usuarioActual.rol === 'usuario' && req.body.cliente) {
            delete req.body.cliente;
        }

        Object.keys(req.body).forEach(campo => {
            rutina[campo] = req.body[campo];
        });

        const rutinaActualizada = await rutina.save();

        res.status(200).json({
            exitoso: true,
            mensaje: 'Rutina actualizada',
            datos: rutinaActualizada
        });

    } catch (error) {
        res.status(400).json({
            exitoso: false,
            mensaje: 'Error al actualizar rutina',
            error: error.message
        });
    }
};

// DESACTIVAR RUTINA
exports.desactivarRutina = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActual = req.usuario;

        const rutina = await Rutina.findById(id);

        if (!rutina) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Rutina no encontrada'
            });
        }

        // Verificar permisos
        const esPropietario = rutina.cliente?.toString() === usuarioActual._id.toString();
        const esCreador = rutina.entrenador?.toString() === usuarioActual._id.toString();
        const esAdminOSuper = ['admin', 'superadmin'].includes(usuarioActual.rol);

        if (!esPropietario && !esCreador && !esAdminOSuper) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes permiso para desactivar esta rutina'
            });
        }

        rutina.activa = false;
        const rutinaDesactivada = await rutina.save();

        res.status(200).json({
            exitoso: true,
            mensaje: 'Rutina desactivada',
            datos: rutinaDesactivada
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al desactivar rutina',
            error: error.message
        });
    }
};

// ELIMINAR RUTINA
exports.eliminarRutina = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioActual = req.usuario;

        const rutina = await Rutina.findById(id);

        if (!rutina) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Rutina no encontrada'
            });
        }

          // El propietario (cliente) también puede eliminar su propia rutina
        const esPropietario = rutina.cliente?.toString() === usuarioActual._id.toString();
        const esCreador = rutina.entrenador?.toString() === usuarioActual._id.toString();
        const esAdminOSuper = ['admin', 'superadmin'].includes(usuarioActual.rol);

        if (!esPropietario && !esCreador && !esAdminOSuper) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes permiso para eliminar esta rutina'
            });
        }

        await Rutina.findByIdAndDelete(id);

        res.status(200).json({
            exitoso: true,
            mensaje: 'Rutina eliminada permanentemente'
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al eliminar rutina',
            error: error.message
        });
    }
};