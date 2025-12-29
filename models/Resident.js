const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resident = sequelize.define('Resident', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    citizenId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Permanent', 'Temporary', 'Absent'),
        defaultValue: 'Permanent',
    },
    // Foreign Key will be added in index.js association
}, {
    timestamps: true,
});

module.exports = Resident;
