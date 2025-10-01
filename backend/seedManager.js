const db = require('./db/db');

const managers = [
  { id: '11111111-1111-1111-1111-111111111111', is_active: 1 },
  { id: '22222222-2222-2222-2222-222222222222', is_active: 1 },
  { id: '33333333-3333-3333-3333-333333333333', is_active: 1 },
  { id: '44444444-4444-4444-4444-444444444444', is_active: 0 } // inactive example
];

managers.forEach(({ id, is_active }) => {
  db.run(
    'INSERT OR IGNORE INTO manager (id, is_active) VALUES (?, ?)',
    [id, is_active],
    (err) => {
      if (err) {
        console.error(`Error inserting manager ${id}:`, err.message);
      } else {
        console.log(`Manager ${id} inserted or already exists`);
      }
    }
  );
});
