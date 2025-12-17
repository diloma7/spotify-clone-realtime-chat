import User from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
  debugger;
  try {
    const { id, firstName, lastName, imageUrl } = req.body;

    const user = await User.findOne({ clerkId: id });
    if (!user) {
      // If user does not exist, create a new user
      await User.create({
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        imageUrl,
        clerkId: id,
      });
      return res
        .status(200)
        .json({ success: true, message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error in auth route:", error);
    next(error);
  }
};
