const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Config = sequelize.define('Config', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.JSON, // Puede almacenar números, booleanos o strings
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'configs'
});

module.exports = Config;
