const User=require('./../usermodel');
const AppError=require('./../appError');
const factory=require('./handlerfactory');
const catchAsync=fn=>{
  return(req,res,next)=>{

  fn(req,res,next).catch(err=>next(err))
}
}
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedfields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateUser =factory.updateOne(User)
exports.deleteUser=factory.deleteOne(User)
exports.updateMe=catchAsync(async(req,res,next)=>{
  //1 create error if user posts password data
  if(req.body.password||req.body.confirmpassword){
    return next(new AppError('this route is not for password updates please use '))    
  }
  //2 update user account
  const filterbody=filterObj(req.body,'name','email');
  const user=await User.findByIdAndUpdate(req.user.id,filterbody,{new:true,runValidators:true});
  res.status(200).json({
      status:'success',
      data:{
        user
      }
  }) 
})
exports.deleteMe=catchAsync(async(req,res,next)=>{
  const user=await User.findByIdAndUpdate(req.user.id,{active:false});
  console.log(user);
  res.status(204).json({
    status:'success'
  })
})
exports.getMe=(req,res,next)=>{
  req.params.id=req.user.id;
  next();
}