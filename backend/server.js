const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');
const fs = require('fs');
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/trash', express.static(path.join(__dirname, 'trash')));

// config upload
const uploadDir = path.join(__dirname, 'uploads/profile');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Conectare MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/DailyGlow_db')
    .then(() => console.log("Conectat la baza de date ✅"))
    .catch(err => console.error("Eroare MongoDB:", err));

// Rute
app.use('/api/auth', authRoutes);

// Middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Eroare internă de server!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server-ul ruleaza pe portul ${PORT}!`));