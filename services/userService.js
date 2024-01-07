const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt')
const expressAsyncHandler = require("express-async-handler");


const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const createToken=require("../utils/createToken");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");

//upload single brand image
exports.uploadUserImage = uploadSingleImage("profileImg");

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${fileName}`);
    // save image name into  database
    req.body.profileImg = fileName;
  }

  next();
});

// @desc Get list of users
// @route Get /api/v1/users
//@ access private/Admin
exports.getUsers = factory.getAll(UserModel);

// @desc Get  specific user by id
// @route Get /api/v1/users/:id
//@ access private/admin
exports.getUser = factory.getOne(UserModel);

// @desc create user
// @route Post /api/v1/users
//@ access private/admin
exports.createUser = factory.createOne(UserModel);

// @desc update specific user
// @route put /api/v1/users/:id
//@ access private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updatedResult = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      slug: req.body.slug,
      phone: req.body.phone,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!updatedResult) {
    return next(new ApiError(`No ${Model} for this ${req.params.id}`, 404));
  }
  res.status(200).json({ data: updatedResult });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const updatedResult = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt:Date.now()
    },
    {
      new: true,
    }
  );

  if (!updatedResult) {
    return next(new ApiError(`No ${Model} for this ${req.params.id}`, 404));
  }
  res.status(200).json({ data: updatedResult });
});
// @desc Delete specific user
// @route DELETE /api/v1/users/:id
//@ access private/Admin
exports.deleteUser = factory.deleteOne(UserModel);

// @desc Get  Logged user data
// @route Get /api/v1/users/getMe
//@ access private/protect
exports.getLoggedUserData=asyncHandler(async(req,res,next)=>{
  req.params.id=req.user._id
  next()
})

// @desc update Looged user password
// @route Get /api/v1/users/changeMyPassword
//@ access private/protect
exports.updateLoggedUserPassword=asyncHandler(async(req,res,next)=>{
  //1)update user password based user payload
  
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt:Date.now()
    },
    {
      new: true,
    }
  );

    //2) generate Token
    const token=createToken(user._id);
    
    res.status(200).json({data:user,token})

})

// @desc update Logged user data
// @route Update /api/v1/users/updateMy
//@ access private/protect
exports.updateLoggedUserData=asyncHandler(async(req,res,next)=>{
  const updatedUser=await UserModel.findOneAndUpdate(
    req.user._id,
    {
      name:req.body.name,
      email:req.body.email,
      phone:req.body.phone
    },
    { new:true }
    );
    res.status(200).json({data:updatedUser})
})

// @desc DELETE Logged user data
// @route DELETE /api/v1/users/deleteMe
//@ access private/protect
exports.deleteLoggedUserData=asyncHandler(async(req,res,next)=>{
  await UserModel.findOneAndUpdate(req.user._id,{active:false})
  res.status(200).json({status:"success"})
})
