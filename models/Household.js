const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Household = sequelize.define('Household', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // KHÓA NGOẠI (FOREIGN KEYS)
    apartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Apartments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    headResidentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Residents',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },

    // THÔNG TIN TRẠNG THÁI
    status: {
      type: DataTypes.ENUM('Active', 'History'),
      defaultValue: 'Active',
    },

    moveInDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },

    moveOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Soft delete (paranoid)
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
    paranoid: true,
    tableName: 'Households',
  });

  Household.associate = (models) => {
    // 1 Household thuộc 1 Apartment
    Household.belongsTo(models.Apartment, {
      foreignKey: 'apartmentId',
      as: 'apartment'
    });

    // 1 Household có 1 Chủ hộ
    Household.belongsTo(models.Resident, {
      foreignKey: 'headResidentId',
      as: 'headResident'
    });

    // 1 Household có nhiều Resident (thành viên)
    Household.hasMany(models.Resident, {
      foreignKey: 'householdId',
      as: 'residents'
    });

    // 1 Household có nhiều Payment
    // Household.hasMany(models.Payment, {
    //     foreignKey: 'householdId',
    //     as: 'payments'
    // });

    // 1 Household có nhiều Invoice
    Household.hasMany(models.Invoice, {
      foreignKey: 'householdId',
      as: 'invoices'
    });
  };

  return Household;
};
