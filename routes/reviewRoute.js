const express=require('express');

const {getReview,createReview,getReviews,updateReview,deleteReview,createFilterObj,setProductIdAndUserIdToBody}=require('../services/reviewService')
 const {createReviewValidator,updateReviewValidator,getReviewValidator,deleteReviewValidator}=require('../utils/validaters/reviewValidator')
const { protect, allowedTo } = require("../services/authService");

const router=express.Router({mergeParams:true})

router.route('/')
    .get(createFilterObj,getReviews)
    .post(protect,allowedTo("user"),setProductIdAndUserIdToBody,createReviewValidator,createReview)  
router.route("/:id")
    .get(getReviewValidator,getReview) 
    .put(protect,allowedTo("user"),updateReviewValidator,updateReview)   
    .delete(protect,allowedTo("user","admin","manager"),deleteReviewValidator,deleteReview)


module.exports=router;