const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'lacocadejacks',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos MySQL establecida exitosamente.');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };
