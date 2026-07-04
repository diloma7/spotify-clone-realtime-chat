import dotenv from "dotenv";

dotenv.config();

const DEFAULT_DEV_CLIENT_URLS = ["http://localhost:5173", "http://localhost:5174"];

const getClientUrls = () => {
  const configuredUrls = [
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS || "").split(","),
  ]
    .map((url) => url?.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return configuredUrls;
  }

  return Array.from(new Set([...configuredUrls, ...DEFAULT_DEV_CLIENT_URLS]));
};

const clientUrls = getClientUrls();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5007,
  mongoUri: process.env.MONGO_URI,
  clientUrl: clientUrls[0] || "http://localhost:5173",
  clientUrls,
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
    jwtKey: process.env.CLERK_JWT_KEY,
  },
};

if (env.nodeEnv === "production") {
  const missingRequiredValues = [
    ["MONGO_URI", env.mongoUri],
    ["CLIENT_URL or CLIENT_URLS", env.clientUrls.length > 0],
    ["ADMIN_USER_ID", env.adminUserId],
    ["CLOUDINARY_CLOUD_NAME", env.cloudinary.cloudName],
    ["CLOUDINARY_API_KEY", env.cloudinary.apiKey],
    ["CLOUDINARY_API_SECRET", env.cloudinary.apiSecret],
    ["CLERK_SECRET_KEY", env.clerk.secretKey],
    ["CLERK_PUBLISHABLE_KEY", env.clerk.publishableKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingRequiredValues.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingRequiredValues.join(
        ", "
      )}`
    );
  }
}

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
