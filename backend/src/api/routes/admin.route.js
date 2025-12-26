import { Router } from "express";
import {
  protectRoute,
  requireAdmin,
} from "../../middleware/auth.middleware.js";
import {
  checkAdmin,
  createAlbum,
  createSong,
  deleteAlbum,
  deleteSong,
} from "../controllers/admin.controller.js";

const route = Router();

// All admin routes require authentication
route.use(protectRoute);

// Lightweight endpoint used by the frontend to determine admin status.
// It returns { admin: boolean } for any authenticated user and should not
// be gated by requireAdmin, so that non-admin users don't receive 403s.
route.get("/check", checkAdmin);

// Mutating admin endpoints still require full admin privileges.
route.use(requireAdmin);

route.post("/songs", createSong);
route.delete("/songs/:id", deleteSong);

route.post("/albums", createAlbum);
route.delete("/albums/:id", deleteAlbum);

export default route;
