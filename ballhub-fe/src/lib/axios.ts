import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== Request Interceptor: Gắn Access Token ===== */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ===== Response Interceptor: Xử lý Auto Refresh Token ===== */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401
    if (error.response?.status === 401) {
      
      // QUAN TRỌNG: Nếu là request Login, trả lỗi về cho AuthForm xử lý, KHÔNG redirect
      if (originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      // Nếu không phải login và chưa retry lần nào
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          const res = await axios.post("http://localhost:8080/api/auth/refresh", {
            refreshToken: refreshToken,
          });

          const { accessToken } = res.data; 
          localStorage.setItem("accessToken", accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Chỉ xóa và văng ra ngoài khi thực sự không thể refresh (hết hạn cả 2 token)
          localStorage.clear();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;