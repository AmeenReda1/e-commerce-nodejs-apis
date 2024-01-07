const asyncHandler = require("express-async-handler");



const userModel = require('../models/userModel');



// @desc  Add Address to addresses list
//@route  POST /api/v1/address
// Access protected/user
exports.addAddress=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findByIdAndUpdate(
        req.user._id,
        {$addToSet:{addresses:req.body}},
        {upsert:true,new:true},
        
    )
    console.log(user)
    res.status(200).json({status:"success",message:"Address Added successfully",data:user.addresses})
})

// @desc  remove Address from Addresses List
//@route  DELETE address /api/v1/address/:addressId
// Access protected/user
exports.removeAddress=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findByIdAndUpdate(
        req.user._id,

        {$pull:{addresses:{_id:req.params.addressId} } },
        {new:true},
        
    )
    console.log(req.params.addressId)
    res.status(200).json({status:"success",message:"Address Removed successfully",data:user.addresses})
})

// @desc  get Address from logged user
//@route  GET  /api/v1/address/
// Access protected/user
exports.getLoggedUserAddresses=asyncHandler(async(req,res,next)=>{
    const user=await userModel.findById(req.user._id)
    res.status(200).json({status:"success",data:user.addresses})
})

