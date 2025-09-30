const express = require('express'); 
const app = express()
app.use(express.json())

app.get('/', (req , res)=>{
    res.status(200).send('Successfully running in the backend')
})

app.use((err,req , res, next)=>{
    res.status(500).json({message:err.message})
})

app.listen(5000, ()=>{
    console.log('application running in http://localhost:5000')
})

