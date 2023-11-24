const express = require('express')
const {restart} = require('nodemon')
const app = express()
const mongoose = require('mongoose')
require('dotenv/config')
const bodyParse = require('body-parser')
const UserRouter = require('./routes/user')
const PoliticsRouter = require('./routes/politics')
const TechRouter = require('./routes/tech')

app.use(bodyParse.json())
app.use('/api',UserRouter)
app.use('/pizza/politics',PoliticsRouter)
app.use('/pizza/tech',TechRouter)


mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log('DB connected')
})

app.listen(3000,()=>{
    console.log('app is running')
})