const express = require('express');
const router = express.Router();
const { query } = require('../db');

const botResponses = {
    greeting: "Hello! Welcome to Richyards Investors. How can I help you with your investment journey in Africa today?",
    investment: "We offer investment opportunities across Real Estate, Agriculture, Technology, Energy, Manufacturing, and Healthcare. Minimum investment starts from ,000 for individuals and ,000 for institutional investors.",
    returns: "Our average annual returns range from 16% to 38% depending on the sector. Real estate offers 18-24%, technology 28-38%, agriculture 20-28%, and energy 16-20%.",
    process: "Our investment process includes: 1) Consultation & Assessment, 2) Prospectus Review, 3) Investment & Onboarding, 4) Ongoing Reporting. Would you like to schedule a consultation?",
    contact: "You can reach us at richyardsinvestors@gmail.com or call +254 115 777 999. Our offices are at Flamingo Towers, Upper Hill, Nairobi.",
    sectors: "We invest in Real Estate, Agriculture, Technology, Energy, Manufacturing, and Healthcare. Click on the Sectors page for detailed information on each.",
    default: "Thank you for your message. For specific investment inquiries, please fill out our contact form or schedule a consultation."
};

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.match(/hello|hi|hey|greetings/)) return botResponses.greeting;
    if (msg.match(/invest|opportunity|portfolio/)) return botResponses.investment;
    if (msg.match(/return|profit|yield|roi/)) return botResponses.returns;
    if (msg.match(/process|how to invest|steps/)) return botResponses.process;
    if (msg.match(/contact|email|phone|address|office/)) return botResponses.contact;
    if (msg.match(/sector|area|industry/)) return botResponses.sectors;
    return botResponses.default;
}

router.post('/', async (req, res) => {
    try {
        const { message, session_id } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }
        const botResponse = getBotResponse(message);
        await query(
            'INSERT INTO chat_messages (session_id, user_message, bot_response) VALUES (?, ?, ?)',
            [session_id || 'anonymous', message, botResponse]
        );
        res.json({ success: true, response: botResponse, timestamp: new Date() });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ success: false, error: 'Chat service error' });
    }
});

module.exports = router;
