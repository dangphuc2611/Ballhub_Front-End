import api from "./axios"; // ✅ Dùng chung instance 'api' duy nhất đã cấu hình Token & Refresh Token

/**
 * 🛒 API GIỎ HÀNG (Cart API)
 * File này hiện tại chỉ đóng vai trò chứa các hàm gọi riêng cho Cart.
 * Mọi cấu hình về Header, Authorization, 401 Error đã được xử lý ở file ./axios.ts
 */

// Hàm thêm sản phẩm vào giỏ hàng
export const addToCartApi = async (variantId: number, quantity: number = 1) => {
  // Vì dùng chung 'api' nên nó tự động có Bearer Token trong Header
  return api.post("/cart/items", { variantId, quantity });
};

// Xuất ra instance chính để các file như OrderSummary.tsx sử dụng
export default api;