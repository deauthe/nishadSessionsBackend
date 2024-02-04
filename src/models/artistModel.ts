import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "please enter name"],
		},
		photo: {
			type: String,
			required: [true, "please provide a photo"],
		},
	},
	{
		timestamps: true,
	}
);

export const Product = mongoose.model("Product", schema);
