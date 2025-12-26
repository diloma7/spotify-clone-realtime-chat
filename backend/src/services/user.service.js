import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getAllUsersExcludingCurrent = async (currentUserId) => {
  return User.find({ clerkId: { $ne: currentUserId } });
};

export const getMessagesBetweenUsers = async ({ userId, myId }) => {
  return Message.find({
    $or: [
      { senderId: userId, receiverId: myId },
      { senderId: myId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });
};
