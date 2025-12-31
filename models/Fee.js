const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Fee = sequelize.define('Fee', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        type: {
            type: DataTypes.ENUM('fixed', 'variable', 'service'),
            allowNull: false,
            defaultValue: 'fixed'
        },
        unitPrice: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                min: 0,
                isNumeric: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        cycle: {
            type: DataTypes.ENUM('daily', 'monthly', 'quarterly', 'yearly'),
            defaultValue: 'monthly'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'Fees',
        timestamps: true,
        indexes: [
            {
                fields: ['status']
            },
            {
                fields: ['type']
            }
        ]
    });

    Fee.associate = (models) => {
        // Fee.hasMany(models.Payment, {
        //     foreignKey: 'feeId',
        //     as: 'payments',
        //     onDelete: 'CASCADE'
        // });
        Fee.hasMany(models.Invoice, {
            foreignKey: 'feeId',
            as: 'invoices',
            onDelete: 'CASCADE'
        });
    };

    return Fee;
};
