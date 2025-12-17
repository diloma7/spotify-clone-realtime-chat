import Song from "../models/song.model.js";

export const getAllSongs = async (req, res, next) => {
  try {
    // Fetch all songs from the database
    const songs = await Song.find().sort({ createdAt: -1 }); // Sort by creation date in descending order

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
    // Fetch 6 random featured songs from the database using mongo aggregation pipeline
    const songs = await Song.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          audioUrl: 1,
          imageUrl: 1,
        },
      },
      { $sample: { size: 6 } }, // Randomly sample 6 songs
    ]);

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
    // Fetch 4 random featured songs from the database using mongo aggregation pipeline
    const songs = await Song.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          audioUrl: 1,
          imageUrl: 1,
        },
      },
      { $sample: { size: 4 } }, // Randomly sample 4 songs
    ]);
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
    // Fetch 4 random featured songs from the database using mongo aggregation pipeline
    const songs = await Song.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          artist: 1,
          audioUrl: 1,
          imageUrl: 1,
        },
      },
      { $sample: { size: 4 } }, // Randomly sample 4 songs
    ]);

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
