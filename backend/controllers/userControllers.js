const userTable = require('../models/userModel')

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