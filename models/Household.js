const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Household = sequelize.define('Household', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING, // Usually head of household name or apartment name
        allowNull: false,
    },
    apartmentNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    area: {
        type: DataTypes.FLOAT, // Apartment area in m2
        allowNull: false,
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Household;
