const {check}=require('express-validator');
const validatorMiddleware=require('../../middleware/validatorMiddleware');
const slugify  = require('slugify');

exports.createSubCategoryValidator=[
    check('name').notEmpty().withMessage('subCategory Required')
    .isLength({min:2}).withMessage('Too short subCategory name')
    .isLength({max:32}).withMessage('Too loong subCategory name')
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    check('category').notEmpty().withMessage('subCategory must belong to category')
    .isMongoId().withMessage('Invalid Catgegory Id'),

    validatorMiddleware,
    
]
exports.getSubCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid Catgegory Id'),
    validatorMiddleware,
    
]
exports.updateSubCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid subCatgegory Id'),
    check('name').notEmpty().withMessage('subCategory Required')
    .isLength({min:2}).withMessage('Too short subCategory name')
    .isLength({max:32}).withMessage('Too long subCategory name')
    .custom((val,{req})=>{
        req.body.slug=slugify(val)
        return true
    })
    ,
    check('category').isMongoId().withMessage('Invalid category Id'),
    
    validatorMiddleware,
]
exports.deleteSubCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid Category Id format'),
    validatorMiddleware,


]