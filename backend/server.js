const express=require('express')
const router=express.Router()
const cors=require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

const app=express()

// allow frontend to communicate with this server
app.use(cors())

//allow server to read json request from server
app.use(express.json())

//Mongodb Connection
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("MongoDb Connection Was Successful"))
    .catch(err=>console.log("Conection Error:",err))

//Register all routes

app.use('/api/auth',require('./routes/auth'))
app.use('/api/sessions',require('./routes/sessions'))
app.use('/api/attendance',require('./routes/attendance'))
app.use('/api/courses',require('./routes/courses'))
app.use('/api/chatbot',require('./routes/chatbot'))

//start server

const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server Running at http://localhost:${PORT}`)
});