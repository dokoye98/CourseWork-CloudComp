const joi = require('joi')


const signUpValidaiton = (data)=>{

    const schemaValidation = joi.object({

        firstname:joi.string().required().min(1).max(256),
        lastname:joi.string().required().min(1).max(256),
        username:joi.string().required().min(6).max(256),
        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1056),
    })
    return schemaValidation.validate(data)
}

const loginValidation =(data)=>{
    const schemaValidation = joi.object({

        email:joi.string().required().min(6).max(256).email(),
        password:joi.string().required().min(6).max(1056)
    })
    return schemaValidation.validate(data)
}

const postValidation = (data)=>{
    const schemaValidation = joi.object({
        title:joi.string().required().min(1).max(256),
        timeLimit:joi.number().required()
    })
    return schemaValidation.validate(data)
}
module.exports.signUpValidaiton = signUpValidaiton
module.exports.loginValidation = loginValidation
module.exports.postValidation = postValidation