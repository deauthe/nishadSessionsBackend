import express from "express";
import {
	deleteUser,
	getAllUsers,
	getUser,
	newUser,
} from "../controllers/userController.js";
import { adminOnly } from "../middlewares/authMiddleWare.js";
const app = express.Router();
//route - /api/v1/user/new
app.post("/new", newUser);

//route - /api/v1/user/all
app.get("/all", getAllUsers);

//route - /api/v1/user/:id
app.route("/:id").get(adminOnly, getUser).delete(adminOnly, deleteUser);

export default app;
