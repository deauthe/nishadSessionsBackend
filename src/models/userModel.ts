import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
	_id: string;
	name: string;
	email: string;
	photo?: string;
	role: "admin" | "user";
	createdAt: Date;
	updatedAt: Date;
	age: number;
}

const schema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: [true, "please enter id"],
		},
		name: {
			type: String,
			required: [true, "please enter name"],
		},
		email: {
			type: String,
			unique: [true, "this email is already registered"],
			validate: validator.isEmail,
		},
		photo: {
			type: String,
			default: "test photo",
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		gender: {
			type: String,
			enum: ["male", "female", "NA"],
			required: [true, "Please enter Gender"],
		},
		dob: {
			type: Date,
			required: [true, "Please enter Date of birth"],
		},
	},
	{
		timestamps: true,
	}
);

schema.virtual("age").get(function () {
	const today = new Date();
	const dob: Date = this.dob;
	let age: number = today.getFullYear() - dob.getFullYear();

	if (
		today.getMonth() < dob.getMonth() ||
		(today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
	) {
		age--;
	}

	return age;
});

export const User = mongoose.model<IUser>("User", schema);
