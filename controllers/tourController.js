const fs = require('fs');
const tour=require('./../tourmodel');
const auth=require('./authenticationcontroller');
const factory=require('./handlerfactory');
//const tours = JSON.parse(
  //fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//);

/*exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};*/

/*exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};*/



const catchAsync=fn=>{
  return(req,res,next)=>{

  fn(req,res,next).catch(err=>next(err))
}
}
exports.alias=(req,res,next)=>{
  req.query.limit='5';
  req.query.fields='name.price,ratingsAverage,summary,difficulty';
  req.query.sort='-ratingsAverage,price';  
  next();
}
exports.getAllTours = factory.getAll(tour);

exports.getTour = factory.getOne(tour,{path:'reviews'})
exports.createTour =factory.createOne(tour);

exports.updateTour =factory.updateOne(tour)

exports.deleteTour = factory.deleteOne(tour);
exports.getTourStats = catchAsync(async (req, res,next) => {

    const stats = await tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      }, // Add the closing curly brace here
      {
        $group: {
          _id:{$toUpper:'$difficulty'},
          numTours:{$sum:1},
          numRatings:{$sum:'$ratingsQuantity'},
          averagerating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort:{
          avgPrice:1
        }
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  });
exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
 
    const year = req.params.year * 1;
    const plan = await tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours:{$push:'$name'}
        },
      },
      {
        $addFields:{month:'$_id'}
      },
      {
        $project:{
          _id:0
        }
      },

      {
        $sort: {
          numTourStats:1// Sort by month number in ascending order
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  });
