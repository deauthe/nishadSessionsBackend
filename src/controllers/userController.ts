import { NextFunction } from "express";
import { User } from "../models/userModel.js";
import express from "express";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";

//no need of defining types for req,res,next here as we already defined a type for the kind of
//functions tryCatch takes in as a parameter
export const newUser = TryCatch(
	//wrapper function
	async (req, res, next) => {
		const { name, email, photo, _id } = req.body;

		const user = await User.findById(_id);

		if (user) {
			next(new ErrorHandler("user already exists", 400));
		}

		if (!_id || !email || !photo || !name) {
			return next(new ErrorHandler("please enter all fields", 400));
		}
		const newUser = await User.create({ name, email, photo, _id });

		return res.status(201).json({
			success: true,
			message: "user created",
			user: newUser,
		});
	}
);

export const getAllUsers = TryCatch(async (req, res, next) => {
	const users = await User.find({});

	res.status(200).json({
		success: true,
		result: users.length,
		users: users,
	});
});

export const getUser = TryCatch(async (req, res, next) => {
	const _id = req.params.id;
	const user = await User.findById(_id);

	if (!user) {
		return next(new ErrorHandler("invalid Id", 400));
	}

	res.status(200).json({
		success: true,
		user: user,
	});
});

export const deleteUser = TryCatch(async (req, res, next) => {
	const _id = req.params.id;
	const user = await User.findById(_id);

	if (!user) {
		return next(new ErrorHandler("invalid Id", 400));
	}

	await user.deleteOne();

	return res.status(200).json({
		success: true,
		message: "user deleted successfully",
		user: user,
	});
});
