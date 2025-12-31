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
                len: [3, 50]
            }
        },
        password: {
            type: DataTypes.STRING(255), // Hash password dài
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
        // KHÓA NGOẠI
        residentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Residents',
                key: 'id'
            },
            onDelete: 'SET NULL'
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        indexes: [
            { fields: ['username'] },
            { fields: ['residentId'] },
            { fields: ['isActive'] }
        ]
    });

    User.associate = (models) => {
        // 1 User thuộc 1 Resident
        User.belongsTo(models.Resident, {
            foreignKey: 'residentId',
            as: 'resident'
        });
    };

    return User;
};
