import { Server } from "socket.io";
import Message from "../models/message.model.js";
import { env } from "../config/env.js";

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  const userSockets = new Map();
  const userActivity = new Map();

  io.on("connection", (socket) => {
    // eslint-disable-next-line no-console
    console.log("A user just connected:", socket.id);

    socket.on("user_connected", (userId) => {
      userSockets.set(userId, socket.id);
      userActivity.set(userId, "Idle");

      io.emit("user_connected", userId);

      socket.emit("users_online", Array.from(userSockets.keys()));

      io.emit("activities", Array.from(userActivity.entries()));
    });

    socket.on("update_activity", ({ userId, activity }) => {
      // eslint-disable-next-line no-console
      console.log("activity updated", userId, activity);
      userActivity.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log("A user disconnected:", socket.id);
      let disconnectedUserId;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivity.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
}
