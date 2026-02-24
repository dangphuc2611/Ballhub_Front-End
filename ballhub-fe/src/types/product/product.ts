export interface Product {
  // --- CÁC TRƯỜNG CŨ CỦA FRONTEND (Giữ lại để tương thích Mock Data) ---
  id?: string | number; // Đổi sang string | number vì DB trả về ID là số (Integer)
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  badge?: string;

  // --- CÁC TRƯỜNG MỚI TỪ BACKEND API ---
  productId?: number;
  productName?: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  mainImage?: string;

  // Các trường phục vụ tính toán Giá & Flash Sale
  minPrice?: number;           // Giá sau khi giảm (hiển thị chính)
  maxPrice?: number;
  minOriginalPrice?: number;   // Giá gốc (để gạch ngang)
  maxOriginalPrice?: number;
  discountPercent?: number;    // % Giảm giá (để hiện nhãn -XX%)

  status?: boolean;
  createdAt?: string;
}