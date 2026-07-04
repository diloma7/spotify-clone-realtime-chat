import {
  getAllUsersExcludingCurrent,
  getMessagesBetweenUsers,
  markMessagesFromUserAsRead,
} from "../services/user.service.js";
import { getAuth } from "@clerk/express";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = getAuth(req).userId;
    const users = await getAllUsersExcludingCurrent(currentUserId);
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error); // Pass the error to the next middleware
  }
};

export const getMessagesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myID = getAuth(req).userId;
    const messages = await getMessagesBetweenUsers({ userId, myId: myID });

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    next(error); // Pass the error to the next middleware
  }
};

export const markMessagesReadByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const myID = getAuth(req).userId;

    await markMessagesFromUserAsRead({ userId, myId: myID });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    next(error);
  }
};
