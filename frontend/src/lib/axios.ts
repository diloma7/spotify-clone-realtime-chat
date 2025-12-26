import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: (() => {
    const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)
      ?.trim()
      .replace(/\/$/, "");

    // Default to the nginx entrypoint when running locally.
    const base = configuredBase || "http://localhost:8080";
    return `${base}/api`;
  })(),
});
