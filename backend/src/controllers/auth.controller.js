import { handleAuthCallback } from "../services/auth.service.js";
import { clerkClient, getAuth } from "@clerk/express";

export const authCallback = async (req, res, next) => {
  try {
    const clerkUser = await clerkClient.users.getUser(getAuth(req).userId);
    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      clerkUser.primaryEmailAddress?.emailAddress ||
      "Spotify User";

    const result = await handleAuthCallback({
      clerkId: clerkUser.id,
      fullName,
      imageUrl: clerkUser.imageUrl,
    });

    if (result.created) {
      return res
        .status(200)
        .json({ success: true, message: "User created successfully" });
    }

    return res.status(200).json({
      success: true,
      message: result.updated ? "User updated successfully" : "User already exists",
    });
  } catch (error) {
    console.error("Error in auth route:", error);
    next(error);
  }
};
