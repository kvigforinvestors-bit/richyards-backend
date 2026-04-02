const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/stats', async (req, res) => {
    try {
        const contactCount = await query('SELECT COUNT(*) as count FROM contacts');
        const leadCount = await query('SELECT COUNT(*) as count FROM investment_leads');
        const postCount = await query('SELECT COUNT(*) as count FROM blog_posts');
        const recentContacts = await query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5');
        const recentLeads = await query('SELECT * FROM investment_leads ORDER BY created_at DESC LIMIT 5');
        res.json({
            success: true,
            data: {
                totalContacts: contactCount[0].count,
                totalLeads: leadCount[0].count,
                totalPosts: postCount[0].count,
                recentContacts,
                recentLeads
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

module.exports = router;
