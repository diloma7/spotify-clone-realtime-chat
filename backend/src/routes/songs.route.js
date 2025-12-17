import { Router } from "express";
import {
  getAllSongs,
  getFeaturedSongs,
  getMadeForYouSongs,
  getTrendingSongs,
} from "../controllers/song.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const route = Router();

// route.use(protectRoute, requireAdmin); // Protect all admin routes with authentication and admin check

route.get("/", protectRoute, requireAdmin, getAllSongs);
route.get("/featured", getFeaturedSongs); // Assuming you have a controller for featured songs
route.get("/made-for-you", getMadeForYouSongs);
route.get("/trending", getTrendingSongs);

export default route;
