import express from "express";
import NodeCache from "node-cache";
import { connectDB } from "./utils/features.js";
import { globalErrorHandler } from "./middlewares/error.js";
import dotenv from "dotenv";
import morgan from "morgan";

//routes imports
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoutes.js";
import orderRoute from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import statRoutes from "./routes/statRoutes.js";

dotenv.config({
	path: "./.env",
});

const port = process.env.PORT || 3000;

const app = express();

app.use(morgan("dev"));
app.use(express.json());

connectDB(process.env.DB!);

export const myCache = new NodeCache();

app.get("/", (req, res) => {
	res.status(200).json({
		message: "hello",
	});
});

//using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", statRoutes);

app.use("/uploads", express.static("uploads")); //declaring the uploads as a static folder that anyone can access

app.use(globalErrorHandler);

app.listen(port, () => {
	console.log("listening on port : ", port);
});
