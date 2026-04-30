const Cliente = require('../models/Cliente');
const Subscription = require('../models/Subscription');
const Comprobante = require('../models/Comprobante');
const Config = require('../models/Config');

// Obtener estadísticas para el dashboard
const getStats = async (req, res) => {
    try {
        const totalClientesActivos = await Cliente.count({ where: { is_active: true } });
        const pendingComprobantes = await Comprobante.count({ where: { status: 'Pendiente' } });
        
        // Sumar ventas de suscripciones activas
        const activas = await Subscription.findAll({ where: { status: 'Activo' } });
        const weeklySales = activas.reduce((acc, sub) => acc + Number(sub.total_price), 0);

        res.json({
            success: true,
            stats: {
                totalClientesActivos,
                pendingComprobantes,
                weeklySales: `$${weeklySales.toLocaleString('es-CO')}`
            }
        });
    } catch (error) {
        console.error('Error obteniendo stats:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo estadísticas' });
    }
};

// Obtener todos los comprobantes con información de la suscripción y cliente
const getComprobantes = async (req, res) => {
    try {
        const comprobantes = await Comprobante.findAll({
            include: [{
                model: Subscription,
                include: [Cliente]
            }],
            order: [['createdAt', 'DESC']]
        });
        
        // Mapear para devolver un formato amigable para el frontend
        const result = comprobantes.map(comp => {
            const sub = comp.Subscription;
            const cli = sub ? sub.Cliente : null;
            return {
                id: comp.id,
                imageUrl: comp.image_url,
                status: comp.status,
                createdAt: comp.createdAt,
                subscriptionId: sub ? sub.id : null,
                plan: sub ? sub.plan : 'N/A',
                amount: sub ? sub.total_price : 0,
                clienteNombre: cli ? cli.nombre : 'Desconocido',
                clienteCedula: cli ? cli.cedula : 'N/A'
            };
        });

        res.json({
            success: true,
            comprobantes: result
        });
    } catch (error) {
        console.error('Error obteniendo comprobantes:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo comprobantes' });
    }
};

// Aprobar o rechazar un comprobante
const updateComprobanteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Aprobado' o 'Rechazado'

        const comprobante = await Comprobante.findByPk(id, {
            include: [{
                model: Subscription,
                include: [Cliente]
            }]
        });

        if (!comprobante) {
            return res.status(404).json({ success: false, message: 'Comprobante no encontrado' });
        }

        comprobante.status = status;
        await comprobante.save();

        const sub = comprobante.Subscription;
        const cli = sub ? sub.Cliente : null;

        if (status === 'Aprobado') {
            if (sub) {
                sub.status = 'Activo';
                await sub.save();
            }
            if (cli) {
                cli.is_active = true;
                await cli.save();
            }
        } else if (status === 'Rechazado') {
            if (sub) {
                sub.status = 'Cancelado';
                await sub.save();
            }
            // Mantenemos is_active del cliente como esté, no se activa.
        }

        res.json({
            success: true,
            message: `Comprobante ${status.toLowerCase()} exitosamente`
        });
    } catch (error) {
        console.error('Error actualizando comprobante:', error);
        res.status(500).json({ success: false, message: 'Error actualizando comprobante' });
    }
};

// Desactivar a un cliente
const deactivateCliente = async (req, res) => {
    try {
        const { cedula } = req.params;
        const cliente = await Cliente.findByPk(cedula);

        if (!cliente) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        cliente.is_active = false;
        await cliente.save();

        // También cancelar su suscripción activa
        const sub = await Subscription.findOne({ where: { cliente_cedula: cedula, status: 'Activo' } });
        if (sub) {
            sub.status = 'Cancelado';
            await sub.save();
        }

        res.json({
            success: true,
            message: 'Cliente desactivado exitosamente'
        });
    } catch (error) {
        console.error('Error desactivando cliente:', error);
        res.status(500).json({ success: false, message: 'Error desactivando cliente' });
    }
};

module.exports = {
    getStats,
    getComprobantes,
    updateComprobanteStatus,
    deactivateCliente
};
