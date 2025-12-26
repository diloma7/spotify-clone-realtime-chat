import { createClient } from "redis";
import { env } from "./env.js";

const redisUrl = env.redis.url || `redis://${env.redis.host}:${env.redis.port}`;

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Redis Client Error", err);
});

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to Redis:", error);
  }
})();
