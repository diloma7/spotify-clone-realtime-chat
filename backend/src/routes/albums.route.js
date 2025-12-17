import { Router } from "express";
import { getAlbumById, getAlbums } from "../controllers/album.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const route = Router();
// route.use(protectRoute, requireAdmin); // Protect all admin routes with authentication and admin check
route.get("/", getAlbums);
route.get("/:albumId", getAlbumById);

export default route;
