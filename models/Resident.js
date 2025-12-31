const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Resident = sequelize.define("Resident", {
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        identityCard: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        phoneNumber: {
            type: DataTypes.STRING(15)
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },
        gender: {
            type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
            defaultValue: 'Nam'
        },
        dob: {
            type: DataTypes.DATEONLY
        },
        isHost: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        // Mối quan hệ với chủ hộ
        relationship: {
            type: DataTypes.STRING(50),
            defaultValue: 'Thành viên',
            comment: 'Mối quan hệ với chủ hộ (Vợ, Con, ...)'
        },

        // KHÓA NGOẠI
        apartmentId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Apartments',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        householdId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Households',
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'Residents',
        timestamps: true,
        indexes: [
            { fields: ['identityCard'] },
            { fields: ['apartmentId'] },
            { fields: ['householdId'] },
            { fields: ['isHost'] }
        ]
    });

    Resident.associate = (models) => {
        // 1 Resident thuộc 1 Apartment
        Resident.belongsTo(models.Apartment, {
            foreignKey: 'apartmentId',
            as: 'apartment'
        });

        // 1 Resident thuộc 1 Household
        Resident.belongsTo(models.Household, {
            foreignKey: 'householdId',
            as: 'household'
        });

        // 1 Resident có thể là 1 User
        Resident.hasOne(models.User, {
            foreignKey: 'residentId',
            as: 'user'
        });

        // 1 Resident có thể là chủ hộ của 1 Household
        Resident.hasOne(models.Household, {
            foreignKey: 'headResidentId',
            as: 'ownedHousehold'
        });
    };

    return Resident;
};
