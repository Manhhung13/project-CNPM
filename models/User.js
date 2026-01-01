const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
            },
        },
        password: {
            type: DataTypes.STRING(255), // hash password
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        // ===== THÊM TRƯỜNG ROLE Ở ĐÂY =====
        role: {
            // Có thể dùng STRING, nhưng ENUM giúp cố định giá trị
            type: DataTypes.ENUM('manager', 'resident'),
            allowNull: false,
            defaultValue: 'resident',   // user đăng ký từ client thường là resident
        },

        // KHÓA NGOẠI
        residentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Residents',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
    }, {
        tableName: 'Users',
        timestamps: true,
        indexes: [
            { fields: ['username'] },
            { fields: ['residentId'] },
            { fields: ['isActive'] },
            { fields: ['role'] },      // index để lọc theo role nhanh hơn
        ],
    });

    User.associate = (models) => {
        User.belongsTo(models.Resident, {
            foreignKey: 'residentId',
            as: 'resident',
        });
    };

    return User;
};
