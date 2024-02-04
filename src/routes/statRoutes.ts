import express from "express";
import { adminOnly } from "../middlewares/authMiddleWare.js";
import { getDashboardStats } from "../controllers/statController.js";

const app = express.Router();
//route - /api/v1/dashboard/stats
app.get("/stats", getDashboardStats);

export default app;
