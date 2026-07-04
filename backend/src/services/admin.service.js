import cloudinary from "../integrations/cloudinary.js";
import Album from "../models/album.model.js";
import Song from "../models/song.model.js";
import { deleteCache } from "./cache.service.js";

const invalidateMusicCaches = async (extraKeys = []) => {
  await Promise.all([
    deleteCache("songs:all"),
    deleteCache("songs:featured:4"),
    deleteCache("songs:featured:6"),
    deleteCache("albums:all"),
    deleteCache("stats:global"),
    ...extraKeys.map((key) => deleteCache(key)),
  ]);
};

const uploadToCloudinary = async (file) => {
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    resource_type: "auto",
  });

  return result.secure_url;
};

export const createSongWithFiles = async ({
  title,
  artist,
  albumId,
  duration,
  audioFile,
  imageFile,
}) => {
  const audioUrl = await uploadToCloudinary(audioFile);
  const imageUrl = await uploadToCloudinary(imageFile);

  const song = new Song({
    title,
    artist,
    audioUrl,
    imageUrl,
    duration,
    albumId: albumId || null,
  });

  await song.save();

  if (albumId) {
    await Album.findByIdAndUpdate(albumId, {
      $push: { songs: song._id },
    });
  }

  await invalidateMusicCaches(albumId ? [`albums:${albumId}`] : []);

  return song;
};

export const deleteSongById = async (id) => {
  const song = await Song.findById(id);

  if (!song) {
    return null;
  }

  if (song.albumId) {
    await Album.findByIdAndUpdate(song.albumId, {
      $pull: { songs: song._id },
    });
  }

  await Song.findByIdAndDelete(id);

  await invalidateMusicCaches(song.albumId ? [`albums:${song.albumId}`] : []);

  return song;
};

export const createAlbumWithImage = async ({
  title,
  artist,
  releaseYear,
  imageFile,
}) => {
  const imageUrl = await uploadToCloudinary(imageFile);

  const album = new Album({
    title,
    artist,
    imageUrl,
    releaseYear,
  });

  await album.save();

  await invalidateMusicCaches();

  return album;
};

export const deleteAlbumById = async (id) => {
  const album = await Album.findById(id);

  if (!album) {
    return null;
  }

  await Song.deleteMany({ albumId: id });
  await Album.findByIdAndDelete(id);

  await invalidateMusicCaches([`albums:${id}`]);

  return album;
};
