const {check}=require('express-validator');

const validatorMiddleware=require('../../middleware/validatorMiddleware');
const slugify= require('slugify');

exports.getBrandValidator=[
    check('id').isMongoId().withMessage('Invalid Brand Id format'),
    validatorMiddleware,
];

exports.createBrandValidator=[
    check('name').notEmpty().withMessage('Brand Required')
    .isLength({min:2}).withMessage(' too short Brand  name')
    .isLength({max:30}).withMessage(' too long Brand name')
    .custom((val, { req }) => {
        req.body.slug = slugify(val);
        return true;
      }),
    validatorMiddleware,
];
exports.updateBrandValidator=[
    check('id').isMongoId().withMessage('Invalid Brand Id format'),
    check('name').optional().custom((val,{req})=>{
        req.body.slug=slugify(val)
        return true;
    }),
    validatorMiddleware,
]
exports.deleteBrandValidator=[
    check('id').isMongoId().withMessage('Invalid Brand Id format'),
    validatorMiddleware,


]

