const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Submit investment lead
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

// Get all leads (admin only)
router.get('/', async (req, res) => {
    try {
        const leads = await query('SELECT * FROM investment_leads ORDER BY created_at DESC');
        res.json({ success: true, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
});

// Update lead status (admin only)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await query('UPDATE investment_leads SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

// DELETE lead (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM investment_leads WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Lead not found' });
        }
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete lead' });
    }
});

module.exports = router;
