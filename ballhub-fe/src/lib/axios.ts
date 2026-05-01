import axios from "axios";
import { API_URL } from "@/config/env";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===== 1. Request Interceptor: Gắn Access Token ===== */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // ✅ ĐÃ SỬA: Đổi accessToken thành refreshToken cho toàn hệ thống
    const token = localStorage.getItem("refreshToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ===== 2. Response Interceptor: Xử lý dữ liệu & Auto Refresh ===== */
api.interceptors.response.use(
  (response) => {
    // ✅ "DIỆT TẬN GỐC" res.data.data: 
    // Nếu Backend trả về cấu trúc { success, data, message }
    // Chúng ta sẽ bóc lớp vỏ bên ngoài và chỉ trả về object { success, data, message } cho Frontend dùng
    // Như vậy ở Page, res.data chính là cái object này, và res.data.data là mảng dữ liệu.
    return response; 
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      
      // Nếu là request Login, trả lỗi về luôn, không refresh
      if (originalRequest.url.includes("/auth/login")) {
        return Promise.reject(error);
      }

      // Nếu không phải login và chưa retry lần nào
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");

          // Gọi API refresh token (Dùng axios gốc để tránh bị interceptor 401 lặp vô hạn)
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          // Lưu token mới
          const { accessToken } = res.data.data; // Lưu ý: BE của bạn bọc trong .data
          localStorage.setItem("accessToken", accessToken);

          // Gán token mới vào request cũ và chạy lại
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Nếu refresh cũng hỏng (hết hạn cả 2) -> Log out
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