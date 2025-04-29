const { verifyToken } = require('../utils/JWT');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!token) {
        return res.status(401).json({ msg: "Token lipsă!" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Token invalid!" });
    }
};