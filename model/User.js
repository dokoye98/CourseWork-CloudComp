const mongoose = require('mongoose')

const UserScheam = mongoose.Schema({

    firstname:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    lastname:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    username:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    email:{
        type:String,
        required:true,
        min:6,
        max:256
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:1056
    }
},
{
    versionKey:false
}
)

module.exports = mongoose.model('users',UserScheam)