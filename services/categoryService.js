const multer=require('multer')
const slugify = require("slugify");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require('uuid');


const ApiError = require("../utils/apiError");
const CategoryModel = require('../models/categoryModel')
const ApiFeatures=require('../utils/apiFeatures')
const factory=require('./handlersFactory')
const {uploadSingleImage}=require('../middleware/uploadImageMiddleware')


//upload single category image
exports.uploadCategoryImage=uploadSingleImage('image')


//image processing
exports.resizeImage=asyncHandler(async(req,res,next)=>{
    const fileName=`category-${uuidv4()}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
            .resize(600,600)
            .toFormat('jpeg')
            .jpeg({quality:95})
            .toFile(`uploads/categories/${fileName}`);
    // save image name into  database
    req.body.image=fileName;

    next()
})



// @desc Get list of categories
// @route Get /api/v1/categories
//@ access Public/
exports.getCategories =factory.getAll(CategoryModel)

// @desc Get  specific category by id
// @route Get /api/v1/categories/:id
//@ access Public
exports.getCategory = factory.getOne(CategoryModel)

// @desc create Category
// @route Post /api/v1/categories
//@ access private/Admin-Manager
exports.createCategory = factory.createOne(CategoryModel)
// @desc update specific Catgeory
// @route put /api/v1/categories/:id
//@ access private/Admin-Manager
exports.updateCategory = factory.updateOne(CategoryModel)

// @desc Delete specific Catgeory
// @route DELETE /api/v1/categories/:id
//@ access private/Admin
exports.deleteCategory = factory.deleteOne(CategoryModel)
