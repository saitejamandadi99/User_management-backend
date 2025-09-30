const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbpath = path.join(__dirname,'database.db')
const db = new sqlite3.Database(dbpath,(err)=>{
    if(err){
        console.log('error in connecting to the database', err.message)
    }
    else{
        console.log('Database connected successfully')
    }
})

module.exports = db