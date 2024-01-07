const express=require('express');

const {addAddress,removeAddress,getLoggedUserAddresses}=require('../services/addressesService')

const { protect, allowedTo } = require("../services/authService");
const router=express.Router();
router.use(protect,allowedTo("user"))
router.route('/')
    .post(addAddress) 
    .get(getLoggedUserAddresses) 
router.delete('/:addressId',removeAddress)
module.exports=router;