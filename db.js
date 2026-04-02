const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'richyards.db');
const db = new sqlite3.Database(dbPath);

function initDB() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS investment_leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            investment_amount TEXT,
            sector TEXT,
            message TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT,
            content TEXT,
            image_url TEXT,
            media_type TEXT DEFAULT 'none',
            media_url TEXT,
            author TEXT DEFAULT 'Richyards Team',
            status TEXT DEFAULT 'published',
            views INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_message TEXT,
            bot_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'editor',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];
    
    db.serialize(() => {
        queries.forEach(query => {
            db.run(query, (err) => {
                if (err) console.log('Table warning:', err.message);
            });
        });
        
        // Insert default admin if not exists
        db.get("SELECT * FROM admin_users LIMIT 1", (err, row) => {
            if (err) {
                console.log('Error checking admin:', err.message);
                return;
            }
            if (!row) {
                const defaultHash = bcrypt.hashSync('admin123', 10);
                db.run(
                    "INSERT INTO admin_users (username, password_hash, email, role) VALUES (?, ?, ?, ?)",
                    ['admin', defaultHash, 'richyardsinvestors@gmail.com', 'admin'],
                    (err) => {
                        if (err) console.log('Error creating admin:', err.message);
                        else console.log('✅ Default admin created: username=admin, password=admin123');
                    }
                );
            }
        });
    });
    
    console.log('✅ SQLite Database initialized at richyards.db');
}

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        const sqlLower = sql.toLowerCase().trim();
        if (sqlLower.startsWith('select')) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ insertId: this.lastID, affectedRows: this.changes });
            });
        }
    });
}

module.exports = { initDB, query };