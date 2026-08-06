const Sesion = require('../models/Sesion');
const Rutina = require('../models/Rutina');


// CREAR SESION
exports.crearSesion = async (req, res) => {
    try {
        const { rutina, ejercicios, duracionMinutos, sensacion, completada } = req.body;
        const cliente = req.usuario._id;
        
        const rutinaExiste = await Rutina.findById(rutina);

          if (!rutinaExiste) {

            return res.status(404).json({ 
                exitoso: false, 
                mensaje: 'Rutina no encontrada'
             });
        }

          const nuevaSesion = new Sesion({
            rutina,
            cliente,
            gymId: rutinaExiste.gymId,
            ejercicios,
            duracionMinutos,
            sensacion,
            completada: completada !== undefined ? completada : false
        });

        const sesionGuardada = await nuevaSesion.save();

         res.status(201).json({
            exitoso: true,
            mensaje: 'Sesion registrada',
            datos: sesionGuardada
        });

          } catch (error) {
        res.status(500).json({ 
            exitoso: false,
             mensaje: 'Error al crear sesion', 
             error: error.message });
    }
};

// TRAER SESIONES
exports.traerSesiones = async (req, res) => {
    try {
        const { rutina, completada } = req.query;
        const usuarioActual = req.usuario;
        let filtro = {};

           if (usuarioActual.rol === 'usuario') {
            // Un usuario normal solo ve las suyas: esto ya es único, no hace falta filtrar por gym
            filtro.cliente = usuarioActual._id;
            
        } else if (usuarioActual.rol !== 'superadmin' && usuarioActual.gymId) {
            // admin de gym: sí necesita acotar por gym
            filtro.gymId = usuarioActual.gymId;
        }

        if (rutina) filtro.rutina = rutina;
        if (completada !== undefined) filtro.completada = completada === 'true';

        const sesiones = await Sesion.find(filtro)
            .populate('rutina', 'nombre')
            .populate('ejercicios.ejercicio', 'nombre imagen gif')
            .sort({ fecha: -1 });

        res.status(200).json({ 
            exitoso: true, 
            cantidad: sesiones.length, 
            datos: sesiones });

    } catch (error) {
        res.status(500).json({ 
            exitoso: false, 
            mensaje: 'Error al obtener sesiones', 
            error: error.message });
    }
};


// TRAER SESION POR ID
exports.traerSesionPorId = async (req, res) => {
    try {
         const { id } = req.params;
        const sesion = await Sesion.findById(id)
            .populate('rutina', 'nombre ejercicios') //populate; Rellena con los datos reales de la colección Rutina "rutina": { "_id": "...", "nombre": "Mi Rutina", "ejercicios": [...] }
            .populate('ejercicios.ejercicio', 'nombre imagen gif');

         if (!sesion) return res.status(404).json({ 
              exitoso: false,
              mensaje: 'Sesion no encontrada'
             });    

         const esPropietario = sesion.cliente.toString() === req.usuario._id.toString(); //req.usuario = usuario; Viene del middleware proteger Cuando verifica el token, busca el usuario y lo guarda
         const esAdmin = ['admin', 'superadmin'].includes(req.usuario.rol);

         if (!esPropietario && !esAdmin) {
            return res.status(403).json({ 
                exitoso: false, 
                mensaje: 'Sin permiso' 
            });

             }

            res.status(200).json({ 
                exitoso: true,
                datos: sesion });

             } catch (error) {
            res.status(500).json({ 
                exitoso: false,
                mensaje: 'Error', 
                error: error.message });
    }
};   


// ACTUALIZAR SESION
exports.actualizarSesion = async (req, res) => {
    try {
        const { id } = req.params;
        const sesion = await Sesion.findById(id);

         if (!sesion)
             return res.status(404).json({ 
            exitoso: false, 
            mensaje: 'Sesion no encontrada' 
        });

        const esPropietario = sesion.cliente.toString() === req.usuario._id.toString();

        if (!esPropietario) return res.status(403).json({ 
            exitoso: false,
            mensaje: 'Sin permiso' 
        });

        Object.keys(req.body).forEach(campo => sesion[campo] = req.body[campo]); //Object.keys(req.body)Es una variable que representa cada nombre de propiedad Devuelve un array con los nombres de las propiedades (es mas automatico)

        const actualizada = await sesion.save();

        res.status(200).json({ 
            exitoso: true, 
            mensaje: 'Sesion actualizada', 
            datos: actualizada });
    } catch (error) {
        res.status(500).json({ 
            exitoso: false, 
            mensaje: 'Error',
             error: error.message
             });
    }
};


// ELIMINAR SESION
exports.eliminarSesion = async (req, res) => {
    try {
        const { id } = req.params;
        const sesion = await Sesion.findById(id);
        
        if (!sesion) return res.status(404).json({
             exitoso: false,
              mensaje: 'Sesion no encontrada'
             });
        
        const esPropietario = sesion.cliente.toString() === req.usuario._id.toString();
        const esAdmin = ['admin', 'superadmin'].includes(req.usuario.rol);
        
        if (!esPropietario && !esAdmin) 
            return res.status(403).json({
             exitoso: false,
              mensaje: 'Sin permiso' 
            });

        await Sesion.findByIdAndDelete(id);

        res.status(200).json({
             exitoso: true,
              mensaje: 'Sesion eliminada'
             });
    } catch (error) {
        res.status(500).json({ 
            exitoso: false,
             mensaje: 'Error',
              error: error.message 
            });
    }
};