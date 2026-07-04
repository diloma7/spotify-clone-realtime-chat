import { RateLimiterRedis } from "rate-limiter-flexible";
import { getAuth } from "@clerk/express";
import { redisClient } from "../../config/redis.js";
import { getCache } from "../../services/cache.service.js";

const globalRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rlflx_global",
  points: 100, // 100 requests
  duration: 15 * 60, // per 15 minutes per IP
  useRedisPackage: "redis",
});

// Map read-only API paths to the cache keys used in services
// so we can still serve cached data when rate limits are hit.
const cacheKeyByPath = {
  "/api/songs": "songs:all",
  "/api/songs/featured": "songs:featured:6",
  "/api/songs/made-for-you": "songs:featured:4",
  "/api/songs/trending": "songs:featured:4",
  "/api/stats": "stats:global",
  "/api/albums": "albums:all",
};

export const globalRateLimitMiddleware = async (req, res, next) => {
  try {
    // Skip rate limiting for authenticated users; this keeps the
    // app responsive for logged-in admins and normal users while
    // still protecting public/anonymous traffic.
    if (getAuth(req).userId) {
      return next();
    }

    const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
    await globalRateLimiter.consume(String(key));
    next();
  } catch (error) {
    // If error has msBeforeNext, it's a real rate-limit hit; otherwise treat as internal error
    if (error && typeof error.msBeforeNext !== "undefined") {
      // For idempotent GET requests, try to serve cached data instead of a hard 429
      if (req.method === "GET") {
        try {
          const path = req.originalUrl.split("?")[0];
          const cacheKey = cacheKeyByPath[path];

          if (cacheKey) {
            const cached = await getCache(cacheKey);

            if (cached) {
              // Shape the response similarly to each controller
              if (path === "/api/stats") {
                return res.status(200).json(cached);
              }

              if (path.startsWith("/api/songs")) {
                return res.status(200).json({
                  success: true,
                  message: "Songs fetched successfully (cached)",
                  songs: cached,
                });
              }

              if (path === "/api/albums") {
                return res.status(200).json({
                  success: true,
                  message: "Albums fetched successfully (cached)",
                  albums: cached,
                });
              }
            }
          }
        } catch (cacheError) {
          // eslint-disable-next-line no-console
          console.error(
            "Error serving cached response on rate limit",
            cacheError
          );
        }
      }

      // Default behaviour: return a 429 if we couldn't serve cached data
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later.",
      });
    } else {
      // eslint-disable-next-line no-console
      console.error("Rate limiter internal error", error);
      // Fail open: allow the request rather than blocking everything
      next();
    }
  }
};
