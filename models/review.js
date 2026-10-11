const mongoose=require("mongoose");
const schema=mongoose.Schema;
const ReviewSchema=new schema({
    comment:String,
    rating:Number,
    listing:{
        type:Number,
        min:1,
        max:5,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});
const Review=mongoose.model("Review",ReviewSchema);
module.exports=Review;
