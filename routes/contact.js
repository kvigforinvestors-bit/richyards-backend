const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email and message are required' });
        }
        
        await query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || 'General Inquiry', message]
        );
        
        res.json({ success: true, message: 'Message sent successfully. We will contact you soon.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

router.get('/', async (req, res) => {
    try {
        const contacts = await query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
    }
});

module.exports = router;
