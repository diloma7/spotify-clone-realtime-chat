import { Router } from "express";
import {
  protectRoute,
  requireAdmin,
} from "../../middleware/auth.middleware.js";
import {
  getAllUsers,
  markMessagesReadByUserId,
  getMessagesByUserId,
} from "../controllers/user.controller.js";

const route = Router();

route.get("/", protectRoute, getAllUsers);
route.get("/messages/:userId", protectRoute, getMessagesByUserId);
route.patch("/messages/:userId/read", protectRoute, markMessagesReadByUserId);

export default route;
