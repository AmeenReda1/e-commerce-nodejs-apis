const slugify = require("slugify");
const { v4: uuidv4 } = require('uuid');
const sharp = require("sharp");



const ApiError = require("../utils/apiError");
const ReviewModel = require('../models/reviewModel')
const ApiFeatures = require('../utils/apiFeatures')
const factory = require('./handlersFactory')


exports.createFilterObj=(req,res,next)=>{
    filterObject={};
    if(req.params.productId) {
      filterObject={product:req.params.productId}
      req.filterObj=filterObject
    }
    next()
  }

  exports.setProductIdAndUserIdToBody=(req,res,next)=>{
    // nested route and for this route 
     //@route api/v1/products/:productId/reviews
     // we make this middleware to use it before validation because we need to add the product to the body before validation
     // because if we didn't make this the validation layer will not see the product that we add it in the body
     if(!req.body.product) req.body.product=req.params.productId;
     if(!req.body.user) req.body.user=req.user._id;
      
    
     
     next();
 }
 
// @desc Get list of review
// @route Get /api/v1/reviews
//@ access Public
exports.getReviews = factory.getAll(ReviewModel)

// @desc Get  specific review by id
// @route Get /api/v1/reviews/:id
//@ access Public
exports.getReview = factory.getOne(ReviewModel);
0

// @desc create review
// @route Post /api/v1/review
//@ access private/protect/user
exports.createReview = factory.createOne(ReviewModel)




// @desc update specific review
// @route put /api/v1/reviews/:id
//@ access private/protect/user
exports.updateReview = factory.updateOne(ReviewModel)

// @desc Delete specific review
// @route DELETE /api/v1/reviews/:id
//@ access private/protect/user-admin-manager
exports.deleteReview = factory.deleteOne(ReviewModel)
