import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import { getAllStats } from "../controllers/stat.controller.js";

const route = Router();

route.get("/", protectRoute, requireAdmin, getAllStats);

export default route;
