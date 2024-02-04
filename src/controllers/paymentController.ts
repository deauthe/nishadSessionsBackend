import express from "express";
import { TryCatch } from "../middlewares/error.js";
import { Request, Response, NextFunction } from "express";
import { invalidatesCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { listeners } from "process";
import { Coupon } from "../models/couponModel.js";

export const newCoupon = TryCatch(async (req, res, next) => {
	const { code, amount } = req.body;

	if (!code || !amount) {
		return next(
			new ErrorHandler("please mention code and amount for coupon", 400)
		);
	}

	const newCoupon = await Coupon.create({ code, amount });

	return res.status(201).json({
		success: true,
		message: "Coupon",
		coupon: newCoupon,
	});
});

export const applyDiscount = TryCatch(async (req, res, next) => {
	const { couponCode } = req.body;

	if (!couponCode) {
		return next(new ErrorHandler("please enter coupon", 400));
	}

	const coupon = await Coupon.findOne({ code: couponCode });
	if (!coupon) {
		return next(new ErrorHandler("invalid coupon code", 400));
	}

	return res.status(201).json({
		success: true,
		discount: coupon.amount,
	});
});

export const getAllCoupons = TryCatch(async (req, res, next) => {
	const coupons = await Coupon.find();

	return res.status(201).json({
		success: true,
		coupons,
	});
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
	const { id } = req.params;

	const coupon = await Coupon.findByIdAndDelete(id);

	if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));

	return res.status(200).json({
		success: true,
		message: `Coupon ${coupon.code} Deleted Successfully`,
	});
});
