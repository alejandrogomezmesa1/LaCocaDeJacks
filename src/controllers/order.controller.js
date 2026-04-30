const multer = require('multer');
const path = require('path');
const Cliente = require('../models/Cliente');
const Subscription = require('../models/Subscription');
const Comprobante = require('../models/Comprobante');
const Config = require('../models/Config');

// Configuración de Multer para guardar imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'comprobante-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const createOrder = async (req, res) => {
    try {
        const { 
            email, nombre, cedula, celular, 
            plan, needs_cocas, delivery_type,
            address_1, barrio_1, days_address_1,
            address_2, barrio_2, days_address_2,
            facturacionElectronica
        } = req.body;

        // 1. Validar Cupos (Si existe la config 'max_cupos')
        const maxCuposConfig = await Config.findByPk('max_cupos');
        if (maxCuposConfig) {
            const maxCupos = parseInt(maxCuposConfig.value, 10);
            const activeSubscriptions = await Subscription.count({ where: { status: 'Activo' } });
            if (activeSubscriptions >= maxCupos) {
                return res.status(400).json({ success: false, message: 'Lo sentimos, actualmente no hay cupos disponibles.' });
            }
        }

        // 2. Validar o Crear Cliente
        let cliente = await Cliente.findByPk(cedula);
        if (cliente) {
            if (cliente.is_active) {
                return res.status(400).json({ success: false, message: 'Este documento ya tiene una suscripción activa.' });
            }
            // Actualizar datos si existen cambios
            cliente.nombre = nombre;
            cliente.email = email;
            cliente.celular = celular;
            await cliente.save();
        } else {
            // Crear nuevo cliente
            cliente = await Cliente.create({
                cedula, nombre, email, celular, is_active: false // Estará activo cuando se apruebe el comprobante
            });
        }

        // 3. Calcular Precio Total
        let basePrice = 0;
        if (plan === 'Semanal') basePrice = 75000;
        else if (plan === 'Quincenal') basePrice = 150000;
        else if (plan === 'Mensual') basePrice = 285000;

        // Sumar precio de cocas si aplica
        const requiresCocas = needs_cocas === 'true' || needs_cocas === true;
        const cocasPrice = requiresCocas ? 70000 : 0;
        const total_price = basePrice + cocasPrice;

        // 4. Crear Suscripción (Pedido)
        const newSubscription = await Subscription.create({
            cliente_cedula: cedula,
            plan,
            needs_cocas: requiresCocas,
            delivery_type,
            address_1,
            barrio_1,
            days_address_1: delivery_type === 'Hibrida' ? days_address_1 : 'Lunes,Martes,Miércoles,Jueves,Viernes',
            address_2: delivery_type === 'Hibrida' ? address_2 : null,
            barrio_2: delivery_type === 'Hibrida' ? barrio_2 : null,
            days_address_2: delivery_type === 'Hibrida' ? days_address_2 : null,
            facturacion_electronica: facturacionElectronica,
            total_price,
            status: 'Pendiente'
        });

        // 5. Guardar Comprobante si hay archivo
        if (req.file) {
            await Comprobante.create({
                subscription_id: newSubscription.id,
                image_url: `/uploads/${req.file.filename}`,
                status: 'Pendiente'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Pedido registrado exitosamente',
            subscriptionId: newSubscription.id
        });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar el pedido',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    createOrder
};
