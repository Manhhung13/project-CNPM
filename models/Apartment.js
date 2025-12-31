const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Apartment = sequelize.define('Apartment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        area: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance', 'Empty'),
            defaultValue: 'Empty',
        },
    }, {
        tableName: 'Apartments',
        timestamps: true,
    });

    Apartment.associate = (models) => {
        Apartment.hasMany(models.Household, {
            foreignKey: 'apartmentId',
            as: 'households'
        });

        Apartment.hasMany(models.Resident, {
            foreignKey: 'apartmentId',
            as: 'residents'
        });
    };

    return Apartment;
};
