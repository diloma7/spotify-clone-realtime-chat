import {
  getAllSongsSorted,
  getRandomFeaturedSongs,
} from "../services/song.service.js";

export const getAllSongs = async (req, res, next) => {
  try {
    const songs = await getAllSongsSorted();

    res.status(200).json({
      success: true,
      message: "Songs fetched successfully",
      songs,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    next(error); // Pass the error to the next middleware
  }
};

export const getFeaturedSongs = async (req, res, next) => {
  try {
    const songs = await getRandomFeaturedSongs(6);

    res.status(200).json({
      success: true,
      message: "Featured songs fetched successfully",
      songs,
    });
  } catch (error) {
    console.error("Error fetching featured songs:", error);
    next(error); // Pass the error to the next middleware
  }
};

export const getMadeForYouSongs = async (req, res, next) => {
  try {
    const songs = await getRandomFeaturedSongs(4);
    res.status(200).json({
      success: true,
      message: "Featured songs fetched successfully",
      songs,
    });
  } catch (error) {
    console.error("Error fetching featured songs:", error);
    next(error); // Pass the error to the next middleware
  }
};

export const getTrendingSongs = async (req, res, next) => {
  try {
    const songs = await getRandomFeaturedSongs(4);

    res.status(200).json({
      success: true,
      message: "Featured songs fetched successfully",
      songs,
    });
  } catch (error) {
    console.error("Error fetching featured songs:", error);
    next(error); // Pass the error to the next middleware
  }
};
