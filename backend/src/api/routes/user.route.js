import { Router } from "express";
import {
  protectRoute,
  requireAdmin,
} from "../../middleware/auth.middleware.js";
import {
  getAllUsers,
  getMessagesByUserId,
} from "../controllers/user.controller.js";

const route = Router();

route.get("/", protectRoute, getAllUsers);
route.get("/messages/:userId", protectRoute, getMessagesByUserId);

export default route;
