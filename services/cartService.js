const asyncHandler = require("express-async-handler");


const ApiError = require("../utils/apiError");
const cartModel = require('../models/cartModel');
const ProductModel = require("../models/productModel");
const couponModel=require("../models/couponModel")
const calcTotalPrice=(cart)=>{
  let totalPrice=0;
    cart.cartItems.forEach(
      (item)=>{
        totalPrice+= item.price * item.quantity
      }
      )
      cart.totalCartPrice=totalPrice
      return totalPrice
}
//@desc Add Product To cart
//@route POST /api/v1/cart
//@access Private/user
exports.AddProductToCart=asyncHandler(async(req,res,next)=>{
    const { productId, color } = req.body;
  const product = await ProductModel.findById(productId);

  // 1) Get Cart for logged user
  let cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    // 1) create cart fot logged user with product
    cart = await cartModel.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  }
    else{
        // 1)check if the product exist in the cart if exists increase quantity by one
        const productExists=cart.cartItems.findIndex(
          item=> item.product.toString()==productId &&item.color==color
          );
        if(productExists>-1){
          const cartItem=cart.cartItems[productExists]
          cartItem.quantity+=1
          cart.cartItems[productExists]=cartItem
         
        }
         //2) if there is a cart and the product not in the cart add the product to cartItems
        else{
          cart.cartItems.push({product:productId,color,price:product.price})
        }
        
        console.log('there is a cart for this user')
    }
    //2) calculate total cart price
    const totalPrice=calcTotalPrice(cart)
    cart.totalCartPrice=totalPrice
      await cart.save()
      res.status(200).json({status:"success",message:"product Added successfully",data:cart})
    
})
//@desc Get User cart
//@route GEt /api/v1/cart/
//@access Private/user
exports.getLoggedUserCartItem=asyncHandler(async(req,res,next)=>{
  const cart=await cartModel.findOne({user:req.user._id})
  if(!cart){
    return next(
      new ApiError(`There is no cart for this user id ${req.user._id}`,404)
    )
  }
  // console.log(typeof(cart.cartItems))
  res.status(200).json({
    status:"success",
    numOfCartItems:cart.cartItems.length,
    data:cart

  })
})
//@desc Delete Specific cartItem
//@route DELETE /api/v1/cart/:itemId
//@access Private/user
exports.deleteSpecificCartItem=asyncHandler(async(req,res,next)=>{
  //
  const cart=await cartModel.findOneAndUpdate({user:req.user._id},{
    $pull:{cartItems:{_id:req.params.itemId}},

  },
  {new:true}
  )
  calcTotalPrice(cart)
  cart.save()
  res.status(200).json({
    status:"success",
    numberOfCartItems:cart.cartItems.length,
    data:cart
  })

})

//@desc clear Logged User cart
//@route DELETE /api/v1/cart/
//@access Private/user
exports.clearCart=asyncHandler(async(req,res,next)=>{
  await cartModel.findOneAndDelete({user:req.user._id})
  res.status(204).send()
})

//@desc update specific cart item quantity
//@route PUT /api/v1/cart/:itemId
//@access Private/user
exports.updateCartItemQuantity=asyncHandler(async(req,res,next)=>{
  const {quantity}=req.body;
  const cart=await cartModel.findOne({user:req.user._id});
  if(!cart){
    return next(new ApiError(`there is no cart for user ${req.user._id}`))
  }
  
  const itemIndex=cart.cartItems.findIndex((item)=>item._id.toString()===req.params.itemId)
  if(itemIndex>-1){
    const cartItem=cart.cartItems[itemIndex]
    cartItem.quantity=quantity;
    cart.cartItems[itemIndex]=cartItem
  }
  else{
    return next(new ApiError(`there is no item for this id ${req.params.itemId}:`,404))
  }
  calcTotalPrice(cart)
  cart.save()
  res.status(200).json({
    status:"success",
    numberOfCartItems:cart.cartItems.length,
    data:cart
  })
  
})

//@desc Apply coupon on logged user cart
//@route PUT /api/v1/cart/applyCoupon
//@access Private/user
exports.applyCoupon=asyncHandler(async(req,res,next)=>{

  const coupon=await couponModel.findOne({
    name:req.body.coupon,
    expire:{$gt:Date.now()}
  })
  if(!coupon){
    return next(new ApiError('invalid coupon name or coupon expired'))
  }
  const cart=await cartModel.findOne({user:req.user._id})
  const totalPrice=calcTotalPrice(cart)
  const totalPriceAfterDiscount=(totalPrice-(totalPrice * coupon.discount)/100).toFixed(2)
  cart.totalCartPriceAfterDiscount=totalPriceAfterDiscount
  await cart.save()
  res.status(200).json({
    status:"success",
    numberOfCartItems:cart.cartItems.length,
    data:cart
  })


})