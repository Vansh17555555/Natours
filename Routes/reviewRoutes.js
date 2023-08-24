const express=require('express')
const reviewcontroller=require('./../controllers/reviewcontroller');
const authcontroller=require('./../controllers/authenticationcontroller');

const router=express.Router({mergeParams:true});
router.route('/')
.delete(reviewcontroller.deleteReview)
.get(reviewcontroller.getAllReviews)
.post(authcontroller.protect,authcontroller.restrictto,reviewcontroller.createReview)
module.exports=router;
