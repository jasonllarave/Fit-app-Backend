const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const {
    traerEjercicios,
    traerEjercicioPorId,
    traerFiltros
} = require('../controllers/ejercicioController');


// Rutas públicas (no necesitan token)
router.get('/', traerEjercicios);
router.get('/filtros', traerFiltros);
router.get('/:id', traerEjercicioPorId);

module.exports = router;