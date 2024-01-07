const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");

const userModel = require('../models/userModel');



// @desc  Add product to wishlist
//@route  POST /api/v1/wishlist
// Access protected/user
exports.addProductToWishList=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findByIdAndUpdate(
        req.user._id,
        {$addToSet:{wishlist:req.body.productId}},
        {upsert:true,new:true},
        
    )
    console.log(user)
    res.status(200).json({status:"success",message:"hi Product Added successfully to WishList",data:user.wishlist})
})

// @desc  remove product from wishlist
//@route  DELETE ST /api/v1/wishlist/
// Access protected/user
exports.removeProductFromWishList=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findByIdAndUpdate(
        req.user._id,
        {$pull:{wishlist:req.params.productId}},
        {new:true},
        
    )
    console.log(user)
    res.status(200).json({status:"success",message:"Product Removed successfully From your WishList",data:user.wishlist})
})

// @desc  remove product from wishlist
//@route  DELETE ST /api/v1/wishlist/
// Access protected/user
exports.getLoggedUserWishList=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findById(req.user._id).populate("wishlist")
    res.status(200).json({status:"success",data:user.wishlist})
})

