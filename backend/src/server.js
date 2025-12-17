import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js"; // Adjust the path as necessary
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js"; // Adjust the path as necessary
import songsRoutes from "./routes/songs.route.js"; // Adjust the path as necessary
import albumsRoutes from "./routes/albums.route.js"; // Adjust the path as necessary
import statsRoutes from "./routes/stats.route.js"; // Adjust the path as necessary
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload"; // Assuming you have a fileUploads middleware for handling file uploads
import path from "path";
import cors from "cors"; // Importing CORS middleware
import cron from "node-cron";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js"; // Assuming you have a function to initialize socket.io

dotenv.config();
const __dirname = path.resolve();
const app = express();

const PORT = process.env.PORT || 5007;

const httpServer = createServer(app);
initializeSocket(httpServer); // Assuming you have a function to initialize socket.io

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow requests from the client URL
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(express.json()); // Middleware to parse JSON bodies

// Pass no parameters
app.use(clerkMiddleware());

app.use(
  fileUpload({
    useTempFiles: true, // Use temporary files for uploads
    tempFileDir: path.join(__dirname, "temp"), // Directory to store temporary files
    createParentPath: true, // Create parent directories if they don't exist
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
    abortOnLimit: true, // Abort the request if file size exceeds limit
  })
); // Assuming you have a fileUploads middleware for handling file uploads

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.log("error", err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {});
      }
    });
  }
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/albums", albumsRoutes);
app.use("/api/stats", statsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use((error, req, res, next) => {
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message,
  });
}); // Error handling middleware

httpServer.listen(PORT, () => {
  connectDB(); // Ensure you have the connectDB function imported from your dbConfig
  console.log(`Server is running on http://localhost:${PORT}`);
});
