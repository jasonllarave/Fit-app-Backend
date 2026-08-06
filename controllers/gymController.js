const Gym = require('../models/Gym');

// CREAR GIMNASIO
exports.crearGimnasio = async (req, res) => {
    try {
        const { nombre, direccion, telefono, ciudad, emailContacto, plan } = req.body;

        if (!nombre || !direccion || !telefono) {
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Nombre, dirección y teléfono son obligatorios'
            });
        }

        const  nuevoGimnasio = new Gym({
            nombre,
            direccion,
            telefono,
            ciudad,
            emailContacto,
            plan,
            activo: true 
        });

        const gimnasioGuardado = await nuevoGimnasio.save();

        res.status(201).json({
            exitoso: true,
            mensaje: 'Gimnasio creado exitosamente',
            datos: gimnasioGuardado
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al crear gimnasio',
            error: error.message
        });
    }
};


// TRAER TODOS LOS GIMNASIOS
exports.traerGimnasios = async (req, res) => {
    try {
        const gimnasios = await Gym.find({ activo: true });

        res.status(200).json({
            exitoso: true,
            cantidad: gimnasios.length,
            datos: gimnasios
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener gimnasios',
            error: error.message
        });
    }
};

// TRAER UN GIMNASIO POR ID
exports.traerGimnasioId = async (req, res) => {
    try {
        const { id } = req.params;
        const gimnasio = await Gym.findById(id);

        if (!gimnasio) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encontró el gimnasio'
            });
        }

        res.status(200).json({
            exitoso: true,
            datos: gimnasio
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener el gimnasio',
            error: error.message
        });
    }
};

// ACTUALIZAR GIMNASIO
exports.actualizarGimnasio = async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const gimnasioActualizado = await Gym.findByIdAndUpdate(
            id,
            datosActualizados,
            { new: true, runValidators: true }
        );

        if (!gimnasioActualizado) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encontró el gimnasio'
            });
        }

        res.status(200).json({
            exitoso: true,
            mensaje: 'Gimnasio actualizado',
            datos: gimnasioActualizado
        });

    } catch (error) {
        res.status(400).json({
            exitoso: false,
            mensaje: 'Error al actualizar gimnasio',
            error: error.message
        });
    }
};

// ELIMINAR GIMNASIO (soft delete)
exports.eliminarGimnasio = async (req, res) => {
    try {
        const { id } = req.params;

        const gimnasioEliminado = await Gym.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!gimnasioEliminado) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encontró el gimnasio'
            });
        }

        res.status(200).json({
            exitoso: true,
            mensaje: 'Gimnasio desactivado exitosamente',
            datos: gimnasioEliminado
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al desactivar gimnasio',
            error: error.message
        });
    }
};


// ELIMINAR GIMNASIO PERMANENTEMENTE (solo superadmin)
exports.eliminarGimnasioPermanente = async (req, res) => {
    try {
        const { id } = req.params;

        const gimnasioEliminado = await Gym.findByIdAndDelete(id);

        if (!gimnasioEliminado) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encontró el gimnasio'
            });
        }

        res.status(200).json({
            exitoso: true,
            mensaje: 'Gimnasio eliminado permanentemente',
            datos: gimnasioEliminado
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al eliminar gimnasio',
            error: error.message
        });
    }
};

// ACTIVAR/DESACTIVAR RECOMPENSAS DEL GYM
exports.toggleRecompensas = async (req, res) => {
    try {
        const { id } = req.params;
        const { recompensasActivas } = req.body;
        const usuarioActual = req.usuario;

        // Solo admin del gym o superadmin
        const gym = await Gym.findById(id);

        if (!gym) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Gimnasio no encontrado'
            });
        }

        const esAdminDelGym = usuarioActual.gymId?.toString() === id && usuarioActual.rol === 'admin';
        const esSuperadmin = usuarioActual.rol === 'superadmin';

        if (!esAdminDelGym && !esSuperadmin) {
            return res.status(403).json({
                exitoso: false,
                mensaje: 'No tienes permiso para modificar este gimnasio'
            });
        }

        gym.recompensasActivas = recompensasActivas;
        await gym.save();

        res.status(200).json({
            exitoso: true,
            mensaje: `Recompensas ${recompensasActivas ? 'activadas' : 'desactivadas'}`,
            datos: gym
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al actualizar recompensas',
            error: error.message
        });
    }
};