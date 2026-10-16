const express=require('express');

const router=express.Router({mergeParams:true})

const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const { ReviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing.js");


const validateReview=(req,res,next)=>{
    const {error}=ReviewSchema.validate(req.body);
    if(error){
        let  errmsg=error.details.map(el=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
};  



// Reviews
// post route
router.post("/",validateReview,wrapAsync(async(req,res)=>{

let listing=await Listing.findById(req.params.id);
let newReview= new Review(req.body.review);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
console.log("review added successfully",newReview);
res.redirect(`/listings/${listing._id}`);
})
);



//delete review route
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
let {id,reviewId}=req.params;
 await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
 await Review.findByIdAndDelete(reviewId);
 console.log("review deleted successfully");
res.redirect(`/listings/${id}`); 
})
);

module.exports=router;