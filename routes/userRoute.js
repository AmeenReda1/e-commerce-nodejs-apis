const express = require('express');

const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    changeUserPassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUserData
} = require('../services/userService')
const {   
    createUserValidator,
    deleteUserValidator,
    updateUserValidator,
    changeUserPasswordValidator,
    updateLoggedUserValidator
    
} = require('../utils/validaters/userValidator')

const { protect, allowedTo } = require("../services/authService");

const router = express.Router();


router.use(protect)

router.get('/getMe',getLoggedUserData,getUser)
router.put('/changeMyPassword',changeUserPasswordValidator,updateLoggedUserPassword)
router.put('/updateMe',updateLoggedUserValidator,updateLoggedUserData)
router.delete('/deleteMe',deleteLoggedUserData)
// allowed for admin only
router.use(allowedTo("admin"))

router.route('/')
    .get(getUsers)
    .post(uploadUserImage, resizeImage, createUserValidator, createUser)
router.route("/:id")
    .get(getUser)
    .put(uploadUserImage, resizeImage,updateUserValidator, updateUser)
    .delete(deleteUserValidator,deleteUser)

router.route('/changePassword/:id')
    .put(changeUserPasswordValidator, changeUserPassword)


module.exports = router;