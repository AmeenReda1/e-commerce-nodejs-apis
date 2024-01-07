const express=require('express');

const {AddProductToCart,getLoggedUserCartItem,deleteSpecificCartItem,clearCart,updateCartItemQuantity,applyCoupon}=require('../services/cartService')
const { protect, allowedTo } = require("../services/authService");
const router=express.Router();
router.use(protect,allowedTo("user"))
router.route('/')
    .post(AddProductToCart)  
    .get(getLoggedUserCartItem)
    .delete(clearCart)
router.route('/applyCoupon')
    .put(applyCoupon)
router.route('/:itemId')
    .put(updateCartItemQuantity)
    .delete(deleteSpecificCartItem)

module.exports=router;