const User = require('../models/Users');

// CREAR USUARIO (POST)
exports.crearUsuario = async (req, res) => {

    try{
        
        const {nombres, apellidos, email, password, telefono, ciudad, rol, tipoUsuario, gymId} = req.body;

        const nuevoUsuario = new User({
            nombres,
            apellidos,
            email,
            password,
            telefono,
            ciudad,
            rol,
            tipoUsuario: tipoUsuario || 'independiente',
            gymId: gymId || null
        });

        const usuarioGuardado = await nuevoUsuario.save();

        res.status(201).json({
            exitoso: true,
            mensaje: 'creado exitosamente el usuario',
            datos: usuarioGuardado
        });


    }catch(error){
        res.status(400).json({
            exitoso: false,
            mensaje: 'error no se ha creado el usuario',
            error: error.message
        });

    }

};


//TRAER TODOS LOS USUARIOS (GET)
exports.traerUsuarios = async (req, res) => {
    try{
        const usuarios = await User.find();

        res.status(200).json({
            exitoso: true,
            cantidad: usuarios.length,
            datos: usuarios
        })

    } catch (error){
        res.status(500).json({
            exitoso:false,
            mensaje: 'Error no se ha obtenido usuarios',
            error: error.message
        });    

    }
};


//TRAER UN USUARIO POR ID (GET)
exports.traerusuarioId = async(req, res) => {
    try{
        const { id } = req.params;
        const usuario = await User.findById(id);

        if(!usuario){
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encontro el usuario'
            });
        }

        res.status(200).json({
            exitoso: true,
            datos: usuario
        });

    }catch(error){
        res.status(500).json({
             exitoso: false,
             mensaje: 'Error no se obtuvo el usuario',
             error: error.message
        })
       

    }
};


//ACTUALIZAR USUARIO (PUT)
exports.actualizarUsuario = async (req, res) => {

    try{
        const {id} = req.params;
        const datosActualizados = req.body;

        const usuarioActualizado = await User.findByIdAndUpdate(
            id,
            datosActualizados,
             {new: true, runValidators:true} //{ new: true } → hace que la función devuelva el documento actualizado, no el anterior.
                                             // {runValidators:true} → hace que se aplique las validaciones definidas en el esquema al momento de actualizar (ejemplo min 2 caracteres)
        );

        if(!usuarioActualizado){
            return res.status(404).json({
                exitoso: true,
                mensaje: 'No se encontró el usuario'
            });
        }
        res.status(200).json({
            exitoso: true,
            mensaje: 'Se ha actualizado el usuario',
            datos: usuarioActualizado
        })

    }catch(error){
        res.status(400).json({
            exitoso: false,
            mensaje: 'Error al actualizar usuario',
            error: error.message
        });

    }

};



//ELIMINAR USUARIO (DELETE)
exports.eliminarUsuario = async(req, res) => {
    try{

        const {id} = req.params;
        const usuarioEliminado = await User.findByIdAndDelete(id);

        if(!usuarioEliminado){
            return res.status(404).json({
                exitoso: false,
                mensaje: 'No se encuentra el usuario'
            })
        }

        res.status(200).json({
            exitoso: true,
            mensaje: 'Usuario se elimino exitosamente',
            datos: usuarioEliminado
        });
    }catch(error){
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error no elimino el usuario',
            error: error.message
        });
    }
};