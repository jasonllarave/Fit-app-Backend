const Rutina = require('../models/Rutina');
const Sesion = require('../models/Sesion');

// Verifica que el recurso pertenezca al gym del usuario
exports.esDelMismoGym = (modelo) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const documento = await modelo.findById(id);

            if (!documento) {
                return res.status(404).json({
                    exitoso: false,
                    mensaje: 'Recurso no encontrado'
                });
            }

            // Superadmin ve todo
            if (req.usuario.rol === 'superadmin') {
                return next();
            }

            // Admin y entrenador solo ven su gym
            const gymIdUsuario = req.usuario.gymId?.toString();
            const gymIdRecurso = documento.gymId?.toString();

            if (gymIdUsuario !== gymIdRecurso) {
                return res.status(403).json({
                    exitoso: false,
                    mensaje: 'Este recurso no pertenece a tu gimnasio'
                });
            }

             next();

             } catch (error) {
            res.status(500).json({
                exitoso: false,
                mensaje: 'Error al verificar gimnasio',
                error: error.message
            });
        }
    };
}; 
