const express = require('express');
const router = express.Router();
const { proteger, restringirA } = require('../middleware/auth');
const {
    crearRecompensa,
    traerRecompensas,
    actualizarRecompensa,
    eliminarRecompensa,
    ganarPuntos,
    misPuntos,
    canjearRecompensa
} = require('../controllers/recompensaController');

router.post('/', proteger, restringirA('admin', 'superadmin'), crearRecompensa);
router.get('/', proteger, traerRecompensas);
router.put('/:id', proteger, actualizarRecompensa); // editar o activar/desactivar
router.delete('/:id', proteger, eliminarRecompensa);
router.post('/puntos', proteger, ganarPuntos);
router.get('/mis-puntos', proteger, misPuntos);
router.post('/canjear', proteger, canjearRecompensa);

module.exports = router;