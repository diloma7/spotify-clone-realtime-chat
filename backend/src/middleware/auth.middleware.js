import { clerkClient, getAuth } from "@clerk/express";
import { env } from "../config/env.js";

export const protectRoute = (req, res, next) => {
  if (!getAuth(req).userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Access" });
  }

  // If the user is authenticated, proceed to the next middleware or route handler
  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = getAuth(req).userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access" });
    }

    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isAdmin =
      env.adminUserId === user.primaryEmailAddress?.emailAddress;

    // Check if the user has the 'admin' role
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in requireAdmin middleware:", error);
    next(error); // Pass the error to the next middleware
  }
};
