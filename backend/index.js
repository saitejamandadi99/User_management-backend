const express = require('express'); 
const app = express()
const managerTable = require('./models/managerModel')
const userTable = require('./models/userModel')
app.use(express.json())
managerTable(); 
userTable();

app.get('/', (req , res)=>{
    res.status(200).send('Successfully running in the backend')
})

app.use('/userdata', require('./routes/userRoutes'))

app.use((err,req , res, next)=>{
    res.status(500).json({message:err.message}) //error handling middleware global
})

app.listen(5000, ()=>{
    console.log('application running in http://localhost:5000')
})

