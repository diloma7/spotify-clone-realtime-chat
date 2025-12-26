import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5007,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminUserId: process.env.ADMIN_USER_ID,
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
};

if (!env.mongoUri) {
  // eslint-disable-next-line no-console
  console.warn("MONGO_URI is not defined in environment variables.");
}

if (!env.redis.url) {
  // eslint-disable-next-line no-console
  console.warn(
    "REDIS_URL is not defined; falling back to host/port for Redis connection."
  );
}
