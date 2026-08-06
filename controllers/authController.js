const User = require('../models/Users');
const jwt = require('jsonwebtoken');

//generar token
const generarToken = (usuario) => {
    return jwt.sign(
        {id: usuario._id, rol: usuario.rol},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    );
};

//POST (register)
exports.registrar = async (req, res) => {
    try{
        const{ nombres, apellidos, email, password, telefono, ciudad, rol, fechaRegistro, tipoUsuario } = req.body;

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


        const usuario = await User.create({nombres, apellidos, email, password, telefono, ciudad, rol, fechaRegistro,   tipoUsuario });

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