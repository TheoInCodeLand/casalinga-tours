const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'casalinga.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create a temporary table with the new structure
    db.run(`CREATE TABLE IF NOT EXISTS tours_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        detailed_description TEXT,
        price DECIMAL(10, 2),
        duration TEXT,
        category TEXT,
        image_url TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Copy data from old table to new table
    db.run(`INSERT INTO tours_new (id, title, description, detailed_description, price, duration, category, image_url, available, created_at)
            SELECT id, title, description, detailed_description, price, duration, category, image_url, available, created_at 
            FROM tours`);

    // Drop the old table
    db.run(`DROP TABLE tours`);

    // Rename the new table
    db.run(`ALTER TABLE tours_new RENAME TO tours`);

    console.log('Successfully recreated tours table with location columns');
});

db.close();