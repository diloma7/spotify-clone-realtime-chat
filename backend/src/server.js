import { createServer } from "http";
import { createApp } from "./app/app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./realtime/socket.js";

const app = createApp();
const httpServer = createServer(app);

initializeSocket(httpServer);

const PORT = env.port;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
