import Song from "../models/song.model.js";
import { getCache, setCache } from "./cache.service.js";

const ALL_SONGS_CACHE_KEY = "songs:all";

export const getAllSongsSorted = async () => {
  const cached = await getCache(ALL_SONGS_CACHE_KEY);
  if (cached) return cached;

  const songs = await Song.find().sort({ createdAt: -1 });
  await setCache(ALL_SONGS_CACHE_KEY, songs, 60);
  return songs;
};

const projectionPipeline = [
  {
    $project: {
      _id: 1,
      title: 1,
      artist: 1,
      audioUrl: 1,
      imageUrl: 1,
    },
  },
];

export const getRandomFeaturedSongs = async (size) => {
  const cacheKey = `songs:featured:${size}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const songs = await Song.aggregate([
    ...projectionPipeline,
    { $sample: { size } },
  ]);

  await setCache(cacheKey, songs, 60);
  return songs;
};
