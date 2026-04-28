const mongoose=require('mongoose')
 require('dotenv').config()
const response= mongoose.connect(process.env.MONGODB_URI)
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


module.exports=user
