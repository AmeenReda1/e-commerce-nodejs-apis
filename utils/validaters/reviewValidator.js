const { check } = require("express-validator");

const ReviewModel = require("../../models/reviewModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const slugify = require("slugify");
const { promises } = require("nodemailer/lib/xoauth2");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("rating value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value  must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid Review Id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom((val, { req }) =>
      ReviewModel.findOne({
        user: req.user._id,
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(
            new Error("You already created a review before")
          );
        }
      })
    ),
  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review Id format")
    .custom((val, { req }) =>
      // check review ownership before update?
      ReviewModel.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is No Review With This Id ${val} `));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You Are Not Allowed To Edit This Review")
          );
        }
      })
    ),

  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id format")
  .custom((val, { req }) =>{
      if(req.user.role=='user'){
        return ReviewModel.findById(val).then((review) => {
            if (!review) {
              return Promise.reject(new Error(`There is No Review With This Id ${val} `));
            }
            if (review.user._id.toString() !== req.user._id.toString()) {
              return Promise.reject(
                new Error("You Are Not Allowed To Edit This Review")
              );
            }
          })
      }
      return true;
      
    }),
  validatorMiddleware,
];
