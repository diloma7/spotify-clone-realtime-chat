import { Router } from "express";
import { authCallback } from "../controllers/auth.controller.js";

const route = Router();

route.post("/callback", authCallback);

export default route;
