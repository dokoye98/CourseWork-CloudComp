const express = require('express')
const {restart} = require('nodemon')
const app = express()
const mongoose = require('mongoose')
require('dotenv/config')
const bodyParse = require('body-parser')
const UserRouter = require('./routes/user')
const PostRouter = require('./routes/post')

app.use(bodyParse.json())
app.use('/api',UserRouter)
app.use('/pizza',PostRouter)

mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log('DB connected')
})

app.listen(3000,()=>{
    console.log('app is running')
})