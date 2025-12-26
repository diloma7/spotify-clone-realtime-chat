import {
  getAllUsersExcludingCurrent,
  getMessagesBetweenUsers,
} from "../services/user.service.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.auth.userId;
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
    const myID = req.auth.userId;
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
