import Album from "../models/album.model.js";
import Song from "../models/song.model.js";
import User from "../models/user.model.js";
import { getCache, setCache } from "./cache.service.js";

const GLOBAL_STATS_CACHE_KEY = "stats:global";

export const getGlobalStats = async () => {
  const cached = await getCache(GLOBAL_STATS_CACHE_KEY);
  if (cached) return cached;

  const [totalSongs, totalAlbums, totalUsers, uniqueArtists] =
    await Promise.all([
      Song.countDocuments(),
      Album.countDocuments(),
      User.countDocuments(),
      Song.aggregate([
        {
          $unionWith: {
            coll: "albums",
            pipeline: [],
          },
        },
        {
          $group: {
            _id: "$artist",
          },
        },
        {
          $count: "count",
        },
      ]),
    ]);

  const stats = {
    totalAlbums,
    totalSongs,
    totalUsers,
    totalArtists: uniqueArtists[0]?.count || 0,
  };

  await setCache(GLOBAL_STATS_CACHE_KEY, stats, 60);

  return stats;
};
