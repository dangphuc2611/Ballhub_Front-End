export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}/api`;

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
