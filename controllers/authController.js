const user=require('../model/user')
const bcrypt=require('bcrypt')

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
  await user.findOne({email:credentials.email}&&{password:credentials.password})
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
}
module.exports.login_get=(req,res)=>{
    res.render('login')
}
module.exports.login_post=async(req,res)=>{
     const { email, password } = req.body;

  try {
    const foundUser =await user.findOne({ email: email });

    if (!foundUser) {   // ← note: plaintext comparison (bad!)
      return res.render('login', { error: 'Invalid email or password' });
    }else{
      const isMatch=await bcrypt.compare(password,foundUser.password)
    if(isMatch){  
 res.redirect(`/user/${foundUser._id}/home`);
    }
    return  { error: 'Invalid email or password' };
    }

   
    
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Something went wrong' });
  }
}