const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const {
    crearSuscripcion,
    traerMiSuscripcion,
    registrarVisita
} = require('../controllers/suscripcionController');

router.post('/', proteger, crearSuscripcion);
router.get('/mi-suscripcion', proteger, traerMiSuscripcion);
router.post('/visita', proteger, registrarVisita);

module.exports = router;