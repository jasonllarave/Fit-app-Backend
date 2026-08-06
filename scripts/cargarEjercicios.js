const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Ejercicio = require('../models/Ejercicio');



async function cargarDatos() {
    try {

         // 1) Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectada');

         // 2) Leer el archivo JSON
        const rutaJson = path.join(__dirname, '../data/exercises.json');
        const datos = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));
        
        console.log(`Encontrados ${datos.length} ejercicios en el JSON`);

         // 3) Limpiar colección existente
        await Ejercicio.deleteMany({});
        console.log('Colección de ejercicios limpiada');

         // 4) Transformar datos
        const ejerciciosParaGuardar = [];

         for (let i = 0; i < datos.length; i++) {
            const ejercicio = datos[i];

        // 5) Obtener solo el nombre del archivo de la ruta
        const nombreImagen = ejercicio.image.split('/').pop();
        const nombreGif = ejercicio.gif_url.split('/').pop();  
        
        
          ejerciciosParaGuardar.push({
                idEjercicio: ejercicio.id,
                nombre: ejercicio.name,
                categoria: ejercicio.category,
                parteCuerpo: ejercicio.body_part,
                equipo: ejercicio.equipment,
                musculoObjetivo: ejercicio.target,
                grupoMuscular: ejercicio.muscle_group,
                musculosSecundarios: ejercicio.secondary_muscles || [],
                instrucciones: {
                    es: ejercicio.instructions.es,
                    en: ejercicio.instructions.en
                },
                idMedia: ejercicio.media_id,
                imagen: `/imagenes/${nombreImagen}`,
                gif: `/videos/${nombreGif}`
            });
        }

        // 6) Guardar en MongoDB
        await Ejercicio.insertMany(ejerciciosParaGuardar);
        console.log(`${ejerciciosParaGuardar.length} ejercicios guardados en MongoDB`);

        // 7) Mostrar categorías únicas
        const categorias = await Ejercicio.distinct('categoria');
        console.log('Categorías disponibles:', categorias);

        // 8) Mostrar equipos únicos
        const equipos = await Ejercicio.distinct('equipo');
        console.log('Equipos disponibles:', equipos);


        process.exit(0);

        } catch (error) {
        console.error('Error al cargar ejercicios:', error.message);
        process.exit(1);
        
            }
       }

       cargarDatos();

       //luego de esto agregar script en el package.json

       //asi: {
 // "name": "proyecto-mean",
 // "version": "1.0.0",
 // "scripts": {
 //  "start": "node app.js",
 // "cargar": "node scripts/cargarEjercicios.js"
 // },
 //"dependencies": {
 //   ...
 // }
//}


//npm run cargar  (con esto inicio la carga del dataset a mongo)