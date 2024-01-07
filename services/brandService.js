const slugify = require("slugify");
const { v4: uuidv4 } = require('uuid');
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");


const ApiError = require("../utils/apiError");
const BrandModel = require('../models/brandModel')
const ApiFeatures = require('../utils/apiFeatures')
const factory = require('./handlersFactory')
const { uploadSingleImage } = require('../middleware/uploadImageMiddleware')





//upload single brand image
exports.uploadBrandImage = uploadSingleImage('image')


//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/brands/${fileName}`);
    // save image name into  database
    req.body.image = fileName;

    next()
})





// @desc Get list of brand
// @route Get /api/v1/brands
//@ access Public
exports.getBrands = factory.getAll(BrandModel)

// @desc Get  specific brand by id
// @route Get /api/v1/brands/:id
//@ access Public
exports.getBrand = factory.getOne(BrandModel);


// @desc create brand
// @route Post /api/v1/brand
//@ access private
exports.createBrand = factory.createOne(BrandModel)




// @desc update specific Brand
// @route put /api/v1/brands/:id
//@ access private
exports.updateBrand = factory.updateOne(BrandModel)

// @desc Delete specific brand
// @route DELETE /api/v1/brands/:id
//@ access private
exports.deleteBrand = factory.deleteOne(BrandModel)
