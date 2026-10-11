const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const ejsMate=require("ejs-mate"); 
const Listing=require("./models/listing.js");
const methodOverride = require("method-override");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,ReviewSchema}=require("./schema.js");
const Review = require("./models/review.js");
const listings=require("./routes/listing.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.listen(4000,()=>{
    console.log("server is running on port 3000");
});
app.use("/listings",listings);

const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
async function main(){
    await mongoose.connect(MONGO_URL);
}
main().then(()=>{
    console.log("connected to database");
})
.catch((err)=>{
    console.log(err);
});



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
app.post("/:id/reviews",validateReview,wrapAsync(async(req,res)=>{

let listing=await Listing.findById(req.params.id);
let newReview= new Review(req.body.review);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
console.log("review added successfully",newReview);
res.redirect(`/${listing._id}`)
})
);

//delete review route
app.delete("/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
let {id,reviewId}=req.params;
 await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
 await Review.findByIdAndDelete(reviewId);
 res.redirect(`/listings/${id}`);
})
);

app.all("/{*splat}", (req, res, next) => {
        console.log("404 URL:", req.method, req.originalUrl);

    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next)=>{
    console.log(err);
  let {statusCode=500,msg="Something Went wrong "}=err;
  res.status(statusCode).render("error.ejs", { msg, statusCode });

});