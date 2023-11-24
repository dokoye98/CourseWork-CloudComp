const mongoose = require('mongoose')

const TechSchema = mongoose.Schema({


    message:{
        type:String,
        required:true,
        min:1,
        max:256

    },
    
    dateposted:{
        type:Date,
        default:Date.now
    },
    timeLimit:{
        type:Number
    },
    expireDate:{
        type:Date
    },
    likes:{
        type:Number,
        default:0
    },
    likedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    likeList:{
        type:[String]
    },
    dislike:{
        type:Number,
        default:0
    },
    dislikedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],
    dislikeList:{
        type:[String]
    },
   comments:{
    type:[String]
   },
   expired:{
    type:Boolean,
    default:false
   },
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
   }


},
{
    versionKey:false
}
)
//collection name is silly but mongodb makes name plural so its this or teches
module.exports = mongoose.model('techs',TechSchema)