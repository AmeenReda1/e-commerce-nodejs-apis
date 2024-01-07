const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const subCategoryModel = require('../models/subCategoryModel');
const ApiFeatures=require('../utils/apiFeatures')
const factory=require('./handlersFactory')

exports.createFilterObj=(req,res,next)=>{
  filterObject={};
  if(req.params.categoryId) {
    filterObject={category:req.params.categoryId}
    req.filterObj=filterObject
  }
  next()
}

// @desc Get list of subcategories
// @route Get /api/v1/subcategories
//@ access Public
exports.getSubCategories = factory.getAll(subCategoryModel)

exports.setCategoryToBody=(req,res,next)=>{
   // nested route and for this route 
    //@route api/v1/catgeories/:category/subcategories
    // we make this middleware to use it before validation becuase we need to add the category to the body before validation
    // because if we didn't make this the validation layer will not see the category that we add it in the body
    if(!req.body.category) req.body.category=req.params.categoryId;
    
    next();
}


// @desc create subCategory
// @route Post /api/v1/subcategories
//@ access private
exports.createSubCategory=factory.createOne(subCategoryModel)



// @desc Get  specific subcategory by id
// @route Get /api/v1/subcategories/:id
//@ access Public
exports.getSubCategory = factory.getOne(subCategoryModel)






// @desc update specific Catgeory
// @route put /api/v1/categories/:id
//@ access private
exports.updateSubCategory = factory.updateOne(subCategoryModel)

// @desc Delete specific Catgeory
// @route DELETE /api/v1/categories/:id
//@ access private
exports.deleteSubCategory = factory.deleteOne(subCategoryModel)