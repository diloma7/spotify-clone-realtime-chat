import { getGlobalStats } from "../services/stat.service.js";

export const getAllStats = async (req, res, next) => {
  try {
    const stats = await getGlobalStats();

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
