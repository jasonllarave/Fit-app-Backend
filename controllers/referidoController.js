const crypto = require('crypto');
const Referido = require('../models/Referido');
const User = require('../models/Users');


// GENERAR CÓDIGO DE REFERIDO ÚNICO

function generarCodigo(userId) {
    const hash = crypto.createHash('md5').update(userId + Date.now()).digest('hex');
    return hash.substring(0, 8).toUpperCase();
}

// OBTENER MI LINK DE REFERIDO

exports.miLinkReferido = async (req, res) => {
    try {
        const userId = req.usuario._id;
        let user = await User.findById(userId);
        
        // Si no tiene código, generarlo
        if (!user.codigoReferido) {
            user.codigoReferido = generarCodigo(userId.toString());
            await user.save();
        }
        
        // Contar referidos
        const stats = await Referido.aggregate([
            { $match: { referidor: userId } },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: 1 },
                    registrados: { 
                        $sum: { $cond: [{ $in: ['$estado', ['registrado', 'pagado']] }, 1, 0] }
                    },
                    pagados: { 
                        $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] }
                    },
                    puntos: { $sum: '$puntosGanados' }
                } 
            }
        ]);
        
        res.status(200).json({
            exitoso: true,
            datos: {
                codigo: user.codigoReferido,
                link: `${process.env.FRONTEND_URL}/register?ref=${user.codigoReferido}`,
                stats: stats[0] || { total: 0, registrados: 0, pagados: 0, puntos: 0 }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al generar link de referido',
            error: error.message
        });
    }
};


// REGISTRAR USUARIO CON CÓDIGO DE REFERIDO

exports.registrarConReferido = async (req, res, next) => {
    try {
        const { codigoReferido } = req.body;
        
        if (!codigoReferido) {
            return next(); // No hay código, continuar registro normal
        }
        
        // Buscar al referidor
        const referidor = await User.findOne({ codigoReferido: codigoReferido.toUpperCase() });
        
        if (!referidor) {
            return next(); // Código inválido, continuar sin referido
        }
        
        // Guardar en req para usar después del registro
        req.referidorId = referidor._id;
        req.codigoReferido = codigoReferido.toUpperCase();
        
        next();
        
    } catch (error) {
        next();
    }
};


// PROCESAR REFERIDO DESPUÉS DE REGISTRO EXITOSO

exports.procesarReferido = async (nuevoUsuarioId, referidorId, codigo) => {
    try {
        if (!referidorId || !nuevoUsuarioId) return;
        
        // Crear registro de referido
        const referido = new Referido({
            referidor: referidorId,
            referido: nuevoUsuarioId,
            codigo: codigo,
            estado: 'registrado',
            fechaRegistroReferido: new Date(),
            puntosGanados: 100 // Puntos por registro
        });
        
        await referido.save();
        
        // Actualizar referidor
        await User.findByIdAndUpdate(referidorId, {
            $inc: { 
                totalReferidos: 1,
                'puntos.saldo': 100,
                puntosReferidos: 100
            },
            $push: {
                'puntos.historial': {
                    concepto: `Referido registrado (${codigo})`,
                    cantidad: 100,
                    tipo: 'ganado',
                    fecha: new Date()
                }
            }
        });
        
        // Actualizar nuevo usuario
        await User.findByIdAndUpdate(nuevoUsuarioId, {
            referidoPor: referidorId
        });
        
    } catch (error) {
        console.error('Error procesando referido:', error);
    }
};


// PROCESAR CONVERSIÓN (cuando el referido paga)

exports.procesarConversion = async (usuarioId) => {
    try {
        const referido = await Referido.findOne({ referido: usuarioId, estado: 'registrado' });
        
        if (!referido) return;
        
        // Puntos adicionales por conversión
        const puntosExtra = 500;
        
        referido.estado = 'pagado';
        referido.conversion = true;
        referido.puntosGanados += puntosExtra;
        await referido.save();
        
        // Actualizar referidor
        await User.findByIdAndUpdate(referido.referidor, {
            $inc: { 
                totalReferidosPagados: 1,
                'puntos.saldo': puntosExtra,
                puntosReferidos: puntosExtra
            },
            $push: {
                'puntos.historial': {
                    concepto: 'Referido realizó primer pago',
                    cantidad: puntosExtra,
                    tipo: 'ganado',
                    fecha: new Date()
                }
            }
        });
        
    } catch (error) {
        console.error('Error procesando conversión:', error);
    }
};


// MIS REFERIDOS (lista)

exports.misReferidos = async (req, res) => {
    try {
        const userId = req.usuario._id;
        
        const referidos = await Referido.find({ referidor: userId })
            .populate('referido', 'nombres apellidos email createdAt')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            exitoso: true,
            cantidad: referidos.length,
            datos: referidos
        });
        
    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al cargar referidos',
            error: error.message
        });
    }
};