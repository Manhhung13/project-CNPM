const sequelize = require('../config/database');
const User = require('./User');
const Household = require('./Household');
const Resident = require('./Resident');
const Fee = require('./Fee');
const Payment = require('./Payment');

// Associations
Household.hasMany(Resident, { foreignKey: 'householdId', as: 'residents' });
Resident.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });

Household.hasMany(Payment, { foreignKey: 'householdId', as: 'payments' });
Payment.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });

Fee.hasMany(Payment, { foreignKey: 'feeId', as: 'payments' });
Payment.belongsTo(Fee, { foreignKey: 'feeId', as: 'fee' });

module.exports = {
    sequelize,
    User,
    Household,
    Resident,
    Fee,
    Payment,
};
