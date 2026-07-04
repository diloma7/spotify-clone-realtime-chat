import {
  createSongWithFiles,
  deleteSongById,
  createAlbumWithImage,
  deleteAlbumById,
} from "../services/admin.service.js";
import { clerkClient, getAuth } from "@clerk/express";
import { env } from "../config/env.js";

export const checkAdmin = async (req, res, next) => {
  try {
    const user = await clerkClient.users.getUser(getAuth(req).userId);
    const isAdmin =
      env.adminUserId === user.primaryEmailAddress?.emailAddress;

    res.status(200).json({ admin: !!isAdmin });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error checking admin status:", error);
    next(error);
  }
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

    const song = await createSongWithFiles({
      title,
      artist,
      albumId,
      duration,
      audioFile,
      imageFile,
    });

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
    const song = await deleteSongById(id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

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
    const { imageFile } = req.files;

    const album = await createAlbumWithImage({
      title,
      artist,
      releaseYear,
      imageFile,
    });

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
    const album = await deleteAlbumById(id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Album deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting an album:", error);
    next(error);
  }
};
