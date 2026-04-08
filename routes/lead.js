const express = require('express');
const router = express.Router();
const { query } = require('../db');

// WhatsApp notification function
async function sendWhatsAppNotification(phoneNumber, name, email, amount, sector, message) {
    try {
        const yourWhatsAppNumber = '254115777999'; // Your WhatsApp number
        const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${yourWhatsAppNumber}&text=${encodeURIComponent(
            `💰 NEW INVESTMENT LEAD\n\n` +
            `👤 Name: ${name}\n` +
            `📧 Email: ${email}\n` +
            `💵 Amount: ${amount || 'Not specified'}\n` +
            `🏭 Sector: ${sector || 'Not specified'}\n` +
            `💬 Message: ${message || 'No message provided'}\n\n` +
            `🕐 Time: ${new Date().toLocaleString()}\n\n` +
            `📞 Reply to: ${email}`
        )}&apikey=8097822`;
        
        const response = await fetch(apiUrl);
        console.log('WhatsApp notification sent:', response.status);
        return true;
    } catch (error) {
        console.error('WhatsApp notification failed:', error.message);
        return false;
    }
}

// Submit investment lead
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, investment_amount, sector, message } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and email are required' });
        }
        
        const result = await query(
            'INSERT INTO investment_leads (name, email, phone, investment_amount, sector, message) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone || null, investment_amount || null, sector || null, message || null]
        );
        
        // Send WhatsApp notification
        sendWhatsAppNotification(null, name, email, investment_amount, sector, message).catch(console.error);
        
        res.json({ success: true, message: 'Investment inquiry received. Our team will reach out shortly.', id: result.insertId });
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
        console.error('Fetch error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
});

// Update lead status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await query('UPDATE investment_leads SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
    try {
        console.log('Deleting lead ID:', req.params.id);
        const result = await query('DELETE FROM investment_leads WHERE id = ?', [req.params.id]);
        console.log('Delete result:', result);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Lead not found' });
        }
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete lead: ' + error.message });
    }
});

module.exports = router;
