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
  
 
 userSchema=new mongoose.Schema({
    id:mongoose.Schema.Types.ObjectId,
    FirstName:String,
    LastName:String,
    email:String,
    password:String,
blog:[{
     userId:mongoose.Schema.Types.ObjectId,
title:String,
content:String,
category:String
}]
  })

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

res.render('blog',
    {currentUser: { _id: req.params.userid }})
 })

app.get('/user/:userid/about', (req,res)=>{
res.render('about', {currentUser: { _id: req.params.userid }})
 })
 app.get('/user/:userid/contact', (req,res)=>{
res.render('contact', {currentUser: { _id: req.params.userid }})
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
app.post('/user/:userid/blog', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) {
      return res.status(404).send("User not found");
    }

    const newPost = {
      title:    req.body.title,
      content:  req.body.message,   // your form uses 'message'
      category: req.body.category 
    };

    currentUser.blog.push(newPost);
    await currentUser.save();

    console.log("Post added for user:", currentUser._id);
    res.redirect(`/user/${req.params.userid}/home`);
  } catch (err) {
    console.error("Error creating post:", err);
    res.redirect(`/user/${req.params.userid}/blog`);
  }
});
 

 app.get('/user/:userid/home', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) {
      return res.render('home', { posts: [], error: 'User not found' });
    }

    // newest first
    const posts = currentUser.blog

    res.render('home', {
      posts:posts,
      currentUser: { _id: req.params.userid }
    });
  } catch (err) {
    console.error('Error loading home:', err);
    res.render('home', { posts: [], error: 'Could not load posts' });
  }
});

 app.get('/user/:userid/categories/:category', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) return res.render('category', { task: [], category: req.params.category });

    const filteredPosts = currentUser.blog.filter(
      p => p.category.toLowerCase() === req.params.category.toLowerCase()
    );

    res.render('category', {
      task:     filteredPosts,
      category: req.params.category,
      currentUser:{_id:req.params.userid}
    });
  } catch (err) {
    console.error('Category error:', err);
    res.render('category', { task: [], category: req.params.category });
  }
});
app.delete('/user/:userid/posts/:id', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) return res.status(404).send("User not found");

    const post = currentUser.blog.id(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    post.remove();   // removes from array
    await currentUser.save();

    res.sendStatus(200);
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send();
  }
});
app.get('/user/:userid/posts/:id/edit', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) return res.status(404).send("User not found");

    const post = currentUser.blog.id(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    res.render('edit', { task: post ,currentUser:{_id:req.params.userid}});
  } catch (err) {
    console.error('Error loading edit page:', err);
    res.status(500).send();
  }
});
app.put('/user/:userid/posts/:id', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const post = currentUser.blog.id(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.title    = req.body.title    || post.title;
    post.content  = req.body.content  || post.content;
    // post.category = req.body.category || post.category;   // add if your form sends it

    await currentUser.save();

    res.json(post);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});
app.get('/user/:userid/posts/:id', async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.userid);
    if (!currentUser) return res.status(404).send("User not found");

    const post = currentUser.blog.id(req.params.id);   // Mongoose subdocument .id()
    if (!post) return res.status(404).send("Post not found");

    res.render('post',
      {currentUser:{_id:req.params.userid}, task: post },
       );
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).send('Server error');
  }
});
 app.post('/admin-login',(req,res)=>{
     const {user}=req.body
    const {pass}=req.body
    const username=process.env.ADMIN_USERNAME
    const password=process.env.ADMIN_PASSWORD
    try{
if(user!==username && pass!==password){
    console.log('Wrong sign in parameters!')
 res.redirect('/admin-login')
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
//   app.delete('/admin-home/:id',(req,res)=>{
//     blogTask.findByIdAndDelete(req.params.id)
//     .then(()=>{
//         console.log('User successfully deleted!')
//         res.redirect('admin-home')
//     })
//     .catch(error=>{
//         console.log('Error deleting task!! ',error)
//     })
//  })
//  app.get('/admin-home',(req,res)=>{
//     blogTask.find()
// .then(posts=>{
    
// res.render('admin-home',{posts:posts})
// console.log(posts)

// })
// .catch(error=>{
//     console.error('Error fetching posts: ',error)
//     res.render('home')
// })
   
// })
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

  
