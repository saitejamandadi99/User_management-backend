const db = require('../db/db')
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
        const sql = `select * from user where user_ id = ?`
        db.get(sql, [userId], (err, row)=>{
            if(err){
                throw err
            }
            if(!row){
                return res.status(404).json({message:`user with the id ${userId} not found`})
            }
            const deleteSql = `delete from user where id = ?`
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

