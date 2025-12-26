const express=  require('express')
const bodyParser=require('body-parser')
const _=require('lodash')
const ejs=require('ejs')
const mongoose=require('mongoose')
const nodemailer=require ('nodemailer')
const app= express()
 app.use(express.static('public'))
 app.use(bodyParser.urlencoded({extended:true}))
 app.set('view engine','ejs')
 app.use(express.json())
 const response= mongoose.connect('mongodb+srv://glamaurora001_db_user:rOyqavlXcENy5WOp@blogsite-v1.k7c1e2h.mongodb.net/?appName=BLOGSITE-V1')
  
 response.then(()=>{
     console.log('SERVER RUNNING ON MONGODB ATLAS')
 })
 .catch(error=>{
    console.error('Error connecting to atlas server',error)
 })
 
 const posts=[]

  userSchema=new mongoose.Schema({
    FirstName:String,
    LastName:String,
    email:String,
    password:String
  })
  adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
       password:{
        type:String,
        required:true
       }
    
  })
  
  blogSchema=new mongoose.Schema({
title:String,
content:String,
category:String
 })

const blogTask=mongoose.model('blogTask',blogSchema)
const user= mongoose.model('user',userSchema)
const admin= mongoose.model('admin',adminSchema)
const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'abdulquadriaderemi52@gmail.com',
        pass:'earb cigu yosb dpwd'
    },
    debug:true
})
app.get('/home/blog', (req,res)=>{
res.render('blog' )
 })

app.get('/home/about', (req,res)=>{
res.render('about' )
 })
 app.get('/home/contact', (req,res)=>{
res.render('contact' )
 })
 app.post('/',(req,res)=>{
     const {email}=req.body
    const {password}=req.body
    try{
user.findOne({email:email}&&{password:password})
.then(user_x=>{
    if(user_x){
        console.log('User found')
        console.log(user_x)
        res.redirect('/home')
    }else{
console.log('user with this credentials not found')

res.render('login')
    }
})
.catch(error=>{
    console.error('Error fetching user',error)
})
    }catch(error){
console.log(error)
    }
 })
 app.get('/',(req,res)=>{
    res.render('login')
 })
app.post('/signup',(req,res)=>{
  const credentials={
      email:req.body.email,
      password:req.body.password,
     fullname:req.body.name
  }
   
try{
  user.findOne({email:credentials.email}&&{password:credentials.password})
.then(user_x=>{
     
    if(!user_x){
        user.create(credentials)
       
        console.log('User successfully registered',)
        res.redirect('/home')
    }else{
        console.log('User with same credentials already exists,Pls sign in with right credentials instead!')

        console.log(user_x)
res.render('login')
    }

})
.catch(error=>{
console.log('Error registering user',error)
})


}catch(error){
console.log(error)
}
})


 app.get('/signup',(req,res)=>{
    res.render('signup')
 })
 app.post('/home/contact',async(req,res)=>{
    const subject=req.body.messagetitle
    const message=req.body.messagecontent
   
    const mailoptions={
        from:`${req.body.email}`,
        to:'abdulquadriaderemi52@gmail.com',
        title:subject,
       subject:message
    }
    try{
        const info=await transporter.sendMail(mailoptions)
        console.log('email sent',info.response)
        res.status(200).json({message:'message sent successfully'})
    }catch(error){
console.error('Error sending mail',error)
res.status(500).json({error:'Failed to send email'})
    }
 })
app.post('/home/blog', (req,res)=>{
const post={
    title:req.body.title,
    content:req.body.message ,
    category:req.body.category,
    poster:req.params.name
}
blogTask.create(post)
.then(()=>{
console.log(post)

res.redirect('/home')

})
.catch(error=>{
    console.error('Error creating post', error)
})

 })
 app.get('/home', (req,res)=>{
blogTask.find()
.then(posts=>{
    
res.render('home',{posts:posts})
console.log(posts)

})
.catch(error=>{
    console.error('Error fetching posts: ',error)
    res.render('home')
})
 })

 app.get('/home/categories/:category',(req,res)=>{ 
    const category= req.params.category
    blogTask.find({category:category})
 .then(posts=>{
    console.log('Posts found',)
res.render('category',{task:posts,category:category})
 })
 .catch(error=>{
    console.log('Error fetching tasks',error)
 })
 })
 app.delete('/home/posts/:id',(req,res)=>{
    blogTask.findByIdAndDelete(req.params.id)
    .then(()=>{
        
        console.log('Post successfully deleted')
        res.sendStatus(200)
        
    })
.catch(error=>{
    console.error('Error deleting posts',error)
})
 })
 app.get('/home/posts/:id/edit',(req,res)=>{
    blogTask.findById(req.params.id)
    .then(task=>{
        console.log('Post found')
        res.render('edit',{task:task})
    })
    .catch(error=>{
        console.error('Error fetching task',error)
        res.status(400).send()
    })
 })
 app.put('/home/posts/:id',(req,res)=>{
  const find=  blogTask.findByIdAndUpdate(req.params.id,{title:req.body.title,content:req.body.content})
    .then(()=>{
    console.log('Post has been updated successfully ')
    
   res.json(find)
    })
    .catch(error=>{
        console.error('Error updating tasks',error)
    })
 })
 app.get('/home/posts/:id' ,(req,res)=>{
blogTask.findById(req.params.id)
.then( task=>{
    res.render('post',{task:task})
console.log(task)
})

.catch(error=>{
    console.error('Error fetching tasks:',error)
})

 })
 app.post('/home/admin-login',(req,res)=>{
    const username='NEXADMIN'
    const password='NEXA001'
    try{
if(!username && !password){
    console.log('Wrong sign in parameters!')
    res.render('/home/admin-login')
}else{
    console.log('Admin sign-in successful')
    res.redirect('/home/admin')
}
    }catch(error){

    }
 })
 app.delete('/home/admin/:id',(req,res)=>{
    user.findByIdAndDelete(req.params.id)
    .then(()=>{
        console.log('User successfully deleted!')
        res.render('admin')
    })
    .catch(error=>{
        console.log('Error deleting user!! ',error)
    })
 })
  app.delete('/home/admin-home/:id',(req,res)=>{
    blogTask.findByIdAndDelete(req.params.id)
    .then(()=>{
        console.log('User successfully deleted!')
        res.redirect('admin-home')
    })
    .catch(error=>{
        console.log('Error deleting task!! ',error)
    })
 })
 app.get('/home/admin-home',(req,res)=>{
    blogTask.find()
.then(posts=>{
    
res.render('admin-home',{posts:posts})
console.log(posts)

})
.catch(error=>{
    console.error('Error fetching posts: ',error)
    res.render('home')
})
   
})
app.get('/home/admin-login',(req,res)=>{
    res.render('admin-login')
})
app.get('/home/admin',(req,res)=>{
const FirstName=req.params.FName
    const LastName=req.params.LName
    user.find(req.params.id)
    .then(users=>{
        console.log(users)
        console.log('All registered users found!!')
         res.render('admin',{credentials:users})
    })
    .catch(error=>{
        console.log('Error fetching users',error)
    })

})


 app.listen(3000,()=>{
    console.log('SERVER IS RUNNING ON PORT 3000!!')
 })