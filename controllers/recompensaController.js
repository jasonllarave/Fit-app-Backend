const Recompensa = require('../models/Recompensa');
const Puntos = require('../models/Puntos');
const User = require('../models/Users');

// CREAR RECOMPENSA (admin/superadmin)
exports.crearRecompensa = async (req, res) => {
    try {
        const { nombre, descripcion, tipo, puntosNecesarios, imagen, stock } = req.body;
        const usuarioActual = req.usuario;

        let gymId = null;
        
        if (usuarioActual.rol === 'admin') {
            gymId = usuarioActual.gymId;
        }

        const nuevaRecompensa = new Recompensa({
            nombre,
            descripcion,
            tipo,
            puntosNecesarios,
            gymId,
            imagen,
            stock
        });

        const recompensaGuardada = await nuevaRecompensa.save();

        res.status(201).json({
            exitoso: true,
            mensaje: 'Recompensa creada',
            datos: recompensaGuardada
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al crear recompensa',
            error: error.message
        });
    }
};

// TRAER RECOMPENSAS DISPONIBLES
exports.traerRecompensas = async (req, res) => {
    try {
        const usuarioActual = req.usuario;
        let filtro = { activa: true };

        // Usuario gym: solo recompensas de su gym + globales
        if (usuarioActual.rol === 'usuario' && usuarioActual.tipoUsuario === 'gym') {
            filtro.$or = [
                { gymId: usuarioActual.gymId },
                { gymId: null }
            ];
        }
        // Independiente: solo globales
        else if (usuarioActual.tipoUsuario === 'independiente') {
            filtro.gymId = null;
        }
        // Admin: solo las de su gym
        else if (usuarioActual.rol === 'admin') {
            filtro.gymId = usuarioActual.gymId;
        }
        // Superadmin: todas (sin filtro extra)

        const recompensas = await Recompensa.find(filtro)
            .sort({ puntosNecesarios: 1 });

        res.status(200).json({
            exitoso: true,
            cantidad: recompensas.length,
            datos: recompensas
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener recompensas',
            error: error.message
        });
    }
};

// GANAR PUNTOS (al completar sesión)
exports.ganarPuntos = async (req, res) => {
    try {
        const { cantidad, motivo, sesion } = req.body;
        const usuario = req.usuario._id;

        const nuevoPunto = new Puntos({
            usuario,
            cantidad,
            tipo: 'ganado',
            motivo,
            sesion
        });

        await nuevoPunto.save();

        res.status(201).json({
            exitoso: true,
            mensaje: `Ganaste ${cantidad} puntos`,
            datos: nuevoPunto
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al registrar puntos',
            error: error.message
        });
    }
};

// VER MIS PUNTOS
exports.misPuntos = async (req, res) => {
    try {
        const usuario = req.usuario._id;

        const historial = await Puntos.find({ usuario })
            .sort({ createdAt: -1 });   //createdAt es un campo automático que MongoDB genera cuando creas un documento. Guarda la fecha y hora exacta de creación.

        const totalGanados = historial
            .filter(p => p.tipo === 'ganado' || p.tipo === 'bono')
            .reduce((sum, p) => sum + p.cantidad, 0);

        const totalCanjeados = historial
            .filter(p => p.tipo === 'canjeado')
            .reduce((sum, p) => sum + Math.abs(p.cantidad), 0);

        const saldo = totalGanados - totalCanjeados;

        res.status(200).json({
            exitoso: true,
            datos: {
                saldo,
                totalGanados,
                totalCanjeados,
                historial
            }
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener puntos',
            error: error.message
        });
    }
};

// CANJEAR RECOMPENSA
exports.canjearRecompensa = async (req, res) => {
    try {
        const { recompensaId } = req.body;
        const usuario = req.usuario._id;

        const recompensa = await Recompensa.findById(recompensaId);

        if (!recompensa || !recompensa.activa) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Recompensa no disponible'
            });
        }

        // Verificar stock
        if (recompensa.stock !== -1 && recompensa.stock <= 0) {
            return res.status(400).json({
                exitoso: false,
                mensaje: 'Recompensa agotada'
            });
        }

        // Calcular saldo
        const historial = await Puntos.find({ usuario });
        const totalGanados = historial
            .filter(p => p.tipo === 'ganado' || p.tipo === 'bono')
            .reduce((sum, p) => sum + p.cantidad, 0);
        const totalCanjeados = historial
            .filter(p => p.tipo === 'canjeado')
            .reduce((sum, p) => sum + Math.abs(p.cantidad), 0);
        const saldo = totalGanados - totalCanjeados;

        if (saldo < recompensa.puntosNecesarios) {
            return res.status(400).json({
                exitoso: false,
                mensaje: `Saldo insuficiente. Tienes ${saldo}, necesitas ${recompensa.puntosNecesarios}`
            });
        }

        // Descontar puntos
        const canje = new Puntos({
            usuario,
            cantidad: -recompensa.puntosNecesarios,
            tipo: 'canjeado',
            motivo: `Canje: ${recompensa.nombre}`,
            recompensa: recompensaId
        });

        await canje.save();

        // Reducir stock
        if (recompensa.stock !== -1) {
            recompensa.stock -= 1;
            await recompensa.save();
        }

        res.status(200).json({
            exitoso: true,
            mensaje: `Canje exitoso: ${recompensa.nombre}`,
            datos: { recompensa, puntosRestantes: saldo - recompensa.puntosNecesarios }
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al canjear',
            error: error.message
        });
    }
};