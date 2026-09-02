 const express = require('express');
 const router = express.Router();
 const { proteger, restringirA } = require('../middleware/auth');
 const {crearUsuario,
        traerUsuarios,
        traerUsuariosGym,
        estadisticasGlobales,
        traerusuarioId,
        actualizarUsuario,
        eliminarUsuario } = require('../controllers/userController');


router.post('/', crearUsuario);
router.get('/', proteger, restringirA('superadmin'), traerUsuarios); // SUPERADMIN: ver todos los usuarios
router.get('/estadisticas', proteger, restringirA('superadmin'), estadisticasGlobales); // SUPERADMIN: estadísticas globales (antes de /:id para que no la capture como id)
router.get('/gym/:gymId', proteger, traerUsuariosGym);  // ADMIN GYM: usuarios de su gimnasio
router.get('/:id', proteger, traerusuarioId);  
router.put('/:id', proteger, actualizarUsuario); 
router.delete('/:id', proteger, eliminarUsuario);


module.exports = router;
