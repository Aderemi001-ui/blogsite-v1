const jwt=require('jsonwebtoken')
function  requireAuth(req,res,next){
const token = req.cookies.jwt 
if(token){
    jwt.verify(token,'This is my token',(err,decodedToken)=>{
if(err){
    console.log(err.message);
    res.render('login')
}else{
    next()
    console.log(decodedToken);
}
    })
}else{
    res.redirect('/')
}
}

module.exports=requireAuth