const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");
const slugify = require("slugify");
const bcrypt = require('bcrypt')

const UserModel = require("../../models/userModel");
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
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
  check("phone")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number accept only EGY and SA phone numbers"),
  check("role").optional(),
  check("profileImg").optional(),

  validatorMiddleware,
];
exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  check("name")
    .optional()
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
  check("phone")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number accept only EGY and SA phone numbers"),
  check("role").optional(),
  check("profileImg").optional(),
  validatorMiddleware,
];
// exports.changeUserPasswordValidator = [
//   check("id").isMongoId().withMessage("Invalid User Id format"),
//   body('currentPassword').isEmpty().withMessage('You must enter your current password'),
//   check('passwordConfirm').isEmpty().withMessage('You must enter your  password confirm'),
//   check('password').isEmpty().withMessage('you must enter new password')
//     .custom(async (val, { req }) => {
//       console.log(req.params.id)
//       //1)verify current password
//       const user = await UserModel.findById(req.params.id);
//       console.log(user.password)
//       if (!user) {
//         throw new Error('There is no user for this Id');
//       }

//       const isCorrectPassword = await bcrypt.compare(
//         req.body.currentPassword,
//         user.password
//       );
//       console.log(req.params.id)
//       console.log(isCorrectPassword, "yes")
//       if (!isCorrectPassword) {
//         throw new Error('incorrect current password')
//       }
//       //2)verify password confirm
//       if (password !== passwordConfirm) {
//         throw new Error('password confirmation incorrect')
//       }
//       return true
//     }),


//   validatorMiddleware,
// ]
exports.changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  check('currentPassword')
    .notEmpty()
    .withMessage('You must enter your current password'),
  check('passwordConfirm')
    .notEmpty()
    .withMessage('You must enter the password confirm'),
  check('password')
    .notEmpty()
    .withMessage('You must enter new password')
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error('There is no user for this id');
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error('Incorrect current password');
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),
  validatorMiddleware,
];
exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User Id format"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  
  check("name")
    .optional()
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
  check("phone")
    .notEmpty()
    .withMessage("phone number required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number accept only EGY and SA phone numbers"),
  validatorMiddleware,
];
