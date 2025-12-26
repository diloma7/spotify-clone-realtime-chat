import {
  getAllAlbumsSorted,
  getAlbumWithSongsById,
} from "../services/album.service.js";

export const getAlbums = async (req, res, next) => {
  try {
    const albums = await getAllAlbumsSorted();

    res.status(200).json({
      success: true,
      message: "Albums fetched successfully",
      albums,
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
    next(error);
  }
};

export const getAlbumById = async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const album = await getAlbumWithSongsById(albumId);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Album fetched successfully",
      album,
    });
  } catch (error) {
    console.error("Error fetching album by ID:", error);
    next(error);
  }
};
