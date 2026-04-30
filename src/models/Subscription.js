const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Cliente = require('./Cliente');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cliente_cedula: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'cedula'
        }
    },
    plan: {
        type: DataTypes.ENUM('Semanal', 'Quincenal', 'Mensual'),
        allowNull: false
    },
    needs_cocas: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivery_type: {
        type: DataTypes.ENUM('Fija', 'Hibrida'),
        allowNull: false
    },
    address_1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    barrio_1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    days_address_1: {
        type: DataTypes.STRING, // Ej. "Lunes,Martes,Miércoles,Jueves,Viernes"
        allowNull: false
    },
    address_2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    barrio_2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    days_address_2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    facturacion_electronica: {
        type: DataTypes.ENUM('Si', 'No'),
        defaultValue: 'No'
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pendiente', 'Activo', 'Cancelado'),
        defaultValue: 'Pendiente'
    }
}, {
    timestamps: true,
    tableName: 'subscriptions'
});

// Relationships
Cliente.hasMany(Subscription, { foreignKey: 'cliente_cedula' });
Subscription.belongsTo(Cliente, { foreignKey: 'cliente_cedula' });

module.exports = Subscription;
