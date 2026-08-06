const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const {
    crearRecompensa,
    traerRecompensas,
    ganarPuntos,
    misPuntos,
    canjearRecompensa
} = require('../controllers/recompensaController');

router.post('/', proteger, crearRecompensa);
router.get('/', proteger, traerRecompensas);
router.post('/puntos', proteger, ganarPuntos);
router.get('/mis-puntos', proteger, misPuntos);
router.post('/canjear', proteger, canjearRecompensa);

module.exports = router;