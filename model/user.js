const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
 require('dotenv').config()
const response= mongoose.connect('mongodb://glamaurora001_db_user:3z9NNLq7hK989iZ8@ac-kucepce-shard-00-00.tk57p3b.mongodb.net:27017,ac-kucepce-shard-00-01.tk57p3b.mongodb.net:27017,ac-kucepce-shard-00-02.tk57p3b.mongodb.net:27017/?ssl=true&replicaSet=atlas-k4hwfx-shard-0&authSource=admin&appName=BLOGSITE-V1')
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

userSchema.statics.login=async function(email,password){
   const foundUser =await this.findOne({ email: email });

    if (!foundUser) {   // ← note: plaintext comparison (bad!)
      return res.render('login', { error: 'Invalid email or password' });
    }else{
      const isMatch=await bcrypt.compare(password,foundUser.password)
    if(isMatch){  
 return foundUser
   
    }
    return  { error: 'Invalid email or password' };
    }
}


const user= mongoose.model('user',userSchema)
const admin= mongoose.model('admin',adminSchema)


module.exports=user
