const User=require('./../usermodel')
const Tour = require('./../tourmodel');
const Review = require('./../reviewmodel');
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ name: req.params.slug });

if (!tour) {
  // Handle case where tour is not found
  return res.status(404).render('404', {
    title: 'Tour Not Found'
  });
}

const reviews = await Review.find({ 'tour': tour._id }); // Fetch reviews for the specific tour
console.log(reviews);

res.status(200).render('tour', {
  title: tour.name,
  tour: tour,
  reviews: reviews // Pass the fetched reviews to the template
});

});
const CSP = 'Content-Security-Policy';
const POLICY =
  "default-src 'self' https://*.mapbox.com;" +
  "connect-src 'self' http://127.0.0.1:3000/api/v1/users/login;" +
  "base-uri 'self'; block-all-mixed-content;" +
  "font-src 'self' https: data:;" +
  "frame-ancestors 'self';" +
  "img-src http://localhost:3000 'self' blob: data:;" +
  "object-src 'none';" +
  "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob:;" +
  "script-src-attr 'none';" +
  "style-src 'self' https: 'unsafe-inline';" +
  'upgrade-insecure-requests';

exports.getloginform=catchAsync(async(req,res,next)=>{

  res.status(200).setHeader(
    CSP,POLICY
  ).render('login',{
    title:'login into your account'
  })
})
exports.getAccount=(req,res)=>{
  res.status(200).render('account',{
    title:'Your account'
  })
}
exports.updateuserdata=async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.user.id,{
      name:req.body.name,
      email:req.body.email
    },{
      new:true,
      runValidators:true
    }
    )
    res.status(200).render('account',{
      title:'your account'
    });
}