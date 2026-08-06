const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const { historialEjercicio, resumenCliente } = require ('../controllers/progresoController');


router.get('/ejercicio', proteger, historialEjercicio);
router.get('/resumen', proteger, resumenCliente);

module.exports = router;