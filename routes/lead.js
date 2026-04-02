const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, investment_amount, sector, message } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and email are required' });
        }
        
        await query(
            'INSERT INTO investment_leads (name, email, phone, investment_amount, sector, message) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone || null, investment_amount || null, sector || null, message || null]
        );
        
        res.json({ success: true, message: 'Investment inquiry received. Our team will reach out shortly.' });
    } catch (error) {
        console.error('Lead error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
    }
});

router.get('/', async (req, res) => {
    try {
        const leads = await query('SELECT * FROM investment_leads ORDER BY created_at DESC');
        res.json({ success: true, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
});

module.exports = router;
