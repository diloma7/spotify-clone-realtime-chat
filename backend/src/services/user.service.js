import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const getAllUsersExcludingCurrent = async (currentUserId) => {
  const [users, unreadCounts] = await Promise.all([
    User.find({ clerkId: { $ne: currentUserId } }).lean(),
    Message.aggregate([
      {
        $match: {
          receiverId: currentUserId,
          readAt: null,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const unreadCountBySender = new Map(
    unreadCounts.map(({ _id, count }) => [_id, count])
  );

  return users.map((user) => ({
    ...user,
    unreadCount: unreadCountBySender.get(user.clerkId) || 0,
  }));
};

export const getMessagesBetweenUsers = async ({ userId, myId }) => {
  await markMessagesFromUserAsRead({ userId, myId });

  return Message.find({
    $or: [
      { senderId: userId, receiverId: myId },
      { senderId: myId, receiverId: userId },
    ],
  }).sort({ createdAt: 1 });
};

export const markMessagesFromUserAsRead = async ({ userId, myId }) => {
  return Message.updateMany(
    {
      senderId: userId,
      receiverId: myId,
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    }
  );
};
