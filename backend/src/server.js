import { createServer } from "http";
import { createApp } from "./app/app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./realtime/socket.js";

const app = createApp();
const httpServer = createServer(app);

initializeSocket(httpServer);

const PORT = env.port;

httpServer.listen(PORT, () => {
  connectDB();
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
