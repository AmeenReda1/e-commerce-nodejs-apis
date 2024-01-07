const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");
const slugify = require("slugify");
const bcrypt = require('bcrypt')

const UserModel = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User Required")
    .isLength({
      min: 2,
    })
    .withMessage(" too short User  name")
    .isLength({
      max: 30,
    })
    .withMessage(" too long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid Email address")
    .custom((val) =>
      UserModel.findOne({
        email: val,
      }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({
      min: 6,
    })
    .withMessage("password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("password Confirmation is required"),


  validatorMiddleware,
];
exports.loginValidation=[
  check("email")
  .notEmpty()
  .withMessage("Email required")
  .isEmail()
  .withMessage("Invalid Email address"),
  check("password")
  .notEmpty()
  .withMessage("password required")
  .isLength({
    min: 6,
  })
  .withMessage("password must be at least 6 characters"),
   validatorMiddleware,]