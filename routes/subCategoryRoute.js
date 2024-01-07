const express=require('express');

const {createSubCategory,getSubCategories,getSubCategory,updateSubCategory,deleteSubCategory,setCategoryToBody,createFilterObj}=require('../services/subCategoryService');
const {createSubCategoryValidator,getSubCategoryValidator,updateSubCategoryValidator,deleteSubCategoryValidator}=require('../utils/validaters/subCategoryValidator')
const { protect, allowedTo } = require("../services/authService");
// mergeparams allow us to access the params from ather request
// example: get the categoryId from catgeory router to filter
const router=express.Router({mergeParams:true})
router.route('/')
    .post(protect,allowedTo("admin", "manager"),setCategoryToBody,createSubCategoryValidator,createSubCategory)
    .get(createFilterObj,getSubCategories)

router.route('/:id')
    .get(getSubCategoryValidator,getSubCategory)
    .put(protect,allowedTo("admin", "manager"),updateSubCategoryValidator,updateSubCategory)
    .delete(protect,allowedTo("admin"),deleteSubCategoryValidator,deleteSubCategory)
module.exports=router;    