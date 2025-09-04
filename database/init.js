// database/init.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'casalinga.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize tables
db.serialize(() => {
    // 1. Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Tours table
    db.run(`CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        detailed_description TEXT,
        price DECIMAL(10, 2),
        duration TEXT,
        category TEXT,
        image_url TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Bookings table
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        tour_id INTEGER,
        booking_date TEXT,
        participants INTEGER,
        special_requests TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (tour_id) REFERENCES tours (id)
    )`);

    // 4. Insert a default admin user (Password: admin123)
    const passwordHash = bcrypt.hashSync('admin123', 12);
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Site Admin', 'admin@casalingatours.co.za', passwordHash, 'admin'],
        function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Default admin user created with ID: ${this.lastID}`);
        }
    );

    // 5. Insert sample tours
    const insertTour = db.prepare(`INSERT OR IGNORE INTO tours (title, description, detailed_description, price, duration, category) VALUES (?, ?, ?, ?, ?, ?)`);
    insertTour.run(
        'Wellness Retreat',
        'Rejuvenate your mind and body.',
        'A full weekend dedicated to mental health, featuring yoga, meditation, and professional wellness workshops in a serene natural environment.',
        299.99,
        '3 Days / 2 Nights',
        'Retreat'
    );
    insertTour.run(
        'Team Building Adventure',
        'Boost your team\'s synergy.',
        'Our corporate team-building package is designed to improve communication, resolve conflicts, and build trust through challenging and fun outdoor activities.',
        199.99,
        '1 Day',
        'Corporate'
    );
    insertTour.finalize();

    console.log('Database tables initialized successfully!');
});

module.exports = db;