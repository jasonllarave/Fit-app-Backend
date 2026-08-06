const mongose = require('mongoose');

const conexionDB = async () => {

    try{

        const conexion = await mongose.connect(process.env.MONGODB_URI);

        console.log('MongoDB conectada', conexion.connection.host);
        return conexion;

    }catch(error){
        console.error('Error al conectar MongoDB', error.message);
        process.exit(1);
    }

};

module.exports = conexionDB;