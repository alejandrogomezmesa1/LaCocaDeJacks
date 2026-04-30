require("dotenv").config();
const express = require("express");
const path = require("path");
const { connectDB, sequelize } = require("./config/database");
const webhookRoutes = require("./routes/webhook.routes");
const apiRoutes = require("./routes/api.routes");

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS básico y responder preflight (OPTIONS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Middleware para servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../public")));

// Rutas base
app.use("/webhook", webhookRoutes);
app.use("/api", apiRoutes);

// Iniciar servidor y conectar a DB
const startServer = async () => {
  await connectDB();

  // Sincronizar modelos con la base de datos
  // Usa alter: true para desarrollo. En producción considera migraciones.
  await sequelize.sync({ alter: true });
  console.log("✅ Modelos sincronizados con la base de datos.");

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(
      `📡 Esperando conexión con Meta en http://localhost:${PORT}/webhook`,
    );
  });
};

startServer();
