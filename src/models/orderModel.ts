import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		quantity: {
			type: Number,
			default: 1,
		},
		user: {
			type: String,
			ref: "User",
			required: true,
		},
		tax: {
			type: Number,
			required: true,
		},
		discount: {
			type: Number,
			default: 0,
		},
		subtotal: {
			type: Number,
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ["valid", "invalid"],
			default: "valid",
		},
		orderItems: [
			{
				name: String,
				photo: String,
				price: Number,
				quantity: Number,
				productId: {
					type: mongoose.Types.ObjectId,
					ref: "Product",
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

export const Order = mongoose.model("Order", orderSchema);
