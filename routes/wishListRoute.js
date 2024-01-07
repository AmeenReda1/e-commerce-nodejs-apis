const express=require('express');

const {addProductToWishList,removeProductFromWishList,getLoggedUserWishList}=require('../services/wishListService')

const { protect, allowedTo } = require("../services/authService");
const router=express.Router();
router.use(protect,allowedTo("user"))
router.route('/')
    .post(addProductToWishList) 
    .get(getLoggedUserWishList) 
router.delete('/:productId',removeProductFromWishList)
module.exports=router;