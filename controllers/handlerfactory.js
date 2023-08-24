const AppError = require("../appError");

const catchAsync=fn=>{
    return(req,res,next)=>{
  
    fn(req,res,next).catch(err=>next(err))
  }
  }
exports.deleteOne=Model=>catchAsync(async(req, res,next) => {
    const doc=await Model.findByIdAndDelete(req.params.id,{useFindAndModify:false})
    res.status(204).json({
    status: 'success',
    data:null
  });
});
exports.updateOne=Model=>catchAsync(async(req, res,next) => {

    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{useFindAndModify:false,new:true,runValidators:true})
    res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  }
  );
});
exports.createOne=Model=>catchAsync(async(req, res,next) => {
    const doc=await Model.create(req.body);
    console.log(req.body);
  
    /*const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
  
    tours.push(newTour);
  
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      err => {*/
        res.status(201).json({
          status: 'success',
          data:{
            doc
          }
        });
      //catch(err)  {
        //res.status(400).json({
         // status:'fail',
         // message:err.message
        //})
    });
    exports.getOne=(Model,popOptions)=>catchAsync(async(req,res,next)=>{
        let query=Model.findById(req.params.id);
        if(popOptions) query.populate(popOptions);
        const doc=await query;
        if(!doc){
            return next(new AppError('No document found with that ID',404))
        }
        res.status(200).json({
            status:'success',
            data:{
                doc
            }
        })
    })
    exports.getAll=Model=>catchAsync(async(req, res,next) => {
      //filtering
      const excludedFields=['page','sort','limit','fields'];
      const queryobj={...req.query};
      excludedFields.forEach(el=>
        delete queryobj[el]  );
      //advanced filtering
      var queryStr=JSON.stringify(queryobj);
      queryStr=queryStr.replace(/\b{gte|gt|lte|lt}\b/g,match=>`$${match}`)
      
      let query=Model.find(JSON.parse(queryStr));
      
      //sorting 
        if(req.query.sort){
          const sortBy=req.query.sort.split(',').join(' ');
          query=query.sort(req.query.sort)
        }
        //3 field limiting
        if(req.query.fields){
          const fields=req.query.fields.split(',').join(' ');
          query=query.select('name duration price rating')
        }
        else{
          query=query.select('-__v');
        }
        //paginnation
        const page=req.query.page*1||1;
        const limit=req.query.limt*1||9;
        const skip=(page-1)*limit;
        query=query.skip(skip).limit(limit);
        if(req.query.page){
          const countTours=await Model.countDocuments();
          if(skip>=countTours){
            query=query.skip(0).limit(9);
          }
        }
    
    
        const data=await query;
    
      //console.log(req.requestTime);
    
      res.status(200).json({
        status: 'success',
      //  requestedAt: req.requestTime,
       results: data.length,
       data: {
         data
      }
      });
    });
    