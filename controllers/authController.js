const User=require('../model/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const maxAge=3*24*60*60
const createToken=(id)=>{
  return jwt.sign({id},'This is my token',{expiresIn:maxAge})
}
module.exports.signup_get=(req,res)=>{
    res.render('signup')
}
module.exports.signup_post=async(req,res)=>{
  const salt=await bcrypt.genSalt()
  const hashpass=await bcrypt.hash(req.body.password,salt)
 const credentials={
      email:req.body.email,
      password:hashpass,
     fullname:req.body.name
  }
   
  
try{
  await User.findOne({email:credentials.email}&&{password:credentials.password})
.then(user_x=>{
     
    if(!user_x){
   User.create(credentials)
        console.log('User successfully registered',)
    const token=createToken(user_x._id)
    res.cookie('jwt',token,{maxAge:maxAge*1000*60*60*24})

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
}
module.exports.login_get=(req,res)=>{
    res.render('login')
}
module.exports.login_post=async(req,res)=>{
     const { email, password } = req.body;

  try {
    console.log('User successfully logged in');
  const user=await User.login(email,password)
  const token=createToken(user._id)
  res.cookie('jwt',token,{maxAge:maxAge*1000})
   res.redirect(`/user/${user._id}/home`);
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Something went wrong' });
  }
}