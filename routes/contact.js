const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Name, email and message are required' });
        }
        
        const result = await query(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject || 'General Inquiry', message]
        );
        
        res.json({ success: true, message: 'Message sent successfully. We will contact you soon.', id: result.insertId });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// Get all contacts (admin only)
router.get('/', async (req, res) => {
    try {
        const contacts = await query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
    }
});

// Update contact status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await query('UPDATE contacts SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
    try {
        console.log('Deleting contact ID:', req.params.id);
        const result = await query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
        console.log('Delete result:', result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Contact not found' });
        }
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete contact: ' + error.message });
    }
});

module.exports = router;
