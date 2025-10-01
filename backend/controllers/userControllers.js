const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');
const { validateUserDetails } = require('../utils/validation');

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getUserById = (userId) =>
  new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM user WHERE user_id = ? AND is_active = 1',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

const getUsers = async (req, res) => {
  try {
    const { user_id, mobile_no, manager_id } = req.body;
    let sql = 'SELECT * FROM user WHERE is_active = 1';
    const params = [];
    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    if (mobile_no) {
      sql += ' AND mobile_no = ?';
      params.push(mobile_no);
    }
    if (manager_id) {
      sql += ' AND manager_id = ?';
      params.push(manager_id);
    }
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(200).json({ users: rows });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    // Normalize input keys to fit validation
    const { full_name, mobile_no, pan_num, manager_id } = req.body;
    const validData = await validateUserDetails({
      full_name,
      mobile_no,
      pan_num,
      manager_id,
    });
    const userId = uuidv4();
    const sql = `INSERT INTO user (
      user_id, full_name, mobile_no, pan_num, manager_id,
      created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`;
    db.run(
      sql,
      [
        userId,
        validData.full_name,
        validData.mobile_no,
        validData.pan_num,
        validData.manager_id,
      ],
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: 'User created successfully', user_id: userId });
      }
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = (req, res) => {
  const { user_id, mob_num } = req.body;
  let key, value;

  if (user_id) {
    key = 'user_id';
    value = user_id;
  } else if (mob_num) {
    key = 'mobile_no';
    value = mob_num;
  } else {
    return res.status(400).json({ message: 'Either user_id or mob_num must be provided.' });
  }

  const selectSQL = `SELECT * FROM user WHERE ${key} = ? AND is_active = 1`;
  db.get(selectSQL, [value], (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const deactivateSQL = `UPDATE user SET is_active = 0, updated_at = datetime('now') WHERE ${key} = ?`;
    db.run(deactivateSQL, [value], (delErr) => {
      if (delErr) return res.status(500).json({ message: delErr.message });
      res.status(200).json({ message: 'User deleted successfully.' });
    });
  });
};

const updateUser = async (req, res) => {
  const { user_ids, update_data } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0 || !update_data) {
    return res.status(400).json({ message: 'user_ids (array) and update_data are required.' });
  }

  try {
    // Normalize for validation
    const { full_name, mobile_no, pan_num, manager_id } = update_data;
    const validData = await validateUserDetails({
      full_name,
      mobile_no,
      pan_num,
      manager_id,
    });

    await runQuery('BEGIN TRANSACTION');

    for (const id of user_ids) {
      const existingUser = await getUserById(id);
      if (!existingUser) throw new Error(`User ${id} not found.`);

      if (manager_id && existingUser.manager_id !== manager_id) {
        // Deactivate and insert new record if manager changes
        await runQuery('UPDATE user SET is_active = 0, updated_at = datetime(\'now\') WHERE user_id = ?', [id]);

        const newUserId = uuidv4();
        const insertSQL = `
          INSERT INTO user (user_id, full_name, mobile_no, pan_num, manager_id, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`;
        await runQuery(insertSQL, [
          newUserId,
          validData.full_name || existingUser.full_name,
          validData.mobile_no || existingUser.mobile_no,
          validData.pan_num || existingUser.pan_num,
          validData.manager_id,
        ]);
      } else {
        // Simple update otherwise
        const updateSQL = `
          UPDATE user SET full_name = ?, mobile_no = ?, pan_num = ?, manager_id = ?, updated_at = datetime('now')
          WHERE user_id = ?`;
        await runQuery(updateSQL, [
          validData.full_name || existingUser.full_name,
          validData.mobile_no || existingUser.mobile_no,
          validData.pan_num || existingUser.pan_num,
          validData.manager_id || existingUser.manager_id,
          id,
        ]);
      }
    }

    await runQuery('COMMIT');
    res.status(200).json({ message: 'Users updated successfully.' });
  } catch (error) {
    await runQuery('ROLLBACK');
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers, deleteUser, updateUser };
