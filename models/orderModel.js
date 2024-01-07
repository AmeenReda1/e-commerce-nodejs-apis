const mongoose=require("mongoose")
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"order must belong to user"]
    },
    cartItems:[
        {
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'Product',

            },
            quantity:Number,
            color:String,
            price:Number
        },
    ],
    taxPrice:{
        type:Number,
        default:0,
    },
    shippingPrice:{
        type:Number,
        default:0
    },
    totalOrderPrice:{
        type:Number
    },
    shippingAddress:{
        details:String,
        phone:String,
        city:String,
        postalCode:String
    },
    paymentMethod:{
        type:String,
        enum:['cash','card']
    },
    isPaid:{
        type:Boolean,
        default:false,
    },
    paidAt:Date,
    isDelivered:{
        type:Boolean,
        default:false,
    },
    DeliveredAt:Date
    
},
{timestamps:true}
)

orderSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name profileImg email phone'
    }).populate({
        path:'cartItems.product',
        select:'title coverImage'
    })
    next()

})
module.exports=mongoose.model('Order',orderSchema)