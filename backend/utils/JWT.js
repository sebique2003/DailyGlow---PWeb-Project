const jwt = require('jsonwebtoken');
require('dotenv').config();

// fct generare token
const generateToken = (userId, expiresIn = '7d') => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

// verificare token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("JWT Error:", err);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};