const User = require('../models/Users');
const Gym = require('../models/Gym');
const Plan = require('../models/Plan');
const jwt = require('jsonwebtoken');
const Suscripcion = require('../models/Suscripcion');

//generar token
const generarToken = (usuario) => {
    return jwt.sign(
        {id: usuario._id, rol: usuario.rol},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    );
};

//POST (register) — soporta 3 flujos: independiente | cliente_gym (con gymId) | admin_gym via /register-gym
exports.registrar = async (req, res) => {
    try{
        const{ nombres, apellidos, email, password, telefono, ciudad, rol, fechaRegistro, tipoUsuario, gymId } = req.body;

        if (!nombres || !email || !password){
            return res.status(400).json({
                exitos: false,
                mensaje: 'EL nombre, email y contraseña son requeridos'
            });
        }


        const usuarioExiste = await User.findOne({email});
        if(usuarioExiste){
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Email ya esta registrado'
            });
        }

        // Validar gymId si viene (flujo cliente_gym)
        let gymIdValidado = null;
        if (tipoUsuario === 'gym' && gymId) {
            try {
                const gym = await Gym.findById(gymId);
                if (!gym || !gym.activo) {
                    return res.status(400).json({ exitoso: false, mensaje: 'El gimnasio seleccionado no existe o no está activo' });
                }
                gymIdValidado = gym._id;
            } catch (e) {
                return res.status(400).json({ exitoso: false, mensaje: 'gymId inválido' });
            }
        }

        const usuario = await User.create({nombres, apellidos, email, password, telefono, ciudad, rol, fechaRegistro, tipoUsuario, gymId: gymIdValidado });

        const token = generarToken(usuario);

        res.status(201).json({
            exitoso: true,
            mensaje: 'Se ha registrado el usuario exitosamente',
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombres,
                email: usuario.email,
                rol: usuario.rol,
                tipoUsuario: usuario.tipoUsuario,   
                gymId: usuario.gymId          
            }
        });

    }catch(error){
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al registrar usuario',
            error: error.message
        });

    }
};


//POST (login)
exports.login = async (req, res) => {

    try{
        const {email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Email y contraseña son requeridos'
            });
        }

        const usuario = await User.findOne({email}).select('+password');

        if(!usuario){
            return res.status(401).json({
                exitoso: false,
                mensaje: 'Credenciales no validas'
            });
        }

        const passwordCorrecta = await usuario.compararPassword(password);
        if(!passwordCorrecta){
            return res.status(401).json({
                exitoso: false,
                mensaje: 'Contraseña invalida'
            });
        } 

        const token = generarToken(usuario);

        res.status(200).json({
            exitoso: true,
            mensaje: 'Login exitoso',
            token,
            usuario:{
                id: usuario._id,
                nombre: usuario.nombres,
                email: usuario.email,
                rol: usuario.rol,
                tipoUsuario: usuario.tipoUsuario,
                gymId: usuario.gymId 
            }
        })

    }catch(error){
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al iniciar sesion',
            error: error.message
        });
    }

};


exports.registrarGym = async (req, res) => {
    try {
        const { nombreGym, direccion, telefonoGym, ciudadGym, emailContacto, nombres, apellidos, email, password, telefono, planSlug } = req.body;

        if (!nombreGym || !direccion || !email || !password || !nombres) {

            return res.status(400).json({ 
                exitoso: false, 
                mensaje: 'Nombre del gym, dirección, datos del admin y contraseña son obligatorios' });
        }

        const plan = await Plan.findOne({ slug: planSlug || 'starter', familia: 'gym' });

        if (!plan) return res.status(400).json({
             exitoso: false, 
             mensaje: 'Plan no válido' });

        const existeEmail = await User.findOne({ email: email.trim() });

        if (existeEmail) return res.status(400).json({
             exitoso: false, 
             mensaje: 'El email ya está registrado' });

        const gym = await Gym.create({
            nombre: nombreGym, direccion, telefono: telefonoGym || 'no especificado', ciudad: ciudadGym || 'no especificada',
            emailContacto: emailContacto || email.trim(), plan: plan.slug, activo: true
        });

        const admin = await User.create({
            nombres, apellidos, email: email.trim(), password: password.trim(), telefono,
            ciudad: ciudadGym || 'no especificada', rol: 'admin', tipoUsuario: 'gym', gymId: gym._id
        });

        // Guardar adminId si el modelo lo soporta (opcional)
        try {
            gym.adminId = admin._id;
            await gym.save();
        } catch (e) {
            // Si el modelo no tiene adminId, ignorar - el vínculo ya está en User.gymId
        }

        // Crear suscripción compatible con el modelo actual (usuario + tipo + fechaFin)
        try {
            await Suscripcion.create({
                usuario: admin._id,
                tipo: 'mensual',
                fechaFin: new Date(Date.now() + (plan.trialDias || 7) * 24 * 60 * 60 * 1000),
                activa: true
            });
        } catch (e) {
            console.warn('No se pudo crear suscripción:', e.message);
        }

        const token = generarToken(admin);

        res.status(201).json({
            exitoso: true, mensaje: 'Gimnasio registrado. Comienza tu prueba.', token,
            usuario: { id: admin._id, nombre: admin.nombres, email: admin.email, rol: admin.rol, tipoUsuario: admin.tipoUsuario, gymId: admin.gymId },
            gym: { id: gym._id, nombre: gym.nombre, plan: gym.plan }
        });

    } catch (error) {
        res.status(500).json({ exitoso: false, mensaje: 'Error al registrar gimnasio', error: error.message });
    }
};