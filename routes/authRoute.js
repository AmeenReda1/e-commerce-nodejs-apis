const express = require('express');

const { signup,login,forgetPassword,verifyPassResetCode,resetPassword,refreshToken} = require('../services/authService')
const { signupValidator,loginValidation } = require('../utils/validaters/authValidator')
const router = express.Router();
router.post('/signup',signupValidator, signup)
router.post('/login',loginValidation,login)
router.post('/refreshToken',refreshToken)
router.post('/forgetPassword',forgetPassword)
router.post('/verifyResetCode',verifyPassResetCode)
router.put('/resetPassword',resetPassword)
module.exports = router;    