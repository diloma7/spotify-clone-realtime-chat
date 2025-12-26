import { handleAuthCallback } from "../services/auth.service.js";

export const authCallback = async (req, res, next) => {
  debugger;
  try {
    const { id, firstName, lastName, imageUrl } = req.body;
    const result = await handleAuthCallback({
      id,
      firstName,
      lastName,
      imageUrl,
    });

    if (result.created) {
      return res
        .status(200)
        .json({ success: true, message: "User created successfully" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User already exists" });
  } catch (error) {
    console.error("Error in auth route:", error);
    next(error);
  }
};
