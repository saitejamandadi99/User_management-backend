const db = require('../db/db')
const {v4:uuidv4} = require('uuid')
const {validateUserDetails} = require('../utils/validation')
//get all users
const getAllUsers = async (req , res )=>{
    try{
        const sql = `select * from user`
        const rows = await new Promise ((resolve, reject)=>{
            db.all(sql, [], (err,rows)=>{
                if (err){
                    reject(err)
                }
                resolve(rows)
            })
        })
        res.status(200).json({message:'users fetched successfully', rows})

    }
    catch(error){
        res.status(500).json({message:error.message})
    }
}

//delete user by id

const deleteUserById = (req, res) => {
    const userId = req.params.id;
    const { mob_num } = req.body;
    let searchKey;
    let searchValue;

    if (userId) {
        searchKey = 'user_id';
        searchValue = userId;
    } else if (mob_num) {
        searchKey = 'mobile_no';
        searchValue = mob_num;
    } else {
        return res.status(400).json({ message: 'Please provide either user_id in URL or mob_num in request body.' });
    }

    const selectQuery = `SELECT * FROM user WHERE ${searchKey} = ?`;

    db.get(selectQuery, [searchValue], (error, user) => {
        if (error) {
        return res.status(500).json({ message: error.message });
        }
        if (!user) {
        return res.status(404).json({ message: `No user found with ${searchKey} ${searchValue}` });
        }

        const deleteQuery = `DELETE FROM user WHERE ${searchKey} = ?`;

        db.run(deleteQuery, [searchValue], (deleteError) => {
        if (deleteError) {
            return res.status(500).json({ message: deleteError.message });
        }
        res.status(200).json({ message: `User identified by ${searchKey} ${searchValue} was deleted successfully.` });
        });
    });
};


//create user 

const createUser = async (req , res) =>{
    const validData = await validateUserDetails(req.body)
    const userId = uuidv4(); 
    const sql = `insert into user (user_id, full_name, mobile_no, pan_num, manager_id) values (?,?,?,?,?)`
    db.run(sql, [userId, validData.full_name, validData.mobile_no, validData.pan_num,validData.manager_id], (err)=>{
        if(err){
            return res.status(500).json({message:err.message})
        }
        res.status(201).json({message:'User created successfully'})
    })
    
}
//update user by id 
const updateUserById =async (req , res) =>{
    const userId = req.params.id
     const validData = await validateUserDetails(req.body)
    const sql = `update user set full_name = ?, mobile_no = ?, pan_num = ? , manager_id= ? where user_id = ?`
    db.run(sql, [validData.full_name, validData.mobile_no, validData.pan_num,validData.manager_id,userId,], (err)=>{
        if(err){
            return res.status(500).json({message:err.message})
        }
        res.status(200).json({message:'User Updated successfully'})
    })
    
}

const getUsers = async (req, res) => {
  try {
    const { user_id, mob_num, manager_id } = req.body;

    let sql = 'select * FROM user';
    const conditions = [];
    const params = [];

    if (user_id) {
      conditions.push('user_id = ?');
      params.push(user_id);
    }
    if (mob_num) {
      conditions.push('mobile_no = ?');
      params.push(mob_num);
    }
    if (manager_id) {
      conditions.push('manager_id = ?');
      params.push(manager_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const users = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {getAllUsers,getUsers, deleteUserById, createUser, updateUserById}