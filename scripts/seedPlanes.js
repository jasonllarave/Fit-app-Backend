require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const planes = [
    // === INDIVIDUOS ===
    {
        slug: 'free',
        familia: 'individuo',
        nombre: 'Gratuito',
        descripcion: 'Perfecto para empezar. 10 rutinas para organizar tu entrenamiento.',
        precioMensualCOP: 0,
        precioAnualCOP: 0,
        maxRutinas: 10,
        maxClientes: 0,
        features: [
            '10 rutinas',
            'ejercicios basicos',
            'progreso basico'
        ],
        recompensasPropias: false,
        analyticsAvanzado: false,
        trialDias: 0,
        visible: true,
        orden: 1
    },
    {
        slug: 'pro',
        familia: 'individuo',
        nombre: 'Pro',
        descripcion: 'Rutinas ilimitadas, recompensas por racha y seguimiento completo.',
        precioMensualCOP: 10000,
        precioAnualCOP: 99000, // 2 meses gratis
        maxRutinas: 1500,
        maxClientes: 0,
        features: [
            'rutinas ilimitadas',
            'historial completo',
            'recompensas racha',
            'analytics basico',
            'dia descanso configurable',
            'sistema referidos'
        ],
        recompensasPropias: false,
        analyticsAvanzado: false,
        trialDias: 14,
        visible: true,
        orden: 2
    },
    {
        slug: 'coach',
        familia: 'individuo',
        nombre: 'Coach',
        descripcion: 'Para entrenadores independientes. Gestiona hasta 20 clientes.',
        precioMensualCOP: 20000,
        precioAnualCOP: 199000,
        maxRutinas: 1500,
        maxClientes: 20,
        features: [
            'todo pro',
            'gestion clientes',
            'rutinas para clientes',
            'seguimiento clientes',
            'marca personal',
            'reportes clientes'
        ],
        recompensasPropias: false,
        analyticsAvanzado: true,
        trialDias: 7,
        visible: true,
        orden: 3
    },
    
    // === GYMS ===
    {
        slug: 'starter',
        familia: 'gym',
        nombre: 'Starter',
        descripcion: 'Ideal para gyms pequeños y boxes de entrenamiento.',
        precioMensualCOP: 80000,
        precioAnualCOP: 799000,
        maxRutinas: 1500,
        maxMiembros: 40,
        maxEntrenadores: 3,
        features: [
            '40 miembros',
            '1 admin',
            'recompensas gym',
            'soporte email',
            'app miembros'
        ],
        recompensasPropias: true,
        analyticsAvanzado: false,
        trialDias: 7,
        visible: true,
        orden: 4
    },
    {
        slug: 'growth',
        familia: 'gym',
        nombre: 'Growth',
        descripcion: 'Para gyms en crecimiento. Hasta 110 miembros y 3 entrenadores.',
        precioMensualCOP: 200000,
        precioAnualCOP: 1999000,
        maxRutinas: 1500,
        maxMiembros: 110,
        maxEntrenadores: 6,
        features: [
            '110 miembros',
            '3 entrenadores',
            'recompensas avanzadas',
            'analytics retencion',
            'invitaciones email',
            'soporte chat'
        ],
        recompensasPropias: true,
        analyticsAvanzado: true,
        trialDias: 7,
        visible: true,
        orden: 5
    },
    {
        slug: 'enterprise',
        familia: 'gym',
        nombre: 'Enterprise',
        descripcion: 'Cadenas y franquicias. Multi-sede, API y white-label.',
        precioMensualCOP: 500000,
        precioAnualCOP: 4999000,
        maxRutinas: 1500,
        maxMiembros: 999999,
        maxEntrenadores: 999,
        features: [
            'miembros ilimitados',
            'entrenadores ilimitados',
            'multisede',
            'api acceso',
            'white label',
            'soporte prioritario',
            'onboarding personalizado'
        ],
        recompensasPropias: true,
        analyticsAvanzado: true,
        trialDias: 7,
        visible: true,
        orden: 6
    }
];

async function seedPlanes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        await Plan.deleteMany({});
        await Plan.insertMany(planes);
        
        console.log(' Planes creados:', planes.length);
        console.log('Individuos:', planes.filter(p => p.familia === 'individuo').map(p => `${p.nombre}: $${p.precioMensualCOP.toLocaleString()}`));
        console.log('Gyms:', planes.filter(p => p.familia === 'gym').map(p => `${p.nombre}: $${p.precioMensualCOP.toLocaleString()}`));
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

seedPlanes();