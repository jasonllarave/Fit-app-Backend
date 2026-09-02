const express = require('express');
const router = express.Router();
const { registrar, login, registrarGym } = require('../controllers/authController');


router.post('/register', registrar);
router.post('/register-gym', registrarGym);
router.post('/login', login);

module.exports = router;