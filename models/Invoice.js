// models/Invoice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    invoiceNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'pending'
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Invoices',
    timestamps: true,
    indexes: [{ fields: ['householdId'] }, { fields: ['status'] }]
});

Invoice.associate = (models) => {
    Invoice.belongsTo(models.Household, { foreignKey: 'householdId', as: 'household' });
    Invoice.belongsTo(models.Fee, { foreignKey: 'feeId', as: 'fee' });
};

module.exports = Invoice;
