const asyncHandler = require("express-async-handler");
const stripe=require('stripe')(process.env.SECRET_KEY)

const ApiError = require("../utils/apiError");
const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const factory=require('../services/handlersFactory')

// @desc create cash Order for logged user using his cart
// @Route POST /api/v1/orders
// @ access protected/User
exports.createCashOrder=asyncHandler(async(req,res,next)=>{
    // app settings
    const taxPrice=0
    const shippingPrice=0
    //1) get cart depend on cartId
    const cart=await cartModel.findById(req.params.cartId)
    if(!cart){
        return next(new ApiError(`There is No Cart For This Id: ${req.params.cartId}`,404))
    }
    //2) get order price depend on cart Price "check if coupon applied" 
    const cartPrice=cart.totalCartPriceAfterDiscount ? cart.totalCartPriceAfterDiscount:cart.totalCartPrice
    const totalOrderPrice=cartPrice+taxPrice+shippingPrice
    //3) create order with default paymentMethod cash
    const order=await orderModel.create({
        user:req.user._id,
        cartItems:cart.cartItems,
        shippingAddress:req.body.shippingAddress,
        totalOrderPrice,

    })
    // 4) After creating Order decrement product quantity, increment product sold
    if(order){
        const bulkOption=cart.cartItems.map((item)=>({
            updateOne:{
                filter:{_id:item.product},
                update:{$inc:{quantity:-item.quantity,sold: +item.quantity}},
            }
        }))
        await productModel.bulkWrite(bulkOption,{})
    // 5) clear cart depend on cartId
    await cartModel.findByIdAndDelete(req.params.cartId)    

    }

    res.status(201).json({status:"success",data:order})

})



exports.filterOrdersForLoggedUser=asyncHandler(async(req,res,next)=>{
    if(req.user.role=='user'){
        req.filterObj={user:req.user._id}
       
    }
    next()

})
// @desc get list of orders
// @Route GET /api/v1/orders
// @ access protected/User-Admin-Manager

exports.findAllOrders=factory.getAll(orderModel)

// @desc get specific order
// @Route GET /api/v1/orders/:orderId
// @ access protected/User

exports.findSpecificOrders=factory.getOne(orderModel)


// @desc update order status to paid
// @Route GET /api/v1/orders/:id/pay
// @ access protected/Admin-manager
exports.updateOrderToPaid=asyncHandler(async(req,res,next)=>{
    const order=await orderModel.findById(req.params.id)
    if(!order){
        return next(new ApiError(`There is No order for This id ${req.params.id}`,404))
    }
    // update order to paid
    order.isPaid=true,
    order.paidAt=Date.now()
    const updatedOrder=await order.save()
    res.status(200).json({status:"success",data:updatedOrder})
})

// @desc update order status to delivered
// @Route GET /api/v1/orders/:id/deliver
// @ access protected/Admin-manager
exports.updateOrderToDelivered=asyncHandler(async(req,res,next)=>{
    const order=await orderModel.findById(req.params.id)
    if(!order){
        return next(new ApiError(`There is No order for This id ${req.params.id}`,404))
    }
    // update order to paid
    order.isDelivered=true,
    order.DeliveredAt=Date.now()
    const updatedOrder=await order.save()
    res.status(200).json({status:"success",data:updatedOrder})
})

//@ desc get check-out session from strip
//@Route GET api/v1/orders/checkout-session/:cartId
//@Access protected/user
exports.checkoutSession=asyncHandler(async(req,res,next)=>{
    console.log('from online Payment')
    // app settings
    const taxPrice=0
    const shippingPrice=0
    //1) get cart depend on cartId
    const cart=await cartModel.findById(req.params.cartId)
    if(!cart){
        return next(new ApiError(`There is No Cart For This Id: ${req.params.cartId}`,404))
    }
    //2) get order price depend on cart Price "check if coupon applied" 
    const cartPrice=cart.totalCartPriceAfterDiscount ? cart.totalCartPriceAfterDiscount:cart.totalCartPrice
    const totalOrderPrice=cartPrice+taxPrice+shippingPrice
    // 3) create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        line_items:[{
        price_data: { currency: 'egp',unit_amount: totalOrderPrice * 100,product_data: { name: req.user.name,}, },
        quantity: 1
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/orders`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
      });
    res.status(200).json({status:"success",session})
})


const createCardOrder=async(session)=>{
    const cartId=session.client_reference_id
    const shippingAddress=session.metadata
    const orderPrice=session.amount_total/100
    const cart = await cartModel.findById(cartId);
    const user = await userModel.findOne({ email: session.customer_email });

    // 3) Create order with default paymentMethodType card
  const order = await orderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: 'card',
  });

    console.log('done form create order')
    // 4) After creating Order decrement product quantity, increment product sold
    if(order){
        const bulkOption=cart.cartItems.map((item)=>({
            updateOne:{
                filter:{_id:item.product},
                update:{$inc:{quantity:-item.quantity,sold: +item.quantity}},
            }
        }))
        await productModel.bulkWrite(bulkOption,{})
    // 5) clear cart depend on cartId
    await cartModel.findByIdAndDelete(cartId)    

    }



}

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEB_HOOK_SECRET
      );
    } catch (err) {
        console.log('there is an error')
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      //  Create order
      console.log('event compeleted yessssss')
        createCardOrder(event.data.object)
    }
  
    res.status(200).json({ received: true });
  });
