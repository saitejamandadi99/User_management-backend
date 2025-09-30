const express = requrie('express')
const db = requrie('./db/db')

const managerTable = () =>{
    const sql = `
    create table if not exists manager(
        id integer primary key, 
        is_active integer not null
    )`


db.run(sql,(err)=>{
    if (err){
        console.err('error while creating the manager table',err.message)
    }
    console.log('Manager table got created successfully')
})
}
module.exports = managerTable