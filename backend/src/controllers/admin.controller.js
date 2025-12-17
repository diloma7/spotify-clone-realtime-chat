import cloudinary from "../lib/cloudinary.js";
import Album from "../models/album.model.js";
import Song from "../models/song.model.js";

const uploadCouldinary = async (file) => {
  // Implement your Cloudinary upload logic here
  try {
    // This is a placeholder function, replace it with actual Cloudinary upload code
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto", // Automatically determine the resource type (image, video, etc.)
    });

    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};
export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload both audio and image files. ",
      });
    }

    const { title, artist, albumId, duration } = req.body;

    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadCouldinary(audioFile); // Assuming you are using a file upload middleware that provides tempFilePath
    const imageUrl = await uploadCouldinary(imageFile); // Upload the image file to Cloudinary

    const song = new Song({
      title,
      artist,
      audioUrl, // URL to the audio file
      imageUrl, // URL to the image file
      duration,
      album: albumId || null, // If albumId is not provided, set it to null
    });

    await song.save();

    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id }, // Add the song ID to the album's songs array
      });
    }

    res.status(201).json({
      success: true,
      message: "Song created successfully",
      data: song,
    });
  } catch (error) {
    console.error("Error creating a song dashboard data:", error);
    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Optionally, remove the song from the associated album
    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id }, // Remove the song ID from the album's songs array
      });
    }

    await Song.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Song deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting a song:", error);
    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file for the album cover.",
      });
    }

    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files; //req.files.imageFile;

    const imageUrl = await uploadCouldinary(imageFile); // Upload the image file to Cloudinary

    const album = new Album({
      title,
      artist,
      imageUrl, // URL to the album cover image
      releaseYear,
    });

    await album.save();

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: album,
    });
  } catch (error) {
    console.error("Error creating an album:", error);
    next(error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    // Optionally, delete all songs associated with the album
    await Song.deleteMany({ albumId: id });

    await Album.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting an album:", error);
    next(error);
  }
};
