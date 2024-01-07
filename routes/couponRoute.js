const express=require('express');

const {getCoupons,createCoupon,getCoupon,updateCoupon,deleteCoupon}=require('../services/couponService')
const { protect, allowedTo } = require("../services/authService");
const router=express.Router();

router.use(protect,allowedTo("admin","manager"))

router.route('/')
    .get(getCoupons)
    .post(createCoupon)  
router.route("/:id")
    .get(getCoupon) 
    .put(updateCoupon)   
    .delete(deleteCoupon)


module.exports=router;