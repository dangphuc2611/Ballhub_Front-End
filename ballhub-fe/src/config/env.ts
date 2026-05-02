export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ballhub-backend-production.up.railway.app";
export const API_URL = "/api";

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
