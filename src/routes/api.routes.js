const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const adminController = require('../controllers/admin.controller');

// Rutas públicas (Formulario de Landing)
router.post('/orders', orderController.upload.single('comprobante'), orderController.createOrder);

// Rutas privadas (Admin Dashboard)
router.get('/admin/stats', adminController.getStats);
router.get('/admin/comprobantes', adminController.getComprobantes);
router.post('/admin/comprobantes/:id/status', adminController.updateComprobanteStatus);
router.post('/admin/clientes/:cedula/deactivate', adminController.deactivateCliente);

module.exports = router;
