const db = require('../db/db')
const userTable = () =>{
    const sql = `
    create table if not exists user(
        user_id text primary key, 
        full_name text not null, 
        mobile_no text not null unique, 
        pan_num text not null, 
        manager_id integer, 
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER DEFAULT 1,
        foreign key (manager_id) references manager(id)
        )
    `

    db.run(sql, (err)=>{
        if (err){
            console.error('error while creating the user table',err.message)
        }
        console.log('User table got created successfully')
    })
}

module.exports = userTable