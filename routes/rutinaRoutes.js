const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const {
    crearRutina,
    traerRutinas,
    traerRutinaPorId,
    actualizarRutina,
    desactivarRutina,
    eliminarRutina
} = require('../controllers/rutinaController');

// Todas las rutas protegidas (el controlador valida el rol)
router.post('/', proteger, crearRutina);
router.get('/', proteger, traerRutinas);
router.get('/:id', proteger, traerRutinaPorId);
router.put('/:id', proteger, actualizarRutina);
router.patch('/:id/desactivar', proteger, desactivarRutina);
router.delete('/:id', proteger, eliminarRutina);

module.exports = router;