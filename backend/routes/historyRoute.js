const express = require('express');
const router = express.Router();
const HealthEntry = require('../db/History');

// GET entry by date
router.get('/:date', async (req, res) => {
    try {
        const userId = req.user.id;
        const entry = await HealthEntry.findOne({
            userId,
            date: req.params.date
        });
        
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
