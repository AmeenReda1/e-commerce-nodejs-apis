const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const multer = require('multer');
const {
    v4: uuidv4
} = require('uuid');
const sharp = require("sharp");


const ApiError = require("../utils/apiError");
const ApiFeatures = require('../utils/apiFeatures');
const ProductModel = require('../models/productModel');
const factory = require('./handlersFactory');
const {
    uploadMixOfImages
} = require('../middleware/uploadImageMiddleware')



exports.uploadProductImages = uploadMixOfImages([{
        name: "imageCover",
        maxCount: 1,
    },
    {
        name: "images",
        maxCount: 5,
    }
])
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
    console.log(req.files)
    // 1) Image processing for ImageCover
    if (req.files.imageCover) {
        const ImageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;


        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({
                quality: 95
            })
            .toFile(`uploads/products/${ImageCoverFileName}`);


        // save image name into  database
        req.body.imageCover = ImageCoverFileName;
    }
    // 2) Image processing for ImageCover
    if (req.files.images) {
        req.body.images = []

        await Promise.all(req.files.images.map(async (img, index) => {
            const ImageName = `product-${uuidv4()}-${Date.now()}-${index+1}.jpeg`;

            await sharp(img.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({
                    quality: 95
                })
                .toFile(`uploads/products/${ImageName}`);

            // save image name into  database
            req.body.images.push(ImageName);
        }));

        console.log(req.body.imageCover);
        console.log(req.body.images);
    }
    next();

})
// @desc Get list of products
// @route Get /api/v1/products
//@ access Public
exports.getProducts = factory.getAll(ProductModel, 'products')

// @desc Get  specific product by id
// @route Get /api/v1/products/:id
//@ access Public

exports.getProduct = factory.getOne(ProductModel,'reviews')



// exports.getProduct = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const product = await ProductModel.findById(id).populate({path:'category',select:'name -_id'});

//   if (!product) {
//     return next(new ApiError(`No Product for this id ${id}`, 404));
//   }
//   res.status(200).json({ data: product });
// });



// @desc create product
// @route Post /api/v1/products
//@ access private
exports.createProduct = factory.createOne(ProductModel)
// @desc update specific product
// @route put /api/v1/products/:id
//@ access private
exports.updateProduct = factory.updateOne(ProductModel)

// @desc Delete specific product
// @route DELETE /api/v1/products/:id
//@ access private
exports.deleteProduct = factory.deleteOne(ProductModel)