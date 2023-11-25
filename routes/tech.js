const express  = require('express')
const router = express()
const Tech = require('../model/Tech')
const User = require('../model/User')
const {postValidation} = require('../validations/validation')
const token = require('../tokenGenerator')

router.post('/newpost',token,async(req,res)=>{
const {error} = postValidation(req.body)
if(error){
    return res.status(400).send({message:error['details'][0]['message']})
}
    const user_Id = req.user._id
    let expiredTime = new Date()
    // Right now, the conversion rate is minutes * 60 * 1000
    expiredTime.setTime(Date.now() + req.body.timeLimit * 60 * 1000)

    try {
        const currentDate = new Date().getTime()
        if (currentDate >= expiredTime.getTime()) {
            return res.status(400).send({ message: ' time limit has already expired' })
        }

        const dataFormat = new Tech({
            message: req.body.message,
            expireDate: expiredTime,
            userId: user_Id
        })

        const newPost = await dataFormat.save()
        const username = await User.findById(newPost.userId)

        return res.status(200).send({
            Topic: "Tech",
            Poster: username.username,
            PostId: newPost._id,
            Message: newPost.message,
            DatePost:newPost.dateposted,
            ExpirationTime:newPost.expireDate,
            NumberOfLikes: newPost.likes,
            NumberOfDislikes: newPost.dislike
        })
    }catch(err){
        return res.status(400).send({message:'Sorry invalid post'})
    }
})
/*
I had to trigger the expired update so will be commented until further notice
router.get('/',token,async(req,res)=>{
    try{
        const allPosts = await Post.find()
        console.log('posts are being shown')
        return res.status(200).send(allPosts)
    }catch(err){

        return res.status(400).send({message:err})
    }
})*/

//post function as it is supposed to constantly update posts
router.post('/homepage',token,async(req,res)=>{
    try {
        const posts = await Tech.find().populate('userId','username')
        const currentDate = new Date().getTime()
        //map function iterates (goes through) the post array(collection of all post entries)
         // Troubleshooting problems have to make a new date object for code to work
        const expiredDates = posts.map(post => {
            return new Date(post.expiredDate).getTime()
        })

        // Check and update expiration status for each post
        //i = 0 and will increment along as the map function iterates through array
        const expireCheck = posts.map((post, i) => {
            if (currentDate >= expiredDates[i]) {
                post.expired = true
            }
            return post
        })

        res.status(200).send(expireCheck)
    } catch (err) {
        console.error(err)
        res.status(400).send({ message: 'Error' })
    }
})

router.post('/like/:techId',token,async(req,res)=>{
    try {
        const techId = req.params.techId
        const post = await Tech.findById(techId)

        const userId = req.user._id
        if (!post) {
            return res.status(400).send({ message: 'Post not found' })
        }

        const expire = post.expireDate.getTime()
        const currentDate = new Date().getTime()

        if (currentDate >= expire) {
            console.log('expired post')
            const expiredPost = await Tech.findByIdAndUpdate(techId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot like post has expired', Post:expiredPost.message,
        ExpiredStatus:expiredPost.expired,Likes:expiredPost.likes,Dislikes:expiredPost.dislike })
        }
        const username = await User.findById(userId)
        if (post.likedBy.includes(userId) || post.dislikedBy.includes(userId)) {
            // User has already liked the post might add an unlike feature
            if(post.likedBy.includes(userId) ){
                const unLikePost =  await Tech.findByIdAndUpdate(techId,{$inc:{likes:-1},
                    $pull:{likedBy:userId, likeList:username.username}},{new:true})
                console.log('post unliked')
                return res.status(200).send({message:'Post unliked',
                PeopleWhoLiked:unLikePost.likedList,NumberOfLikes:unLikePost.likes})
            }
            if(post.dislikedBy.includes(userId)){
                const dislikeRemoved = await Tech.findByIdAndUpdate(techId, {$inc:{dislike: -1,likes:1},
                     $pull:{dislikedBy:userId,dislikeList:username.username},
                    $addToSet:{likedBy:userId,likedList:username.username}},{new:true})
                console.log('post liked')
                return res.status(200).send({message:'Disliked removed and post liked',
                PeopleWhoDisliked:dislikeRemoved.dislikeList,
                NumberOfDislikeds:dislikeRemoved.dislike})
            }
           
        }

        // Like the post and add user's ID to the 'likedBy' array
       const likedPost= await Tech.findByIdAndUpdate( techId,{ $inc: { likes: 1 }, 
        $addToSet: { likedBy: userId, likeList:username.username}},{ new: true })
        console.log('post liked')
        //console.log(typeof username.username)
      return res.status(200).send({PeopleWhoLiked:likedPost.likeList,NumberOfLikes:likedPost.likes,
        PeopleWhoDisliked:likedPost.dislikeList,
        NumberOfDislikeds:likedPost.dislike})
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})


router.post('/dislike/:techId',token,async(req,res)=>{
    try {
        const techId  = req.params.techId
        const post = await Tech.findById(techId)

        const userId = req.user._id
        if (!post) {
            return res.status(400).send({ message: 'Post not found' })
        }

       
        const expire = post.expireDate.getTime()
        const currentDate = new Date().getTime()

        if (currentDate >= expire) {
            console.log('expired post')
            const expiredPost = await Tech.findByIdAndUpdate(techId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot dislike post has expired', Post:expiredPost.message,
        ExpiredStatus:expiredPost.expired,Likes:expiredPost.likes,Dislikes:expiredPost.dislike })
        }
        const username = await User.findById(userId)
        if (post.dislikedBy.includes(userId) || post.likedBy.includes(userId)) {
            if(post.dislikedBy.includes(userId)){
                const dislikeRemoved = await Tech.findByIdAndUpdate(techId, {$inc:{dislike: -1}, 
                    $pull:{dislikedBy:userId,dislikeList:username.username}},{new:true})
                console.log('post un-disliked')
                return res.status(200).send({message:'Disliked removed',
                PeopleWhoDisliked:dislikeRemoved.dislikeList,
                NumberOfDislikeds:dislikeRemoved.dislike})
            }
            if(post.likedBy.includes(userId) ){
                const unLikePost =  await Tech.findByIdAndUpdate(techId,{$inc:{likes:-1,dislike:1},
                    $pull:{likedBy:userId, likeList:username.username}, 
                    $addToSet:{dislikedBy:userId,dislikeList:username.username}},{new:true})
                console.log('post unliked')
                return res.status(200).send({Topic:'Tech',message:'Post disliked',
                PeopleWhoLiked:unLikePost.likedList,NumberOfLikes:unLikePost.likes,
                NumberofDislikes:unLikePost.dislike,
                PeopleWhoDisliked:unLikePost.dislikeList})
            }
           
        }

        // dislike the post and add user's ID to the 'dislike' array and username to the dislikeList array
       const likedPost= await Tech.findByIdAndUpdate( techId,{ $inc: { dislike: 1 }, 
        $addToSet: { dislikedBy: userId, dislikeList:username.username}},{ new: true })
        console.log('post disliked')
        //console.log(typeof username.username)
      return res.status(200).send({message:'Post disliked',details:likedPost})
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})

router.get('/mostliked',token,async (req,res)=>{
    try{
        const mostliked = await Tech.find().sort({likes:-1})
        //map function iterates through the array of posts 
        const likelistOfPosts = mostliked.map(tech => ({
            title: tech.message,
            DatePosted: tech.dateposted,
            Expiredstatus: tech.expired,
            Likes: tech.likes,
            Dislikes: tech.dislike,
            WhoLiked: tech.likeList,
            WhoDisliked: tech.dislikeList,
            comments: tech.comments
        }))
        res.status(200).send(likelistOfPosts)

    }catch(err){
        res.send(err)
    }
})

router.get('/mostdisliked',token,async(req,res)=>{
    try{
        const mostdisliked = await Tech.find().sort({dislike:-1})
        const dislikeListOfPosts = mostdisliked.map(tech =>({
            title: tech.message,
            DatePosted: tech.dateposted,
            Expiredstatus: tech.expired,
            Likes: tech.likes,
            Dislikes: tech.dislike,
            WhoLiked: tech.likeList,
            WhoDisliked: tech.dislikeList,
            comments: tech.comments
        }))
        res.status(200).send(dislikeListOfPosts)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/expiredposts',token,async(req,res)=>{
    try{
        const expiredPosts = await Tech.find({expired:true})
       /* const expiredlistOfPosts = expiredPosts.map(tech => ({
            title: tech.message,
            DatePosted: tech.dateposted,
            Expiredstatus: tech.expired,
            Likes: tech.likes,
            Dislikes: tech.dislike,
            WhoLiked: tech.likeList,
            WhoDisliked: tech.dislikeList,
            comments: tech.comments
        }))*/
        res.status(200).send(expiredPosts)

        
    }catch(err){
        return res.status(400).send({message:err})
    }
})

router.post('/:techId/comment', token, async (req, res) => {
    try {
        const newComment = req.body.comments
        const post = await Tech.findById(req.params.techId)
        const userId = req.user._id
        const user = await User.findById(userId)
        const username = user.username
    
        if (!post) {
          return res.status(404).send({ message: 'Post not found' })
        }
        
        const expire = post.expireDate.getTime()
        const currentDate = new Date().getTime()

        if (currentDate >= expire) {
            console.log('expired post')
            const expiredPost = await Tech.findByIdAndUpdate(techId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot comment post has expired', Post:expiredPost.message,
        ExpiredStatus:expiredPost.expired,Likes:expiredPost.likes,Dislikes:expiredPost.dislike })
        }
    //standard checks 
        if (!newComment || typeof newComment !== 'string') {
          return res.status(400).send({ message: 'Invalid comment' })
        }
        post.comments.push(newComment)
        const updatedPost = await post.save()
    
        res.status(200).send({ username: updatedPost.comments })
      } catch (err) {
        res.status(500).send({ message: 'Error adding comment' })
      }
    })
module.exports = router