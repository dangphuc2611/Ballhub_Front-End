import axios from "axios";

const refreshToken =
  typeof window !== "undefined"
    ? localStorage.getItem("refreshToken")
    : null;

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${refreshToken}`
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const addToCartApi = async (variantId: number, quantity: number = 1) => {
  return api.post("/cart/items", { variantId, quantity });
};

export default api;