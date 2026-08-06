const express = require('express');
const router = express.Router();
const { proteger } = require('../middleware/auth');
const {
    crearGimnasio,
    traerGimnasios,
    traerGimnasioId,
    actualizarGimnasio,
    eliminarGimnasio,
    eliminarGimnasioPermanente,
    toggleRecompensas
} = require('../controllers/gymController');

router.post('/', proteger, crearGimnasio);
router.get('/', proteger, traerGimnasios);
router.get('/:id', proteger, traerGimnasioId);
router.put('/:id', proteger, actualizarGimnasio);
router.delete('/:id', proteger, eliminarGimnasio); //soft (Cambia activo: false)
router.delete('/:id/permanente', proteger, eliminarGimnasioPermanente); //hard (Borra el documento de MongoDB)
router.patch('/:id/recompensas', proteger, toggleRecompensas);

module.exports = router;