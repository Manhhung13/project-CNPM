// Cleanup script to reset test data
const { sequelize, Apartment, Household, Resident, User } = require('./models');

async function cleanup() {
    try {
        console.log('Cleaning up test data...');

        // Delete test households
        await Household.destroy({ where: { apartmentNumber: 'T999' } });
        console.log('Deleted test households');

        // Delete test apartment
        await Apartment.destroy({ where: { name: 'T999' } });
        console.log('Deleted test apartment');

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
}

cleanup();
