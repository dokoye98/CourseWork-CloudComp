const express  = require('express')
const router = express()
const Post = require('../model/Politics')
const User = require('../model/User')
const {postValidation} = require('../validations/validation')
const token = require('../tokenGenerator')

router.post('/newpost',token,async(req,res)=>{
const {error} = postValidation(req.body)
if(error){
    return res.status(400).send({message:error['details'][0]['message']})
}
let expiredTime = new Date()
const user_Id = req.user._id

expiredTime.setTime(Date.now() + req.body.timeLimit *60*1000)
    const dataFormat = new Post({
        message:req.body.message,
        expireDate:expiredTime,
        userId:user_Id
    })

    try{
        const newPost = await dataFormat.save()
        return res.status(200).send(newPost)
    }catch(err){
        return res.status(400).send({message:'Sorry invalid post'})
    }
})
/*

router.get('/',token,async(req,res)=>{
    try{
        const allPosts = await Post.find()
        console.log('posts are being shown')
        return res.status(200).send(allPosts)
    }catch(err){

        return res.status(400).send({message:err})
    }
})*/


router.post('/homepage',token,async(req,res)=>{
    try {
        const posts = await Post.find().populate('userId','username')
        const currentDate = new Date().getTime()
        //map function iterates (goes through) the post array(collection of all post entries)
         // Troubleshooting problems have to make a new date object for code to work
        const expiredDates = posts.map(post => {
            return new Date(post.expiredDate).getTime()
        });

        
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

router.post('/like/:postId',token,async(req,res)=>{
    try {
        const postId = req.params.postId
        const post = await Post.findById(postId)

        const userId = req.user._id
        if (!post) {
            return res.status(400).send({ message: 'Post not found' })
        }

        const expire = post.expireDate.getTime()
        const currentDate = new Date().getTime()

        if (currentDate >= expire) {
            console.log('expired post')
            const expiredPost = await Post.findByIdAndUpdate(postId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot like post has expired', timeExpired })
        }
        const username = await User.findById(userId)
        if (post.likedBy.includes(userId) || post.dislikedBy.includes(userId)) {
            
            return res.status(400).send({ message: 'You cant do that' });
        }

        
       const likedPost= await Post.findByIdAndUpdate( postId,{ $inc: { likes: 1 }, $addToSet: { likedBy: userId, likeList:username.username}},{ new: true });
        console.log('post liked')
        
      return res.status(200).send({MessageLiker:likedPost.likeList, NumberOfLikes:likedPost.likes})
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})


router.post('/dislike/:postId',token,async(req,res)=>{
    try {
        const postId = req.params.postId
        const post = await Post.findById(postId)

        const userId = req.user._id
        if (!post) {
            return res.status(400).send({ message: 'Post not found' })
        }

       
        const expire = post.expireDate.getTime()
        const currentDate = new Date().getTime()

        if (currentDate >= expire) {
            console.log('expired post')
            const expiredPost = await Post.findByIdAndUpdate(postId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot dislike post has expired', timeExpired })
        }
        const username = await User.findById(userId)
        if (post.dislikedBy.includes(userId) || post.likedBy.includes(userId)) {
            
            return res.status(400).send({ message: 'Youre a real hater' });
        }

        
       const likedPost= await Post.findByIdAndUpdate( postId,{ $inc: { dislike: 1 }, $addToSet: { dislikedBy: userId, dislikeList:username.username}},{ new: true });
        console.log('post disliked')
        //console.log(typeof username.username)
      return res.status(200).send({message:'Post disliked',details:likedPost})
    } catch (err) {
        console.error(err)
        return res.status(400).send({ message: 'Error occurred' })
    }
})


router.post('/:postId/comment', token, async (req, res) => {
    try {
        const newComment = req.body.comments
        const post = await Post.findById(req.params.postId)
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
            const expiredPost = await Post.findByIdAndUpdate(postId,{$set:{expired:true}},{new:true})
            const timeExpired = new Date()
            timeExpired.setTime(expire)
            return res.status(400).send({ message: 'Cannot comment post has expired', timeExpired })
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