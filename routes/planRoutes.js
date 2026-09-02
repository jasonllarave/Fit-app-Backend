const express = require('express');
const router = express.Router();
const { traerPlanes, traerPlanPorSlug } = require('../controllers/planController');

router.get('/', traerPlanes);
router.get('/:slug', traerPlanPorSlug);

module.exports = router;