const express=  require('express')
const bodyParser=require('body-parser')
const _=require('lodash')
const ejs=require('ejs')
const mongoose=require('mongoose')
 require('dotenv').config()

const nodemailer=require ('nodemailer')
const app= express()
 app.use(express.static('public'))
 app.use(bodyParser.urlencoded({extended:true}))
 app.set('view engine','ejs')
 app.use(express.json())

// ────────────────────────────────────────────────
// Add this middleware - makes currentUser available in all views
// ────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = null;

  // Very simple user detection based on route parameter (temporary solution)
  if (req.params.userid) {
    res.locals.currentUser = { _id: req.params.userid };
  }
  
  // You can improve this later with real sessions
  next();
});
  
 const response= mongoose.connect('mongodb+srv://glamaurora001_db_user:rOyqavlXcENy5WOp@blogsite-v1.k7c1e2h.mongodb.net/?appName=BLOGSITE-V1')
  
 response.then(()=>{
     console.log('SERVER RUNNING ON MONGODB ATLAS')
 })
 .catch(error=>{
    console.error('Error connecting to atlas server',error)
 })
 
 const posts=[]

 
  adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
       password:{
        type:String,
        required:true
       },
      userSchema:{
        type:String
       }
    
  })
  
  blogSchema=new mongoose.Schema({
    userId:mongoose.Schema.Types.ObjectId,
title:String,
content:String,
category:String
 })
 userSchema=new mongoose.Schema({
    id:mongoose.Schema.Types.ObjectId,
    FirstName:String,
    LastName:String,
    email:String,
    password:String,
blogSchema:String
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
 var array=[]
app.get('/user/:userid/blog', (req,res)=>{

res.render('blog')
 })

app.get('/user/:userid/about', (req,res)=>{
res.render('about')
 })
 app.get('/user/:userid/contact', (req,res)=>{
res.render('contact')
 })
app.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await user.findOne({ email: email });

    if (!foundUser || foundUser.password !== password) {   // ← note: plaintext comparison (bad!)
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Redirect with user ID in URL (temporary — sessions would be better)
    res.redirect(`/user/${foundUser._id}/home`);
    
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Something went wrong' });
  }
});

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
     array.push(user_x._id)

        res.redirect('/')
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
 app.post('/user/:userid/contact',async(req,res)=>{
    const subject=req.body.messagetitle
    const message=`
    <h2>Email: ${req.body.email}</h2>
    <h1>${req.body.messagetitle}</h1>
    <p>${req.body.messagecontent}</p>
    `

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
app.post('/user/:userid/blog', (req,res)=>{
const post={
    title:req.body.title,
    content:req.body.message ,
    category:req.body.category,
    poster:req.params.Firstname
}
blogTask.create(post)
.then(()=>{
console.log(post)

res.redirect('/user/:userid/home')

})
.catch(error=>{
    console.error('Error creating post', error)
})

 })

 

 app.get('/user/:userid/home', async (req, res) => {
  try {
    const posts = await blogTask.find()
      .sort({ _id: -1 })          // newest first
      .lean();                    // better performance for plain objects

    res.render('home', { 
      posts,
      // currentUser is already set by middleware, but we can make sure
      currentUser: { _id: req.params.userid }
    });
  } catch (err) {
    console.error('Error loading home:', err);
    res.render('home', { posts: [], error: 'Could not load posts' });
  }
});

 app.get('/user/:userid/categories/:category',(req,res)=>{ 
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
 app.delete('/user/:userid/posts/:id',(req,res)=>{
    blogTask.findByIdAndDelete(req.params.id)
    .then(()=>{
        
        console.log('Post successfully deleted')
        res.sendStatus(200)
        
    })
.catch(error=>{
    console.error('Error deleting posts',error)
})
 })
 app.get('/user/:userid/posts/:id/edit',(req,res)=>{
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
 app.put('/user/:userid/posts/:id',(req,res)=>{
  const find=  blogTask.findByIdAndUpdate(req.params.id,{title:req.body.title,content:req.body.content})
    .then(()=>{
    console.log('Post has been updated successfully ')
    
   res.json(find)
    })
    .catch(error=>{
        console.error('Error updating tasks',error)
    })
 })
 app.get('/user/:userid/posts/:id' ,(req,res)=>{
blogTask.findById(req.params.id)
.then( task=>{
    res.render('post',{task:task})
console.log(task)
})

.catch(error=>{
    console.error('Error fetching tasks:',error)
})

 })
 app.post('/admin-login',(req,res)=>{
     const {user}=req.body
    const {pass}=req.body
    const username=process.env.ADMIN_USERNAME
    const password=process.env.ADMIN_PASSWORD
    try{
if(user!==username && pass!==password){
    console.log('Wrong sign in parameters!')
 res.redirect('/home/admin-login')
 modal.showModal()

}else{
    console.log('Admin sign-in successful')
    res.redirect('/admin')
}
    }catch(error){

    }
 })
 app.delete('/admin/:id',(req,res)=>{
    user.findByIdAndDelete(req.params.id)
    .then(()=>{
        console.log('User successfully deleted!')
        res.render('admin')
    })
    .catch(error=>{
        console.log('Error deleting user!! ',error)
    })
 })
  app.delete('/admin-home/:id',(req,res)=>{
    blogTask.findByIdAndDelete(req.params.id)
    .then(()=>{
        console.log('User successfully deleted!')
        res.redirect('admin-home')
    })
    .catch(error=>{
        console.log('Error deleting task!! ',error)
    })
 })
 app.get('/admin-home',(req,res)=>{
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
app.get('/admin-login',(req,res)=>{
    res.render('admin-login')
})
app.get('/admin',(req,res)=>{
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

  
