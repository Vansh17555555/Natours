const express=require('express');
const viewscontroller=require('./../controllers/viewcontroller')
const authcontroller=require('./../controllers/authenticationcontroller')
const router=express.Router();

router.get('/',authcontroller.isloggedin,viewscontroller.getOverview);
router.get('/tour/:slug',authcontroller.isloggedin,viewscontroller.getTour);
router.get('/login',viewscontroller.getloginform);
router.get('/logout',authcontroller.logout,viewscontroller.getOverview);
router.get('/me',authcontroller.protect,viewscontroller.getAccount);
router.post('/submit-user-data',viewscontroller.updateuserdata)
module.exports=router;