const jwt = require("jsonwebtoken");
const crypto=require('crypto')
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");


const sendEmail=require('../utils/sendEmail')
const UserModel = require("../models/userModel");
const RefreshTokenModel=require("../models/refreshTokenModel")
const ApiError = require("../utils/apiError");
const {createToken,createRefreshToken}=require("../utils/createToken");

// @desc  signup
// route post /api/v1/auth/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  //1)create user
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  
  //2) generate token
  const token = createToken(user._id);
  
  res.status(200).json({ data: user, token});
});
// @desc  login
// route post /api/v1/auth/login
// @access Public
// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3) generate token
  const token = createToken(user._id);
  const generatedRefreshToken=createRefreshToken(user._id)
  const refreshTokenData=await RefreshTokenModel.findOne({userId:user._id})
  
  if(!refreshTokenData){
    await RefreshTokenModel.create({userId:user.id,token:generatedRefreshToken})
  }
  else{
    await RefreshTokenModel.findOneAndUpdate({userId:user.id},{token:generatedRefreshToken})
  }
  // Delete password from response
  delete user._doc.password;
  // 4) send response to client side
  res.status(200).json({ data: user, token,refreshToken:generatedRefreshToken });
});

//@desc refreshToken 
//@route post /api/v1/auth/refreshToken
//@access Public
exports.refreshToken=asyncHandler(async(req,res,next)=>{
  const {refreshToken}=req.body
  
  // 1)check if the refreshToken valid
  const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  const userRefreshToken=await RefreshTokenModel.findOne({userId:decodedRefreshToken.userId,token:refreshToken})
  if(userRefreshToken){
    const accessToken=createToken(decodedRefreshToken.userId)
    res.status(200).json({token:accessToken})
  }
  else{
    new ApiError('Invalid refreshToken',401)
  }
})

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user exists
  const currentUser = await UserModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token  dose no longer exists",
        401
      )
    );
  }
  //4) check if the user is active or not
  if(!currentUser.active){
    return next(new ApiError('Please Activate Your Account first',403))
  }
  // 5)check if password changed after the token created
  if (currentUser.passwordChangedAt) {
    const changePasswordTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (changePasswordTimeStamp > decoded.iat) {
      return next(new ApiError("user recently changed his password", 401));
    }
  }
  // to add user data to the request to make it available to access in the next middleware like allowTo middleware
  req.user = currentUser;
  next();
});
// @desc Authorization (user permission)

// ["admin","manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You Are not allowed  to access this route", 403)
      );
    }
    next()
  });
// @desc Forgot Password
// @route POST /api/v1/auth/forgetPassword
// @access public
exports.forgetPassword=(asyncHandler(async(req,res,next)=>{

  console.log(req.body)
  // 1)get user email
  const user=await UserModel.findOne({email:req.body.email});
  if(!user){
    return next(new ApiError(`There is no user with this Email${req.body.email}`),404);
  }
  // 2) if user exist generate hash  random 6 digits and save it in db
  const resetCode=Math.floor(100000+Math.random()*900000).toString();
  const hashedResetCode=crypto.createHash('sha256')
    .update(resetCode)
    .digest('hex');
    
    // save hashed reset code into db
    user.passwordResetCode=hashedResetCode;
    // add expiration time for password reset code
    user.passwordResetExpires=Date.now() + 10 * 60 * 1000; // expires after 10 minutes
    user.passwordResetVerified=false;
    await user.save();
  // 3)send rest code via email 
  const message=` Hi ${user.name} \n we Received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset.\n Thanks for helping us keep your Account secure\n The E-shop Team`
  
  try{
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset code (valid for 10 min)',
      message,
    })
  }
  catch(err){
    user.passwordResetCode=undefined;
    
    user.passwordResetExpires=undefined 
    user.passwordResetVerified=undefined;
    await user.save();
    return next(new ApiError('There is An Error in Sending Email',500))
  }
  res.status(200).json({status:"success",message:"Reset  code send to email"})
}))  
// @desc Verify Reset Code 
// @route POST /api/v1/auth/verifyResetCode
// @access public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');
  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  
  if (!user) {
    return next(new ApiError('Reset code invalid or expired',500));
  }

  // 2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});
exports.resetPassword=asyncHandler(async(req,res,next)=>{
  //1)get user by email
  const user=await UserModel.findOne({email:req.body.email})
  if(!user){
    return next(new ApiError('There is no user for this Email',404));
  }
  //2) check if reset code verified
  if(!user.passwordResetVerified){
    return next(new ApiError('Reset code not verified',400))
  }
  user.password=req.body.newPassword,
  user.passwordResetCode=undefined,
  user.passwordResetExpires=undefined,
  user.passwordResetVerified=undefined;
  await user.save();
  // 3)if every thing ok create token
  const token=createToken(user._id);
  res.status(200).json({token})
})
