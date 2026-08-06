const Ejercicio = require('../models/Ejercicio');


// Diccionario de traducciones
const nombresLegibles = {
    // Categorías
    'back': 'Espalda',
    'cardio': 'Cardio',
    'chest': 'Pecho',
    'lower arms': 'Antebrazos',
    'lower legs': 'Piernas Inferiores',
    'neck': 'Cuello',
    'shoulders': 'Hombros',
    'upper arms': 'Brazos Superiores',
    'upper legs': 'Piernas Superiores',
    'waist': 'Cintura',
    
    // Equipos comunes
    'dumbbell': 'Mancuernas',
    'barbell': 'Barra',
    'body weight': 'Peso Corporal',
    'cable': 'Cable',
    'kettlebell': 'Pesa Rusa',
    'smith machine': 'Máquina Smith',
    'leverage machine': 'Máquina de Palanca',
    'stability ball': 'Balón de Estabilidad',
    'medicine ball': 'Balón Medicinal',
    'resistance band': 'Banda de Resistencia',
    'assisted': 'Asistido',
    'band': 'Banda',
    'bosu ball': 'Bosu',
    'elliptical machine': 'Elíptica',
    'ez barbell': 'Barra EZ',
    'hammer': 'Martillo',
    'olympic barbell': 'Barra Olímpica',
    'roller': 'Rodillo',
    'rope': 'Cuerda',
    'skierg machine': 'Skierg',
    'sled machine': 'Trineo',
    'stationary bike': 'Bicicleta Estática',
    'stepmill machine': 'Stepmill',
    'tire': 'Llanta',
    'trap bar': 'Barra Hexagonal',
    'upper body ergometer': 'Ergómetro Superior',
    'weighted': 'Con Peso',
    'wheel roller': 'Rueda Abdominal'
};

// TRAER TODOS LOS EJERCICIOS
exports.traerEjercicios = async (req, res) => {
    try {
        const { categoria, equipo, musculo, busqueda } = req.query;
        
        let filtro = {};
        let filtrosAplicados = {};

        if (categoria) {
            filtro.categoria = categoria;
            filtrosAplicados.categoria = {
                clave: categoria,
                nombre: nombresLegibles[categoria] || categoria
            };
        }
        
        if (equipo) {
            filtro.equipo = equipo;
            filtrosAplicados.equipo = {
                clave: equipo,
                nombre: nombresLegibles[equipo] || equipo
            };
        }
        
        if (musculo) {
            filtro.musculoObjetivo = musculo;
            filtrosAplicados.musculo = {
                clave: musculo,
                nombre: musculo.charAt(0).toUpperCase() + musculo.slice(1)
            };
        }
        
        if (busqueda) {
            filtro.nombre = { $regex: busqueda, $options: 'i' };
            filtrosAplicados.busqueda = {
                clave: busqueda,
                nombre: `"${busqueda}"`
            };
        }

        const ejercicios = await Ejercicio.find(filtro).sort({ nombre: 1 });

        res.status(200).json({
            exitoso: true,
            cantidad: ejercicios.length,
            filtros: filtrosAplicados,
            datos: ejercicios
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener ejercicios',
            error: error.message
        });
    }
};


// TRAER UN EJERCICIO POR ID
exports.traerEjercicioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const ejercicio = await Ejercicio.findById(id);

        if (!ejercicio) {
            return res.status(404).json({
                exitoso: false,
                mensaje: 'Ejercicio no encontrado'
            });
        }

        res.status(200).json({
            exitoso: true,
            datos: ejercicio
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener ejercicio',
            error: error.message
        });
    }
};


// TRAER CATEGORIAS, EQUIPOS Y MUSCULOS PARA FILTROS
exports.traerFiltros = async (req, res) => {
    try {
        const categorias = await Ejercicio.distinct('categoria');
        const equipos = await Ejercicio.distinct('equipo');
        const musculos = await Ejercicio.distinct('musculoObjetivo');

        res.status(200).json({
            exitoso: true,
            datos: {
                categorias,
                equipos,
                musculos
            }
        });

    } catch (error) {
        res.status(500).json({
            exitoso: false,
            mensaje: 'Error al obtener filtros',
            error: error.message
        });
    }
};
