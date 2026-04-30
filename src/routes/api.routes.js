const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const adminController = require("../controllers/admin.controller");

// Rutas públicas (Formulario de Landing)
router.post(
  "/orders",
  orderController.upload.single("comprobante"),
  orderController.createOrder,
);

// Rutas privadas (Admin Dashboard)
router.get("/admin/stats", adminController.getStats);
router.get("/admin/comprobantes", adminController.getComprobantes);
router.get("/admin/cupos", adminController.getCupos);
router.get("/admin/export/daily.xlsx", adminController.exportDailyExcel);
router.get("/admin/export/daily.pdf", adminController.exportDailyPdf);
router.get("/admin/comprobantes/:id", adminController.getComprobanteById);
router.get("/admin/subscriptions/:id", adminController.getSubscriptionById);
router.get("/admin/clientes", adminController.getClientes);
router.get("/admin/subscriptions", adminController.getSubscriptions);
router.post(
  "/admin/comprobantes/:id/status",
  adminController.updateComprobanteStatus,
);
router.post(
  "/admin/clientes/:cedula/deactivate",
  adminController.deactivateCliente,
);

module.exports = router;
