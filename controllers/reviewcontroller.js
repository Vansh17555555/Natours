const Review=require('./../reviewmodel');
const factory=require('./handlerfactory')
const catchAsync=fn=>{
    return(req,res,next)=>{
  
    fn(req,res,next).catch(err=>next(err))
  }
  }
exports.getAllReviews=factory.getAll(Review);
exports.setTourUserIds=(req,res,next)=>{
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user.id;
}
exports.createReview=factory.createOne(Review)
exports.deleteReview=factory.deleteOne(Review)