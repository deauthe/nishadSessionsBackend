import mongoose from "mongoose";

const schema = new mongoose.Schema({
	code: {
		type: String,
		required: [true, "please enter the coupon Code"],
		unique: true,
	},
	amount: {
		type: Number,
		required: [true, "please enter the discount amount"],
	},
});

export const Coupon = mongoose.model("Coupon", schema);
