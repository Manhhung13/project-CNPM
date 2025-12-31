const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
        householdId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Households',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        feeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Fees',
                key: 'id'
            },
            onDelete: 'CASCADE'
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
        indexes: [
            { fields: ['householdId'] },
            { fields: ['status'] },
            { fields: ['dueDate'] },
            { fields: ['invoiceNumber'] }
        ]
    });

    Invoice.associate = (models) => {
        Invoice.belongsTo(models.Household, {
            foreignKey: 'householdId',
            as: 'household'
        });
        Invoice.belongsTo(models.Fee, {
            foreignKey: 'feeId',
            as: 'fee'
        });
    };

    return Invoice;
};
