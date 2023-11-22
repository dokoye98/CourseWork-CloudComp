const jsonwebtoken = require('jsonwebtoken')

function val(req,res,next){
    const token = req.header('auth-token')
    if(!token){
        console.log('no account')
        return res.status(400).send({message:'Access denied'})
    }

    try{
        const verified = jsonwebtoken.verify(token,process.env.TOKEN_KEY)
        req.user = verified
        next()
    }catch(err){
        return res.status(400).send({message:err})
    }


}
module.exports = val