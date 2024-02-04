import express from "express";

import { adminOnly } from "../middlewares/authMiddleWare.js";
import { singleUpload } from "../middlewares/multer.js";
import {
	applyDiscount,
	deleteCoupon,
	getAllCoupons,
	newCoupon,
} from "../controllers/paymentController.js";

const app = express.Router();

//route = /api/v1/payment/coupon/new
app.post("/coupon/new", newCoupon);

// route - /api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, getAllCoupons);

// route - /api/v1/payment/coupon/:id
app.delete("/coupon/:id", adminOnly, deleteCoupon);

//route = /api/v1/payment/discount
app.post("/discount", applyDiscount);

export default app;
