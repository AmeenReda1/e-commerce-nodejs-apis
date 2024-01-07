
const { check, body } = require('express-validator');
const validatorMiddleware=require('../../middleware/validatorMiddleware');
const CategoryModel=require('../../models/categoryModel')
const SubCategoryModel=require('../../models/subCategoryModel');
const subCategoryModel = require('../../models/subCategoryModel');
const slugify  = require('slugify');
exports.createProductValidator=[
    check('title')
        .notEmpty()
        .withMessage('product Title is required')
        .isLength({min:3})
        .withMessage('product title must be at least 3 chars')
        .isLength({max:100})
        .withMessage('Too long product title')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
          }),

    check('description')
        .notEmpty()
        .withMessage('product description is required')
        .isLength({max:2000})
        .withMessage('too long product description'),


    check('quantity')
        .notEmpty()
        .withMessage('product qunatity is required')
        .isNumeric()
        .withMessage('product quantity must be number'),

    check('sold')
        .optional()
        .isNumeric()
        .withMessage(' sold product  must be number'),

    check('price')
        .notEmpty()
        .withMessage('product price required')
        .isNumeric()
        .withMessage('product price must be number')
        .isLength({ max: 32 })
        .withMessage('To long price'),


    check('priceAfterDiscount')
        .optional()
        .isNumeric()
        .withMessage('Product priceAfterDiscount must be a number')
        .toFloat()
        .custom((value,{req})=>{
            if(req.body.price < value){
                throw new Error('product priceAfterDiscount must be lower than the orginal price')
            }
            return true    
        }),


    check('colors')
        .optional()
        .isArray()
        .withMessage(' product colors must be array'),

    check('imageCover')
        .notEmpty()
        .withMessage('product image cover is required'),


    check('images')
        .optional()
        .isArray().withMessage('product images must be array'),


    check('category')
        .notEmpty()
        .withMessage('product must belong to category')
        .isMongoId().withMessage('Invalid category Id Formate')
        .custom((categoryId)=> // { here
            CategoryModel.findById(categoryId).then((category)=>{
                if(!category){
                    return Promise.reject(new Error(`No category for this Id:${categoryId}`))
                }
            })
        
        ),

    check('subCategories')
        .optional()
        .isArray().withMessage('product subCategory must be array')
        .isMongoId()
        .withMessage('Invalid subCateogy Id Formate')
        .custom(subCategoriesIds=>
            SubCategoryModel.find({_id:{$exists:true,$in:subCategoriesIds}}).then((result)=>{
                if(result.length <1 || result.length !==subCategoriesIds.length){
                    return Promise.reject(new Error('Invalid subCategories Ids'))
                }
            })
            )
            // to check tha each subcategories blong to the category that we send it
            .custom((val,{req})=>
                subCategoryModel.find({category:req.body.category}).then((subcategories)=>{
                    const subCategoriesInDB=[];
                    subcategories.forEach(subcategory => {
                        subCategoriesInDB.push(subcategory._id.toString())
                    });
                // check if subcategories ids in db include subcategories in req.body (true)
                const checker=(target,arr)=>target.every(v=>arr.includes(v))
                if(!checker(val,subCategoriesInDB)){
                    return Promise.reject(new Error('subCategory not belong to category'))
                }
            })  
            )
        ,
    check('brand').optional().isMongoId().withMessage('Invalid Id Formate'),   
    check('ratingsAverage')
        .optional()
        .isNumeric()
        .withMessage('ratingsAverage must be numebr')
        .isLength({min:1}).withMessage('ratingsAverage should be at least 1.0')
        .isLength({max:5}).withMessage('ratingsAverage should be at below 5.0'),


    check('ratingsQuantity')
        .optional()
        .isNumeric().withMessage('ratingQuantity must be number'),

    validatorMiddleware,    


]

exports.getProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware,
  ];
  
  exports.updateProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    body('title')
      .optional()
      .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,
  ];
  
  exports.deleteProductValidator = [
    check('id').isMongoId().withMessage('Invalid ID formate'),
    validatorMiddleware,
  ];