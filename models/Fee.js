const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('Service', 'Contribution', 'Vehicle', 'Utility'),
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2), // e.g., 70000 for motorbike
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Fee;
