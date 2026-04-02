export interface Promotion {
  promotionId: number;
  promotionName: string;
  promoCode: string;
  description: string | null;
  
  discountType: "PERCENT" | "FIXED";
  discountPercent: number | null;
  maxDiscountAmount: number | null; // Số tiền giảm tối đa (hoặc số tiền giảm cố định nếu là FIXED)
  minOrderAmount: number; // Đơn hàng tối thiểu để áp dụng
  
  usageLimit: number | null;
  usedCount: number;
  
  startDate: string | null;
  endDate: string | null;
  
  status: boolean; // Trạng thái bật/tắt của Admin
  valid: boolean;  // Trạng thái còn hạn/còn lượt (Computed từ BE)
}

// Nếu bạn cần định nghĩa cho ApiResponse bọc ngoài
export interface PromotionResponse {
  success: boolean;
  message: string;
  data: Promotion[];
}