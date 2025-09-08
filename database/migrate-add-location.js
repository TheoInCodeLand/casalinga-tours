const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'casalinga.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add address column
    db.run(`ALTER TABLE tours ADD COLUMN address TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Address column already exists');
            } else {
                console.error('Error adding address column:', err);
            }
        } else {
            console.log('Successfully added address column to tours table');
        }
    });

    // Add latitude column
    db.run(`ALTER TABLE tours ADD COLUMN latitude REAL`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Latitude column already exists');
            } else {
                console.error('Error adding latitude column:', err);
            }
        } else {
            console.log('Successfully added latitude column to tours table');
        }
    });

    // Add longitude column
    db.run(`ALTER TABLE tours ADD COLUMN longitude REAL`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Longitude column already exists');
            } else {
                console.error('Error adding longitude column:', err);
            }
        } else {
            console.log('Successfully added longitude column to tours table');
        }
    });
});

db.close();