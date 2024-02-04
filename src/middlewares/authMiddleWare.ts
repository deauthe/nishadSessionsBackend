import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";

//only admin in allowed middlWare
export const adminOnly = TryCatch(async (req, res, next) => {
	const { my_id } = req.query;
	if (!my_id) {
		return next(new ErrorHandler("please login first", 401));
	}

	const user = await User.findById(my_id);
	if (!user) {
		return next(new ErrorHandler("Invalid Id", 400));
	}
	if (user.role !== "admin") {
		return next(new ErrorHandler("this route is admins Only", 401));
	}
	next();
});
