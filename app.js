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

const flash=require("connect-flash");
const passport=require("passport");
const Localstrategy=require("passport-local");
const User=require("./models/user.js");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

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
    cookie:{
        expires:Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new Localstrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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




app.use((req,res,next)=>{
   res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"Devidaskhair2112@gmail.com",
//         username:"Devidas",
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser); 
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("/{*splat}", (req, res, next) => {
        console.log("404 URL:", req.method, req.originalUrl);

    next(new ExpressError(404, "Page not found"));
});

app.use((err,req,res,next)=>{
    console.log(err);
  let {statusCode=500,msg="Something Went wrong "}=err;
  res.status(statusCode).render("error.ejs", { msg, statusCode });

});

