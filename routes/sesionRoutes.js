const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const { crearSesion, traerSesiones, traerSesionPorId,  
        actualizarSesion,
        eliminarSesion } = require ('../controllers/sesionController')

router.post('/', proteger, crearSesion);
router.get('/', proteger, traerSesiones);
router.get('/:id', proteger, traerSesionPorId);
router.put('/:id', proteger, actualizarSesion);
router.delete('/:id', proteger, eliminarSesion);

module.exports = router;