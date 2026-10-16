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
const Review = require("./routes/review.js");
const session=require("express-session");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.listen(4000,()=>{
    console.log("server is running on port 3000");
});

const sessionOptions={
    secret:"Superkey",
    resave:false,
    saveUninitialized:true,
}
app.use(session(sessionOptions));


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



app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


app.all("/{*splat}", (req, res, next) => {
        console.log("404 URL:", req.method, req.originalUrl);

    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next)=>{
    console.log(err);
  let {statusCode=500,msg="Something Went wrong "}=err;
  res.status(statusCode).render("error.ejs", { msg, statusCode });

});

