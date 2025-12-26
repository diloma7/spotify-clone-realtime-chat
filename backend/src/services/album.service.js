import Album from "../models/album.model.js";
import { getCache, setCache } from "./cache.service.js";

const ALL_ALBUMS_CACHE_KEY = "albums:all";

export const getAllAlbumsSorted = async () => {
  const cached = await getCache(ALL_ALBUMS_CACHE_KEY);
  if (cached) return cached;

  const albums = await Album.find().sort({ createdAt: -1 });
  await setCache(ALL_ALBUMS_CACHE_KEY, albums, 60);
  return albums;
};

export const getAlbumWithSongsById = async (albumId) => {
  const cacheKey = `albums:${albumId}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const album = await Album.findById(albumId).populate("songs");
  if (album) {
    await setCache(cacheKey, album, 60);
  }
  return album;
};
