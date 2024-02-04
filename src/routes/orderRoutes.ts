import express from "express";
import {
	createNewOrder,
	deleteOrder,
	getAllOrders,
	getMyOrders,
	getSingleOrder,
	processOrder,
} from "../controllers/orderController.js";
import { adminOnly } from "../middlewares/authMiddleWare.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

//route - /api/v1/order/new

app.post("/new", adminOnly, singleUpload, createNewOrder);

app.get("/my", getMyOrders);
app.get("/all", adminOnly, getAllOrders);

app
	.route("/:id")
	.get(getSingleOrder)
	.put(adminOnly, processOrder)
	.delete(adminOnly, deleteOrder);

export default app;
