import { redisClient } from "../config/redis.js";

const DEFAULT_TTL_SECONDS = 60;

export const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error reading cache for key", key, error);
    return null;
  }
};

export const setCache = async (key, data, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  try {
    const value = JSON.stringify(data);
    await redisClient.set(key, value, { EX: ttlSeconds });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error setting cache for key", key, error);
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting cache for key", key, error);
  }
};
