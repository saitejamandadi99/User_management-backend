 const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.db'); 

db.serialize(() => {
  db.run(`ALTER TABLE user ADD COLUMN created_at TEXT DEFAULT (datetime('now'))`, (err) => {
    if (err) {
      console.error('Error adding created_at:', err.message);
    } else {
      console.log('created_at column added');
    }
  });

  db.run(`ALTER TABLE user ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`, (err) => {
    if (err) {
      console.error('Error adding updated_at:', err.message);
    } else {
      console.log('updated_at column added');
    }
  });
});

db.close();
