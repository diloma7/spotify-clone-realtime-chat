import User from "../models/user.model.js";

export const handleAuthCallback = async ({
  id,
  firstName,
  lastName,
  imageUrl,
}) => {
  const existingUser = await User.findOne({ clerkId: id });

  if (!existingUser) {
    await User.create({
      fullName: `${firstName || ""} ${lastName || ""}`.trim(),
      imageUrl,
      clerkId: id,
    });

    return { created: true };
  }

  return { created: false };
};
