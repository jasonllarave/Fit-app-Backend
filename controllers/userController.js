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


//TRAER USUARIOS DE UN GYM POR GYMID (GET) — para el admin del gimnasio
exports.traerUsuariosGym = async (req, res) => {
    try{
        const { gymId } = req.params;
        const usuarios = await User.find({ gymId });

        res.status(200).json({
            exitoso: true,
            cantidad: usuarios.length,
            datos: usuarios
        })

    } catch (error){
        res.status(500).json({
            exitoso:false,
            mensaje: 'Error no se ha obtenido los usuarios del gym',
            error: error.message
        });    
    }
};


//ESTADÍSTICAS GLOBALES DE LA PLATAFORMA (GET) — solo superadmin
//Devuelve: totales de la app, usuarios por tipo y cada gym con sus métricas
exports.estadisticasGlobales = async (req, res) => {
    try {
        const Gym = require('../models/Gym');
        const Sesion = require('../models/Sesion');
        const Puntos = require('../models/Puntos');
        const Recompensa = require('../models/Recompensa');

        // 1. Consultas en paralelo (Promise.all las ejecuta a la vez, no una por una)
        const [usuarios, gyms, sesionesCompletadas, puntosGanados, canjes, recompensas] = await Promise.all([
            User.find().select('nombres apellidos email rol tipoUsuario gymId suscripcionActiva fechaRegistro createdAt'),
            Gym.find().sort({ createdAt: -1 }),
            Sesion.countDocuments({ completada: true }),
            Puntos.find({ tipo: 'ganado' }),
            Puntos.countDocuments({ tipo: 'canjeado' }),
            Recompensa.find()
        ]);

        // 2. Calcular puntos repartidos (suma de todos los "ganado")
        const puntosRepartidos = puntosGanados.reduce((sum, p) => sum + p.cantidad, 0);

        // 3. Contar usuarios por tipo
        const usuariosGym = usuarios.filter(u => u.tipoUsuario === 'gym').length;
        const usuariosIndependientes = usuarios.filter(u => u.tipoUsuario === 'independiente').length;

        // 4. Por cada gym, calcular sus métricas
        const gymsConMetricas = await Promise.all(gyms.map(async (gym) => {
            const clientesGym = usuarios.filter(u => u.gymId && u.gymId.toString() === gym._id.toString());
            const suscripcionesActivas = clientesGym.filter(u => u.suscripcionActiva).length;
            const sesionesGym = await Sesion.countDocuments({ gymId: gym._id, completada: true });
            const recompensasGym = recompensas.filter(r => r.gymId && r.gymId.toString() === gym._id.toString());

            return {
                _id: gym._id,
                nombre: gym.nombre,
                ciudad: gym.ciudad,
                plan: gym.plan,
                activo: gym.activo,
                recompensasActivas: gym.recompensasActivas,
                modoRecompensas: gym.modoRecompensas,
                emailContacto: gym.emailContacto,
                clientes: clientesGym.length,
                suscripcionesActivas,
                sesionesCompletadas: sesionesGym,
                recompensasPropias: recompensasGym.length
            };
        }));

        res.status(200).json({
            exitoso: true,
            datos: {
                totales: {
                    usuarios: usuarios.length,
                    gyms: gyms.length,
                    sesionesCompletadas,
                    puntosRepartidos,
                    canjes,
                    recompensas: recompensas.length
                },
                porTipo: {
                    gym: usuariosGym,
                    independiente: usuariosIndependientes
                },
                gyms: gymsConMetricas,
                usuarios
            }
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener estadísticas globales',
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