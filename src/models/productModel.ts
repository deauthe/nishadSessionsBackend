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
		earlyBirdPrice: {
			type: Number,
		},
		usualPrice: {
			type: Number,
			required: [true, "please provide a usual Price"],
		},

		stock: {
			type: Number,
			required: [true, "please provide a stock"],
		},
		artists: {
			type: [String],
			required: [true, "please provide artist names"],
		},
		date: {
			type: Date,
			required: [true, "please provide a Date"],
		},
		genre: {
			type: String,
			required: [true, "please provide a genre"],
		},
		venue: {
			type: String,
			required: [true, "please provide event's menu"],
		},
		happened: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Product = mongoose.model("Product", schema);
