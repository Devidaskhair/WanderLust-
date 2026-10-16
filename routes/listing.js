const express=require('express');
const router=express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema,ReviewSchema}=require("../schema.js");


const validateListing=(req,res,next)=>{
    const {error}=listingSchema.validate(req.body);
    if(error){
        let  errmsg=error.details.map(el=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
};  

//Index Route
router.get("/", wrapAsync(async (req,res)=>{
 const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));



//New route
router.get("/new",(req,res)=>{
res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});

}));

//Create Route
router.post("/",
    validateListing,
    wrapAsync(async(req,res)=>{
  let listingData = new Listing(req.body.listing);
  
  await listingData.save();
  res.redirect("/listings");
  }));
     

  //Edit Route
  router.get("/:id/edit",wrapAsync(async(req,res)=>{
       let {id}=req.params;
      const listing =await Listing.findById(id);
   
      res.render("listings/edit.ejs",{listing});
  }));
  
  
  //Update Route
  router.put("/:id",
      validateListing,
      wrapAsync(async (req,res)=>{
      let {id}=req.params;
      await Listing.findByIdAndUpdate(id,{...req.body.listing},{runValidators:true});
      res.redirect("/listings");
  
  }));
  

  //Delete Route 
  router.delete("/:id",wrapAsync(async(req,res)=>{
      let{id}=req.params;  
      deletedListing =  await Listing.findByIdAndDelete(id);
      console.log("deleted successfully",deletedListing);
      res.redirect("/listings");
  
  }));



  module.exports = router;
