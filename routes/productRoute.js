const express=require('express');

const {getProducts,createProduct,getProduct,updateProduct,deleteProduct,uploadProductImages,resizeProductImages}=require('../services/productService')
const {getProductValidator,createProductValidator,updateProductValidator,deleteProductValidator}=require('../utils/validaters/productValidator')
const { protect, allowedTo } = require("../services/authService");
const reviewRoute=require('./reviewRoute')
const router=express.Router();


// Nested Route
// POST  /products/sjhfvbwisfkn/reviews
// GET  /products/sjhfvbwisfkn/reviews
// GET  /products/sjhfvbwisfkn/reviews/asjhgvsdbkfjm
router.use("/:productId/reviews", reviewRoute);
router.route('/')
    .get(getProducts)
    .post(protect,allowedTo("admin", "manager"),uploadProductImages,resizeProductImages,createProductValidator,createProduct)  
router.route("/:id")
    .get(getProductValidator, getProduct) 
    .put(protect,allowedTo("admin", "manager"),updateProductValidator,updateProduct)   
    .delete(protect,allowedTo("admin"),deleteProductValidator,deleteProduct)


module.exports=router;