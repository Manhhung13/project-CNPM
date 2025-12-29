const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Paid'),
        defaultValue: 'Paid',
    },
    details: {
        type: DataTypes.JSON, // Stores extra info like "2 motorbikes", "April 2024"
        allowNull: true,
    },
    // Foreign keys household_id and fee_id added via associations
}, {
    timestamps: true,
});

module.exports = Payment;
