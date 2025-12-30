const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Apartment = sequelize.define('Apartment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Apartment names should be unique e.g., A101
    },
    area: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance', 'Empty'),
        defaultValue: 'Available',
    },
}, {
    timestamps: true,
});

module.exports = Apartment;
