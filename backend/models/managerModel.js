const db = require('../db/db')

const managerTable = () =>{
    const sql = `
    create table if not exists manager(
        id text primary key, 
        is_active integer not null
    )`


db.run(sql,(err)=>{
    if (err){
        console.error('error while creating the manager table',err.message)
    }
    console.log('Manager table got created successfully')
})
}
module.exports = managerTable