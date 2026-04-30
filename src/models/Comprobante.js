const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Subscription = require('./Subscription');

const Comprobante = sequelize.define('Comprobante', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Subscription,
            key: 'id'
        }
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
        defaultValue: 'Pendiente'
    }
}, {
    timestamps: true,
    tableName: 'comprobantes'
});

// Relationships
Subscription.hasMany(Comprobante, { foreignKey: 'subscription_id' });
Comprobante.belongsTo(Subscription, { foreignKey: 'subscription_id' });

module.exports = Comprobante;
