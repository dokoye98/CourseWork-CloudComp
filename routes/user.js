const express = require('express')
const router = express()
const User = require('../model/User')
const {signUpValidaiton,loginValidation} = require('../validations/validation')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')


router.post('/signup',async(req,res)=>{

    const {error} = signUpValidaiton(req.body)
    if(error){
        console.log({message:error})
        //this will only return the error message 
        return res.status(400).send({message:error['details'][0]['message']})
    }
    //console.log('success')
    const emailCheck = await User.findOne({email:req.body.email})
    if(emailCheck){
        return res.status(400).send({message:'email is already in use'})
    }

    const userCheck = await User.findOne({username:req.body.username})
    if(userCheck){
        return res.status(400).send({message:'Username is already in use'})
    }
    //salt generator 
    const salt = await bcryptjs.genSalt(5)
    const hashfirstname = await bcryptjs.hash(req.body.firstname,salt)
    const hashlastname = await bcryptjs.hash(req.body.lastname,salt)
    const hashpassword = await bcryptjs.hash(req.body.password,salt)
    //want to encrypt firstname and lastname as well as password
    const dataFormat = new User({
        firstname:hashfirstname,
        lastname:hashlastname,
        username:req.body.username,
        email:req.body.email,
        password:hashpassword
    })
    try{
        const newUser = await dataFormat.save()
        console.log('new user added')
        return res.status(200).send(newUser)
    }catch(err){
        return res.status(400).send({message:err})
    }
})

router.post('/login',async(req,res)=>{


    const {error} = loginValidation(req.body)
    if(error){
        return res.status(400).send({message:error})
    }
    const emailCheck = await User.findOne({email:req.body.email})
    if(!emailCheck){
        return res.status(400).send({message:'Account does not exist'})
    }

    const passwordCheck  = await bcryptjs.compare(req.body.password,emailCheck.password)
    if(!passwordCheck){
        return res.status(400).send({message:'Incorrect password'})
    }
   const token = jsonwebtoken.sign({_id:emailCheck._id},process.env.TOKEN_KEY)
    res.header('auth-token',token).send({'auth-token':token})
    })


/*
router.get('/',async(req,res)=>{
    try{
        const accounts = await User.find()
        res.send(accounts)
    }catch(err){
        return res.status(400).send({message:err})
    }
})*/
module.exports = router