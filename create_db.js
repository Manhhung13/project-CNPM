const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

    try {
        // Connect to MySQL server without selecting a specific database
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
        });

        console.log(`Connected to MySQL server at ${DB_HOST}.`);

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`Database '${DB_NAME}' created or already exists.`);

        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error.message);
        console.error('Please ensure your MySQL server is running and .env credentials are correct.');
        process.exit(1);
    }
}

createDatabase();
