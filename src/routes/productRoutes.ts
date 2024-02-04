import express from "express";
import {
	getAllProducts,
	getProduct,
	deleteProduct,
	createNewProduct,
	getLatestProducts,
	getAllGenres,
	updateProduct,
	filterProducts,
} from "../controllers/productController.js";
import { adminOnly } from "../middlewares/authMiddleWare.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();
//route - /api/v1/product/new
app.post("/new", adminOnly, singleUpload, createNewProduct);

app.get("/search", filterProducts);

//route - /api/v1/product/latest
app.get("/latest", getLatestProducts);
app.get("/genre", getAllGenres);
//route - /api/v1/product/:id
app
	.route("/:id")
	.get(getProduct)
	.put(singleUpload, updateProduct)
	.delete(adminOnly, deleteProduct);

export default app;
