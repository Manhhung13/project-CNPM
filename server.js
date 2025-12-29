const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('BlueMoon Backend is running!');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const managementRoutes = require('./routes/managementRoutes');
const financialRoutes = require('./routes/financialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/management', managementRoutes);
app.use('/api/financial', financialRoutes);



// Sync Database
sequelize.sync()
    .then(() => {
        console.log('Database connected and synced.');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
