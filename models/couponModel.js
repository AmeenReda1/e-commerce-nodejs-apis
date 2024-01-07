const mongoose=require('mongoose')
const couponSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[,"Coupon Name Required"],
        trim:true,
        unique:true,
    },
    expire:{
        type:Date,
        required:[true,"Coupon Expire Date Required"],
    },
    discount:{
        type:Number,
        required:[true,"Discount Value Required"],

    }
},{timestamps:true}
)
module.exports=mongoose.model('Coupon',couponSchema);