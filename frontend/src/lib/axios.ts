import axios from "axios";

const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)
  ?.trim()
  .replace(/\/$/, "");

export const apiOrigin =
  configuredBase || (import.meta.env.DEV ? "http://localhost:8080" : "");

export const axiosInstance = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : "/api",
});
