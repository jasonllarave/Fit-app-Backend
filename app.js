require('dotenv').config();
const express = require('express');
const conexionDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gymRoutes = require('./routes/gymRoutes');
const ejercicioRoutes = require('./routes/ejercicioRoutes');
const rutinaRoutes = require('./routes/rutinaRoutes');
const sesionRoutes = require('./routes/sesionRoutes');
const progresoRoutes = require('./routes/progresoRoutes');
const suscripcionRoutes = require('./routes/suscripcionRoutes');
const recompensaRoutes = require('./routes/recompensaRoutes');
const cors = require('cors');


const path = require('path'); //construye las rutas del script cargarEjercicios.js

const app = express();

conexionDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Servir archivos estáticos (imágenes y videos)
app.use('/imagenes', express.static(path.join(__dirname, 'public/images')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api/sesiones', sesionRoutes);
app.use('/api/progreso', progresoRoutes);
app.use('/api/suscripciones', suscripcionRoutes);
app.use('/api/recompensas', recompensaRoutes);



app.get("/", (req, res) => {
    res.json({mensaje: " ¡Api funciona!"});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app; 