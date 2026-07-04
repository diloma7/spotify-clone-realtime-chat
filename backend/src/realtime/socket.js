import { Server } from "socket.io";
import { verifyToken } from "@clerk/express";
import Message from "../models/message.model.js";
import { env } from "../config/env.js";

const MAX_ACTIVITY_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;

const getSocketToken = (socket) => {
  const token = socket.handshake.auth?.token;

  return typeof token === "string" ? token : null;
};

const verifySocketToken = async (socket, next) => {
  try {
    const token = getSocketToken(socket);

    if (!token) {
      return next(new Error("Authentication token is required"));
    }

    const verifiedToken = await verifyToken(token, {
      secretKey: env.clerk.secretKey,
      jwtKey: env.clerk.jwtKey,
      authorizedParties: env.clientUrls,
    });

    socket.data.userId = verifiedToken.sub;
    next();
  } catch (error) {
    const reason = error?.reason || error?.message || "unknown";
    // eslint-disable-next-line no-console
    console.error("Socket authentication failed:", reason);
    next(new Error("Unauthorized"));
  }
};

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrls,
      credentials: true,
    },
  });

  const userSockets = new Map();
  const userActivity = new Map();

  io.use(verifySocketToken);

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // eslint-disable-next-line no-console
    console.log("A user just connected:", userId, socket.id);

    userSockets.set(userId, socket.id);
    userActivity.set(userId, "Idle");

    io.emit("user_connected", userId);

    socket.emit("users_online", Array.from(userSockets.keys()));

    io.emit("activities", Array.from(userActivity.entries()));

    socket.on("update_activity", ({ activity }) => {
      if (typeof activity !== "string") return;

      const userId = socket.data.userId;
      const normalizedActivity = activity.trim().slice(0, MAX_ACTIVITY_LENGTH);

      if (!normalizedActivity) return;

      // eslint-disable-next-line no-console
      console.log("activity updated", userId, normalizedActivity);
      userActivity.set(userId, normalizedActivity);
      io.emit("activity_updated", { userId, activity: normalizedActivity });
    });

    socket.on("send_message", async (data) => {
      try {
        const senderId = socket.data.userId;
        const { receiverId, content } = data;

        if (typeof receiverId !== "string" || typeof content !== "string") {
          return;
        }

        const normalizedContent = content.trim().slice(0, MAX_MESSAGE_LENGTH);

        if (!normalizedContent) {
          return;
        }

        const message = await Message.create({
          senderId,
          receiverId,
          content: normalizedContent,
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
