

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'casalinga.db');
const db = new sqlite3.Database(dbPath);

db.all("PRAGMA table_info(tours)", (err, rows) => {
    if (err) {
        console.error('Error checking schema:', err);
    } else {
        console.log('Tours table columns:');
        rows.forEach(row => {
            console.log(`- ${row.name} (${row.type})`);
        });
    }
    db.close();
});