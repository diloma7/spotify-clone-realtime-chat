import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    // Fetch all users from the database except from the current user useing the clerk user id
    const currentUserId = req.auth.userId; // Assuming you have the user ID in req.auth
    const users = await User.find({ clerkId: { $ne: currentUserId } }); // Exclude the current user
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
    const myID = req.auth.userId; // Assuming you have the user ID in req.auth
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: myID },
        { senderId: myID, receiverId: userId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by creation time in ascending order

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
