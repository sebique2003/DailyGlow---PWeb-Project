const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// env
require('dotenv').config();
console.log('Variabile de mediu încărcate:', {
    JWT_SECRET: !!process.env.JWT_SECRET,
    MONGO_URI: !!process.env.MONGO_URI
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://127.0.0.1:5501'],
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Conectare MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/DailyGlow_db')
    .then(() => console.log("Conectat la baza de date ✅"))
    .catch(err => console.error("Eroare MongoDB:", err));

// Rute
app.use('/api/auth', authRoutes);

// Middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Eroare interna a srv!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server-ul ruleaza pe portul ${PORT}!`));