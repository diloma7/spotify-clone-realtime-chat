import userRoutes from "./user.route.js";
import authRoutes from "./auth.route.js";
import adminRoutes from "./admin.route.js";
import songsRoutes from "./songs.route.js";
import albumsRoutes from "./albums.route.js";
import statsRoutes from "./stats.route.js";

export const registerRoutes = (app) => {
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/songs", songsRoutes);
  app.use("/api/albums", albumsRoutes);
  app.use("/api/stats", statsRoutes);
};
