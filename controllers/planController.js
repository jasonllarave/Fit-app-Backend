const Plan = require('../models/Plan');

exports.traerPlanes = async (req, res) => {
    try {
        const { familia } = req.query;
        const filtro = { visible: true };
        if (familia) filtro.familia = familia;
        
        const planes = await Plan.find(filtro).sort({ orden: 1 });
        res.status(200).json({ 
            exitoso: true, 
            cantidad: planes.length, 
            datos: planes });
    } catch (error) {
        res.status(500).json({
             exitoso: false,
              mensaje: 'Error al obtener planes',
               error: error.message });
    }
};

exports.traerPlanPorSlug = async (req, res) => {
    try {
        const plan = await Plan.findOne({ slug: req.params.slug, visible: true });
        
        if (!plan) return res.status(404).json({
             exitoso: false,
              mensaje: 'Plan no encontrado' });

        res.status(200).json({ 
            exitoso: true,
             datos: plan });
    } catch (error) {
        res.status(500).json({
             exitoso: false, 
             mensaje: 'Error al obtener plan', 
             error: error.message });
    }
};