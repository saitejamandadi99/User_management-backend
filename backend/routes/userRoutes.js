const express = require('express'); 
const router = express.Router()

const {getAllUsers,getUsers, deleteUserById, createUser, updateUserById} = require('../controllers/userControllers')

router.get('/users', getAllUsers)
router.post('/get-users',getUsers )
router.post('/users', createUser)
router.delete('/users/:id', deleteUserById)
router.put('/users/:id', updateUserById)

module.exports = router     