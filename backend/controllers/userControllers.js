const db = require('../db/db')
const {v4:uuidv4} = require('uuid')
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

const deleteUserById = (req , res) => {
    const userId = req.params.id 
    try{
        const sql = `select * from user where user_id = ?`
        db.get(sql, [userId], (err, row)=>{
            if(err){
                throw err
            }
            if(!row){
                return res.status(404).json({message:`user with the id ${userId} not found`})
            }
            const deleteSql = `delete from user where user_id = ?`
            db.run(deleteSql, [userId], (err)=>{
                if(err){
                    throw err
                }
                res.status(200).json({message:`user with the id ${userId} deleted successfully`})
            })
        
        })
    }
    catch(error){
        res.status(500).json({message:error.message})
    }
}

//create user 

const createUser = (req , res) =>{
    const {full_name, mobile_no, pan_num, manager_id} = req.body
    if(!full_name || !mobile_no || !pan_num || !manager_id){
        return res.status(400).json({message:'please provide all the details'})
    }
    const userId = uuidv4(); 
    const sql = `insert into user (user_id, full_name, mobile_no, pan_num, manager_id) values (?,?,?,?,?)`
    db.run(sql, [userId, full_name, mobile_no, pan_num,manager_id], (err)=>{
        if(err){
            return res.status(500).json({message:err.message})
        }
        res.status(201).json({message:'User created successfully'})
    })
    
}
//update user by id 
const updateUserById = (req , res) =>{
    const userId = req.params.id
    const {full_name, mobile_no, pan_num, manager_id} = req.body
    if(!full_name || !mobile_no || !pan_num || !manager_id){
        return res.status(400).json({message:'please provide all the details'})
    }
    const sql = `update user set full_name = ?, mobile_no = ?, pan_num = ? , manager_id= ? where user_id = ?`
    db.run(sql, [full_name, mobile_no, pan_num,manager_id,userId,], (err)=>{
        if(err){
            return res.status(500).json({message:err.message})
        }
        res.status(201).json({message:'User Updated successfully'})
    })
    
}

module.exports = {getAllUsers, deleteUserById, createUser, updateUserById}