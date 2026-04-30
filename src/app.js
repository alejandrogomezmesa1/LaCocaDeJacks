require('dotenv').config();
const express = require('express');
const webhookRoutes = require('./routes/webhook.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Rutas base
app.use('/webhook', webhookRoutes);

// Ruta de prueba de salud
app.get('/', (req, res) => {
    res.send('Servidor de WhatsApp API para La Coca De Jacks funcionando correctamente 🍔');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📡 Esperando conexión con Meta en http://localhost:${PORT}/webhook`);
});
