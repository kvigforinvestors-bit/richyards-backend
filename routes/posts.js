const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
    try {
        const posts = await query('SELECT id, title, excerpt, image_url, media_type, media_url, author, created_at FROM blog_posts WHERE status = "published" ORDER BY created_at DESC LIMIT 10');
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, excerpt, content, media_type, media_url, author, status } = req.body;
        const image_url = req.file ? /uploads/ : null;
        await query(
            'INSERT INTO blog_posts (title, excerpt, content, image_url, media_type, media_url, author, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, excerpt, content, image_url, media_type || 'none', media_url || null, author || 'Richyards Team', status || 'published']
        );
        res.json({ success: true, message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create post' });
    }
});

module.exports = router;
