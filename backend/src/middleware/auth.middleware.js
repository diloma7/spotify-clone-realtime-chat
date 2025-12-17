import { clerkClient } from "@clerk/express";

export const protectRoute = (req, res, next) => {
  if (!req.auth.userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Access" });
  }

  // If the user is authenticated, proceed to the next middleware or route handler
  next();
};

export const requireAdmin = async (req, res, next) => {
  try {
    const user = await clerkClient.users.getUser(req.auth.userId);
    const isAdmin =
      process.env.ADMIN_USER_ID === user.primaryEmailAddress?.emailAddress;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

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
