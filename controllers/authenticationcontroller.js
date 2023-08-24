const crypto=require('crypto');
const util=require('util')
const jwt=require('jsonwebtoken');
const User=require('./../usermodel');
const AppError = require('../appError');
const validator=require('validator');
const sendEmail=require('./../email');
const cookieOptions = {
    Secure:false, // Set to true in production, false in development
    httpOnly: true,
  };
  
const catchAsync=fn=>{
    return(req,res,next)=>{
  
    fn(req,res,next).catch(err=>next(err))
  }
}
const signToken=id=>{
    return jwt.sign({
    id,},process.env.JWT_SECRET,{
        expiresIn:'10h'
    })
    httpOnly:true
}
exports.signup=catchAsync(async(req,res,next)=>{
    const newUser= await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword,
        passwordchangedAt:req.body.passwordchangedAt,
        role:req.body.role,    
        passwordresettoken:req.body.passwordresettoken,
        passwordresetexpires:req.body.passwordresetexpires
    });
        const token=signToken(newUser._id);
    res.status(201).json({
        status:"success",
        token,
        data:{
            user:newUser
        }
    })
});
exports.login=catchAsync(async(req,res,next)=>{
    const {email}=req.body;
    const {password}=req.body;
    //1 check if email and password exist
    if(!email||!password){
        return next(new AppError('please provide email and password ',400))
    }
    //2 check if user exists && password is correct
    const user=await User.findOne({email}).select('+password');
    console.log(password);
    const correct=await user.correctPassword(password,user.password);
    console.log(user);
    console.log(correct);
    if(!user||!correct){
        return next(new AppError('Incorrect email or password',401))
    }
    //3 check if everything is ok,send token to client
    const token=signToken(user._id);
    res.cookie('jwt',token,cookieOptions);
    res.status(200).json({
        status:'success',
        token,
    })
})
exports.logout=(req,res,next)=>{
    res.cookie('jwt','loggedOut',{
        expiresIn:new Date(Date.now+10*1000)
    })
    next()
}
exports.protect=catchAsync(async(req,res,next)=>{
    //1 get the token and check if its exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token =req.headers.authorization.split(' ')[1];
        console.log(token);
    }
    else if(req.cookies.jwt){
        token=req.cookies.jwt
        console.log(token);
    }
    if(!token){
        return next(new AppError('you are not logged in'));
    }
    //2 verification token
    const decoded=await util.promisify(jwt.verify)(token,process.env.JWT_SECRET)
    console.log(decoded);
    //3 check if user still exist
    const freshuser=await User.findById(decoded.id);
    if(!freshuser){
        next(new AppError('user no longer exist'));
    }
const passwordchanged=(JWTtimestamp)=>{
          if (freshuser.passwordchangedAt) {
            // Compare the timestamps
            console.log(freshuser.passwordchangedAt.getTime()/1000);
            console.log(JWTtimestamp)
            return freshuser.passwordchangedAt.getTime()/1000>JWTtimestamp;
          }
         }
const check=passwordchanged(decoded.iat);
if(check){
    return next(new AppError('password has been changed',401));
} 
            //4 check if user changed password
    req.user=freshuser;
    res.locals.user=freshuser;
    //4 check if user changed password
    next();
})
exports.restrictto=catchAsync(async(req,res,next)=>{
        if(req.user.role==='admin'||req.user.role==='lead-guide'){
            next()
        }
        else if(req.user.role==='user'){
            next()
        }
        else{
            return next(new AppError('you dont have permissions for that',403));
        }
    })
exports.forgotpassword=catchAsync(async(req,res,next)=>{
    //1 get user based on posted email
    const user=await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('there is no user with this email',404));
    }
    //2 generates the random reset token
    const resetToken=user.createpasswordresettoken();
    await user.save({validateBeforeSave:false})

    //3 send it to user's email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`
    const message=`Forgot your Password?Submit a patch request with your new passwor and passwordconfirm to:${resetURL}.\nif you didn't forget your password,pleaase ignore this email`;

        await sendEmail({
            url:resetURL,
        email:user.email,
        subject:'your password submit token valid for 10 mins',
        message
    })
    res.status(200).json({
        status:'success',
        message:'token sent to email!',
        
    })
})
exports.resetpassword=catchAsync(async(req,res,next)=>{
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({passwordresettoken:hashedToken,passwordresetexpires:{$gt:Date.now()}});
    //1 get user based on token
    //2 if token has not expired and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired',400))
    }
    user.password=req.body.password;
    user.confirmpassword=req.body.confirmpassword;
    user.passwordresettoken=undefined;
    user.passwordresetexpires=undefined;
    await user.save();
    //3 update changedpasswordat property for the user
    //4 log the user in,send JWt
    const token=signToken(user._id);
    res.cookie('jwt',token,cookieOptions);
    res.status(200).json({
        status:'success',
        token
    })
})
exports.updatepassword=catchAsync(async(req,res,next)=>{
    //1 get user from collection
    const user=await User.findById(req.user.id).select('+password')

    //2 check if posted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your currnt password is wrong',401))
    }

    //3 if so update password
    user.password=req.body.password;
    user.confirmpassword=req.body.confirmpassword;
    await user.save();
    const token=signToken(user._id);
    if(process.env.NODE_ENV='production') {cookieOptions.Secure='true';
}
    console.log(cookieOptions.Secure)
    res.status(200).json({
        status:'success',
        token
    })
    //4 log user in,send JWT
})
exports.isloggedin = catchAsync(async (req, res, next) => {
    // 1. Check if the JWT cookie exists
    if (req.cookies.jwt) {
        // 2. Verify the token
        const decoded = await util.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        // 3. Check if user still exists
        const freshuser = await User.findById(decoded.id);
        if (!freshuser) {
            return next(new AppError('User no longer exists'));
        }

        // 4. Check if user changed password
        const passwordChanged = (JWTtimestamp) => {
            if (freshuser.passwordChangedAt) {
                return freshuser.passwordChangedAt.getTime() / 1000 > JWTtimestamp;
            }
            return false;
        };

        const check = passwordChanged(decoded.iat);
        if (check) {
            return next();
        }

        // Set the user data in res.locals and continue middleware chain
        res.locals.user = freshuser;
        console.log(res.locals.user);
        next();
    } else {
        // If JWT cookie doesn't exist, continue middleware chain
        next();
    }
});
