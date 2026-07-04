import User from "../models/user.model.js";

export const handleAuthCallback = async ({ clerkId, fullName, imageUrl }) => {
  const existingUser = await User.findOne({ clerkId });

  if (!existingUser) {
    await User.create({
      fullName,
      imageUrl,
      clerkId,
    });

    return { created: true };
  }

  const updates = {};

  if (fullName && existingUser.fullName !== fullName) {
    updates.fullName = fullName;
  }

  if (imageUrl && existingUser.imageUrl !== imageUrl) {
    updates.imageUrl = imageUrl;
  }

  if (Object.keys(updates).length > 0) {
    await User.updateOne({ _id: existingUser._id }, { $set: updates });
    return { created: false, updated: true };
  }

  return { created: false, updated: false };
};
