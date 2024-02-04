import express from "express";
import { TryCatch } from "../middlewares/error.js";
import { Request, Response, NextFunction } from "express";
import { newOrderRequestBody } from "../types/types.js";
import { Order } from "../models/orderModel.js";
import { invalidatesCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { listeners } from "process";

export const createNewOrder = TryCatch(
	async (req: Request<{}, {}, newOrderRequestBody>, res, next) => {
		const { orderItems, user, total, subtotal, discount, quantity, tax } =
			req.body;

		const newOrder = await Order.create({
			orderItems,
			user,
			total,
			subtotal,
			discount,
			quantity,
			tax,
		});

		if (
			!orderItems ||
			!user ||
			!total ||
			!subtotal ||
			!discount ||
			!quantity ||
			!tax
		) {
			return next(new ErrorHandler("please provide all fields", 400));
		}

		await reduceStock(orderItems);
		invalidatesCache({ product: true, order: true, admin: true });

		res.status(200).json({
			success: true,
			message: "order placed successfully",
			order: newOrder,
		});
	}
);

export const getMyOrders = TryCatch(async (req, res, next) => {
	console.log("working");
	const { user_id: user } = req.query;
	//deconstructing userId from query and assigning to the variable user,
	//this is not typescript

	let myOrders = [];
	const key = `my-orders-${user}`;

	if (myCache.has(key)) myOrders = JSON.parse(myCache.get(key) as string);
	else {
		myOrders = await Order.find({ user }).populate("user", ["name", "email"]); //populates the userId with it's name and email
		myCache.set("", JSON.stringify(myOrders));
	}

	res.status(200).json({
		success: true,
		order: myOrders,
	});
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
	const { id } = req.params;

	let order;
	const key = `order-${id}`;

	if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
	else {
		order = await Order.findById(id).populate("user", ["name", "email"]); //populates the userId with it's name and email
		myCache.set("", JSON.stringify(order));
	}

	res.status(200).json({
		success: true,
		order,
	});
});

export const getAllOrders = TryCatch(async (req, res, next) => {
	let orders;
	if (myCache.has("all-orders"))
		orders = JSON.parse(myCache.get("all-orders") as string);
	else {
		orders = await Order.find({}).populate("user");
		myCache.set("", JSON.stringify(orders));
	}

	res.status(200).json({
		success: true,
		message: "order placed successfully",
		order: orders,
	});
});

export const processOrder = TryCatch(async (req, res, next) => {
	const { id } = req.params;
	const order = await Order.findById(id);

	if (!order) return next(new ErrorHandler("order not Found", 404));

	switch (order.status) {
		case "valid":
			break;
		case "invalid":
			order.status = "valid";
			break;
		default:
			order.status = "valid";
			break;
	}

	await order.save();

	await invalidatesCache({
		product: false,
		order: true,
		admin: true,
		userId: order.user,
		orderId: String(order._id),
	});

	return res.status(201).json({
		success: true,
		message: "order validated",
	});
});

export const deleteOrder = TryCatch(async (req, res, next) => {
	const { id } = req.params;
	const order = await Order.findById(id);

	if (!order) return next(new ErrorHandler("order not Found", 404));

	await order.deleteOne();

	await invalidatesCache({
		product: false,
		order: true,
		admin: true,
		userId: order.user,
		orderId: String(order._id),
	});

	return res.status(201).json({
		success: true,
		message: "order deleted",
		order,
	});
});
