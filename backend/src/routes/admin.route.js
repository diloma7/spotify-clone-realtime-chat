import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import {
  checkAdmin,
  createAlbum,
  createSong,
  deleteAlbum,
  deleteSong,
} from "../controllers/admin.controller.js";

const route = Router();
route.use(protectRoute, requireAdmin); // Protect all admin routes with authentication and admin check
route.get("/check", checkAdmin);

route.post("/songs", createSong);
route.delete("/songs/:id", deleteSong);

route.post("/albums", createAlbum);
route.delete("/albums/:id", deleteAlbum);

export default route;
// This route file handles admin-specific routes, ensuring that only authenticated and authorized users can access them.
// It includes routes for checking admin status, creating and deleting songs, and creating and deleting albums.
// The `protectRoute` middleware ensures that the user is authenticated, while the `requireAdmin` middleware checks if the user has admin privileges.
// The `checkAdmin` route is a simple endpoint to verify if the user is an admin, returning a success message if they are.
// The `createSong`, `deleteSong`, `createAlbum`, and `deleteAlbum` functions handle the respective operations, including file uploads and database interactions.
// The `createSong` function requires both an audio file and an image file, while the `createAlbum` function requires an image file. Both functions upload the files to Cloudinary and save the relevant data to the database.
// The `deleteSong` and `deleteAlbum` functions remove the specified song or album from the database, respectively, and can also handle associated data cleanup if necessary.
// This modular approach allows for better organization and maintainability of the code, separating concerns between different functionalities and ensuring that only authorized users can perform administrative actions.
// The use of async/await syntax in the controller functions allows for cleaner and more readable asynchronous code, making it easier to handle errors and responses.
// The `requireAdmin` middleware checks if the user has admin privileges by comparing their ID with the admin user ID stored in the environment variables. If the user is not an admin, a 403 Forbidden response is returned.
// The `protectRoute` middleware checks if the user is authenticated by verifying the presence of a valid user ID in the request. If the user is not authenticated, a 401 Unauthorized response is returned.
// This route file is designed to be used in conjunction with the main server file, where it is imported and used as middleware for the `/api/admin` endpoint.
// The `Router` from Express is used to create a modular route handler, allowing for better organization of the code and separation of concerns.
// The `requireAdmin` middleware is applied to all routes in this file, ensuring that only users with admin privileges can access these routes.
// The `checkAdmin` route is a simple endpoint to verify if the user is an admin
