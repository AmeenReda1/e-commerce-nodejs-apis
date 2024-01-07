const express=require('express');

const {createCashOrder,findAllOrders,findSpecificOrders,filterOrdersForLoggedUser,updateOrderToDelivered,updateOrderToPaid,checkoutSession}=require('../services/orderService')

const { protect, allowedTo } = require("../services/authService");
const router=express.Router();
router.use(protect)
router.route("/:cartId")
    .post(allowedTo('user'),createCashOrder) 
router.route('/')
    .get(allowedTo('user','admin','manager'),filterOrdersForLoggedUser,findAllOrders) 

router.route('/:id')
.get(allowedTo('user'),findSpecificOrders)

router.put('/:id/pay',allowedTo('admin','manager'),updateOrderToPaid)
router.put('/:id/deliver',allowedTo('admin','manager'),updateOrderToDelivered)
router.get('/checkout-session/:cartId',allowedTo('user'),checkoutSession)
module.exports=router;