const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        type: DataTypes.ENUM('fixed', 'variable', 'service'),  // ✅ Chuẩn hóa type
        allowNull: false,
        defaultValue: 'fixed'
    },
    unitPrice: {
        type: DataTypes.DECIMAL(12, 2),  // ✅ Tăng precision cho số lớn
        allowNull: false,                // ✅ Bắt buộc có giá
        validate: {
            min: 0,
            isNumeric: true
        }
    },
    description: {
        type: DataTypes.TEXT,            // ✅ TEXT thay vì STRING cho mô tả dài
        allowNull: true
    },
    cycle: {
        type: DataTypes.ENUM('daily', 'monthly', 'quarterly', 'yearly'),  // ✅ Thêm cycle
        defaultValue: 'monthly'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),  // ✅ Trạng thái
        defaultValue: 'active'
    }
}, {
    tableName: 'Fees',           // ✅ Tên bảng rõ ràng
    timestamps: true,
    indexes: [
        {
            fields: ['status']   // ✅ Index cho filter active
        },
        {
            fields: ['type']     // ✅ Index cho filter type
        }
    ]
});

// ✅ ASSOCIATIONS
Fee.associate = (models) => {
    Fee.hasMany(models.Payment, {
        foreignKey: 'feeId',
        as: 'payments',
        onDelete: 'CASCADE'
    });
};

module.exports = Fee;
