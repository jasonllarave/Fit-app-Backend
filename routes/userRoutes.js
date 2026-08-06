 const express = require('express');
 const router = express.Router();
 const { proteger } = require('../middleware/auth');
 const {crearUsuario,
        traerUsuarios,
        traerusuarioId,
        actualizarUsuario,
        eliminarUsuario } = require('../controllers/userController');


router.post('/', crearUsuario);
router.get('/', proteger, traerUsuarios);
router.get('/:id', proteger, traerusuarioId);  
router.put('/:id', proteger, actualizarUsuario); 
router.delete('/:id', proteger, eliminarUsuario);


module.exports = router;