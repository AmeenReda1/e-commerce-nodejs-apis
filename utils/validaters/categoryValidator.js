const {check}=require('express-validator');
const slugify=require('slugify')
const validatorMiddleware=require('../../middleware/validatorMiddleware')

exports.getCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid Category Id format'),
    validatorMiddleware,
];

exports.createCategoryValidator=[
    check('name').notEmpty().withMessage('Category Required')
    
    .isLength({min:3}).withMessage(' too short Category  name')
    .isLength({max:30}).withMessage(' too long Category name')
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,

];
exports.updateCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid Category Id format'),
    check('name').notEmpty().withMessage('category name required')
    .optional()
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,


]
exports.deleteCategoryValidator=[
    check('id').isMongoId().withMessage('Invalid Category Id format'),
    validatorMiddleware,


]

