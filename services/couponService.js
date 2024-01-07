
const CouponModel = require('../models/couponModel')
const factory = require('./handlersFactory')

// @desc Get list of coupon
// @route Get /api/v1/coupons
//@ access Private/Admin-manager
exports.getCoupons = factory.getAll(CouponModel)

// @desc Get  specific coupon by id
// @route Get /api/v1/coupons/:id
//@ access Private/Admin-manager
exports.getCoupon = factory.getOne(CouponModel);


// @desc create coupon
// @route Post /api/v1/coupons
//@ access Private/Admin-manager
exports.createCoupon = factory.createOne(CouponModel)

// @desc update specific Coupon
// @route put /api/v1/coupons/:id
//@ access Private/Admin-manager
exports.updateCoupon = factory.updateOne(CouponModel)

// @desc Delete specific coupon
// @route DELETE /api/v1/coupons/:id
//@ access Private/Admin-manager
exports.deleteCoupon = factory.deleteOne(CouponModel)
