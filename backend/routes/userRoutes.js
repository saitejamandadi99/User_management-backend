const express = require('express');
const { createUser, getUsers, deleteUser, updateUser } = require('../controllers/userControllers');
const router = express.Router();

router.post('/create_user', createUser);
router.post('/get_users', getUsers);
router.post('/delete_user', deleteUser);
router.post('/update_user', updateUser);

module.exports = router;
