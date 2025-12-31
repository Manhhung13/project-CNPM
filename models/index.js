const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

//  THỨ TỰ QUAN TRỌNG: Models KHÔNG phụ thuộc lẫn nhau trước
const Apartment = require('./Apartment')(sequelize, DataTypes);
const Fee = require('./Fee')(sequelize, DataTypes);
const Household = require('./Household')(sequelize, DataTypes);
const Resident = require('./Resident')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Invoice = require('./Invoice')(sequelize, DataTypes);

const db = {
    sequelize,
    Apartment,
    Fee,
    Household,
    Resident,
    User,
    Invoice
};

// Gọi associate SAU KHI TẤT CẢ load xong
Object.keys(db).forEach(modelName => {
    if (db[modelName] && db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
