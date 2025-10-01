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
    db.get('SELECT * FROM user WHERE user_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const getUsers = async (req, res) => {
  try {
    const { user_id, mob_num, manager_id } = req.body;
    let sql = 'SELECT * FROM user WHERE is_active = 1';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }
    if (mob_num) {
      sql += ' AND mobile_no = ?';
      params.push(mob_num);
    }
    if (manager_id) {
      sql += ' AND manager_id = ?';
      params.push(manager_id);
    }

    const users = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const validData = await validateUserDetails(req.body);
    const userId = uuidv4();
    const sql = `INSERT INTO user (
      user_id, full_name, mobile_no, pan_num, manager_id,
      created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`;
    db.run(sql, [userId, validData.full_name, validData.mobile_no, validData.pan_num, validData.manager_id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: 'User created successfully', user_id: userId });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = (req, res) => {
  const { user_id, mob_num } = req.body;
  let searchKey = null;
  let searchValue = null;

  if (user_id) {
    searchKey = 'user_id';
    searchValue = user_id;
  } else if (mob_num) {
    searchKey = 'mobile_no';
    searchValue = mob_num;
  } else {
    return res.status(400).json({ message: 'Provide user_id or mob_num.' });
  }

  const selectQuery = `SELECT * FROM user WHERE ${searchKey} = ? AND is_active = 1`;
  db.get(selectQuery, [searchValue], (error, user) => {
    if (error) return res.status(500).json({ message: error.message });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const deleteQuery = `DELETE FROM user WHERE ${searchKey} = ?`;
    db.run(deleteQuery, [searchValue], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ message: deleteErr.message });
      res.status(200).json({ message: `User deleted successfully.` });
    });
  });
};

const updateUser = async (req, res) => {
  const { user_ids, update_data } = req.body;

  if (!Array.isArray(user_ids) || user_ids.length === 0 || !update_data) {
    return res.status(400).json({ message: 'user_ids array and update_data are required' });
  }

  try {
    const { full_name, mob_num, pan_num, manager_id } = update_data;
    await validateUserDetails({ full_name, mobile_no: mob_num, pan_num, manager_id });
    await runQuery('BEGIN TRANSACTION');

    for (const userId of user_ids) {
      const existingUser = await getUserById(userId);
      if (!existingUser) throw new Error(`User ${userId} not found`);

      if (manager_id && existingUser.manager_id !== manager_id) {
        await runQuery('UPDATE user SET is_active = 0, updated_at = datetime(\'now\') WHERE user_id = ?', [userId]);
        const newUserId = uuidv4();
        const insertSql = `INSERT INTO user (user_id, full_name, mobile_no, pan_num, manager_id, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`;
        await runQuery(insertSql, [newUserId, full_name, mob_num, pan_num, manager_id]);
      } else {
        const updateSql = `UPDATE user SET full_name = ?, mobile_no = ?, pan_num = ?, manager_id = ?, updated_at = datetime('now')
          WHERE user_id = ?`;
        await runQuery(updateSql, [full_name, mob_num, pan_num, manager_id, userId]);
      }
    }
    await runQuery('COMMIT');
    res.status(200).json({ message: 'Update successful' });
  } catch (error) {
    await runQuery('ROLLBACK');
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers, deleteUser, updateUser };
