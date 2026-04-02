"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Tag, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/cartApi";
import { Promotion } from "@/types/promotion";

// ✅ Nhận thêm shippingFee từ file page.tsx truyền xuống (mặc định = 0)
export function OrderSummary({
  cartData,
  isSubmitting,
  onOrder,
  baseUrl,
  appliedPromo,
  setAppliedPromo,
  shippingFee = 0,
}: any) {
  const [availablePromos, setAvailablePromos] = useState<Promotion[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [hasAutoApplied, setHasAutoApplied] = useState(false); // Cờ để chỉ tự động áp dụng 1 lần

  const subTotal = cartData.totalAmount || 0;

  // 1. Fetch danh sách Voucher khi component được mount
  useEffect(() => {
    const fetchPromos = async () => {
      setLoadingPromos(true);
      try {
        // ✅ FIX 1: Gọi endpoint chuẩn đã thống nhất ở Backend
        const res = await api.get("/promotions/active");

        // ✅ FIX 2: Nhận data từ ApiResponse { success, data, message }
        if (res.data && res.data.data) {
          setAvailablePromos(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách Voucher:", error);
      } finally {
        setLoadingPromos(false);
      }
    };
    fetchPromos();
  }, []);

  // Hàm tính toán số tiền giảm giá của một promo bất kỳ
  const calculateDiscount = (promo: any, currentSubTotal: number) => {
    if (!promo || currentSubTotal < promo.minOrderAmount) return 0;

    let discount = 0;
    if (promo.discountType === "PERCENT") {
      // ✅ Đảm bảo dùng đúng tên trường discountPercent từ Backend
      discount = (currentSubTotal * (promo.discountPercent || 0)) / 100;
      if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
        discount = promo.maxDiscountAmount;
      }
    } else if (promo.discountType === "FIXED") {
      // ✅ FIXED thì lấy maxDiscountAmount làm giá trị giảm
      discount = promo.maxDiscountAmount || 0;
    }
    return Math.floor(discount);
  };

  // 2. Logic Tự động tìm và áp dụng Voucher tốt nhất
  useEffect(() => {
    if (
      availablePromos.length > 0 &&
      subTotal > 0 &&
      !hasAutoApplied &&
      !appliedPromo
    ) {
      let bestPromo = null;
      let maxDiscount = 0;

      availablePromos.forEach((promo) => {
        const discount = calculateDiscount(promo, subTotal);
        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestPromo = promo;
        }
      });

      if (bestPromo) {
        setAppliedPromo(bestPromo);
        setHasAutoApplied(true); 
        toast.success(`Hệ thống đã tự động áp dụng mã tốt nhất cho bạn!`, {
          icon: <Sparkles className="text-yellow-500" size={16} />,
        });
      }
    }
  }, [availablePromos, subTotal, hasAutoApplied, appliedPromo, setAppliedPromo]);

  // 3. Logic tính toán tiền giảm giá cho mã đang được áp dụng
  let discountAmount = 0;
  if (appliedPromo) {
    if (subTotal >= appliedPromo.minOrderAmount) {
      discountAmount = calculateDiscount(appliedPromo, subTotal);
    } else {
      setAppliedPromo(null);
      toast.error(
        `Đơn hàng cần đạt tối thiểu ${appliedPromo.minOrderAmount.toLocaleString()}đ để dùng mã này.`,
      );
    }
  }

  // ✅ 4. TỔNG TIỀN CUỐI CÙNG = Tạm tính - Giảm giá + Phí Ship
  const finalTotal = (subTotal - discountAmount > 0 ? subTotal - discountAmount : 0) + shippingFee;

  // Xử lý khi người dùng ấn nút "Áp dụng" (Nhập tay)
  const handleApplyManualPromo = () => {
    if (!promoInput.trim()) return;

    const matchedPromo = availablePromos.find(
      (p) => p.promoCode.toUpperCase() === promoInput.trim().toUpperCase(),
    );

    if (matchedPromo) {
      if (subTotal >= matchedPromo.minOrderAmount) {
        setAppliedPromo(matchedPromo);
        setPromoInput("");
        toast.success(`Áp dụng thành công mã ${matchedPromo.promoCode}`);
      } else {
        toast.error(
          `Đơn hàng cần tối thiểu ${matchedPromo.minOrderAmount.toLocaleString()}đ`,
        );
      }
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  // Xử lý khi người dùng chọn thẳng mã từ danh sách (Click)
  const handleSelectPromo = (promo: any) => {
    if (subTotal >= promo.minOrderAmount) {
      setAppliedPromo(promo);
      toast.success(`Áp dụng mã ${promo.promoCode}`);
    } else {
      toast.error(`Đơn tối thiểu ${promo.minOrderAmount.toLocaleString()}đ`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl sticky top-24">
      <h3 className="text-lg font-bold mb-6">
        Đơn hàng của bạn{" "}
        <span className="text-gray-400 font-medium">
          ({cartData.items.length})
        </span>
      </h3>

      {/* DANH SÁCH SẢN PHẨM TRONG GIỎ */}
      <div className="max-h-[250px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
        {cartData.items.map((item: any) => (
          <div key={item.cartItemId} className="flex gap-4">
            <div className="w-16 h-16 relative bg-gray-50 rounded-xl overflow-hidden border flex-shrink-0">
              <Image
                src={item.imageUrl?.startsWith("http") ? item.imageUrl : `${baseUrl}${item.imageUrl}`}
                alt="img" fill className="object-contain p-1" unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate">{item.productName}</h4>
              <p className="text-[10px] text-gray-500 uppercase mt-1">
                Size {item.sizeName} | SL: {item.quantity}
              </p>
              {/* ✅ FIX HYDRATION */}
              <p className="text-sm font-bold text-green-600 mt-1" suppressHydrationWarning>
                {item.subtotal.toLocaleString()}đ
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- KHU VỰC VOUCHER & MÃ GIẢM GIÁ --- */}
      <div className="border-t border-gray-50 pt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Tag size={16} className="text-green-600" /> Mã giảm giá
          </h4>
          {!appliedPromo && availablePromos.length > 0 && (
            <span className="text-[10px] text-orange-500 font-medium flex items-center gap-1 animate-pulse">
              <Sparkles size={12} /> Có mã giảm giá cho bạn!
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text" placeholder="Nhập mã khuyến mãi"
            className="flex-1 border border-gray-200 rounded-xl px-4 text-sm uppercase focus:outline-none focus:border-green-500"
            value={promoInput} onChange={(e) => setPromoInput(e.target.value)}
          />
          <Button onClick={handleApplyManualPromo} variant="outline" className="rounded-xl border-green-600 text-green-600 hover:bg-green-50">
            Áp dụng
          </Button>
        </div>

        {appliedPromo && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white rounded-lg p-1.5"><Tag size={16} /></div>
              <div>
                <p className="text-xs font-bold text-green-700 uppercase flex items-center gap-1">
                  {appliedPromo.promoCode} {hasAutoApplied && <Sparkles size={10} className="text-yellow-500" />}
                </p>
                <p className="text-[10px] text-green-600 font-medium" suppressHydrationWarning>
                  Đã giảm {discountAmount.toLocaleString()}đ
                </p>
              </div>
            </div>
            <button onClick={() => { setAppliedPromo(null); setHasAutoApplied(true); }} className="text-gray-400 hover:text-red-500 transition-colors">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {!appliedPromo && availablePromos.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Mã có sẵn</p>
            <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {availablePromos.map((promo) => {
                const isEligible = subTotal >= promo.minOrderAmount;
                const estimatedDiscount = isEligible ? calculateDiscount(promo, subTotal) : 0;
                return (
                  <div key={promo.promotionId} onClick={() => isEligible && handleSelectPromo(promo)}
                    className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all ${isEligible ? "border-gray-200 hover:border-green-500 hover:bg-green-50/50 hover:shadow-sm" : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"}`}
                  >
                    <div>
                      <p className={`text-xs font-bold flex items-center gap-2 ${isEligible ? "text-gray-900" : "text-gray-400"}`}>
                        {promo.promoCode}
                        {promo.discountPercent && <span className="font-bold text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">-{promo.discountPercent}%</span>}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1" suppressHydrationWarning>Đơn từ {promo.minOrderAmount.toLocaleString()}đ</p>
                    </div>
                    {isEligible && estimatedDiscount > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Giảm</p>
                        <p className="text-xs font-bold text-green-600" suppressHydrationWarning>-{estimatedDiscount.toLocaleString()}đ</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TÍNH TOÁN TỔNG TIỀN */}
      <div className="space-y-3 border-t border-gray-50 pt-6 mb-8">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tạm tính</span>
          <span className="font-bold text-gray-900" suppressHydrationWarning>{subTotal.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Phí vận chuyển</span>
          <span className={shippingFee === 0 ? "text-green-600 font-bold" : "font-bold text-gray-900"} suppressHydrationWarning>
            {shippingFee === 0 ? "Miễn phí" : `+${shippingFee.toLocaleString()}đ`}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá Voucher</span>
            <span className="font-bold" suppressHydrationWarning>- {discountAmount.toLocaleString()}đ</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <span className="font-bold text-gray-900">Tổng cộng</span>
          <span className="text-2xl font-black text-green-600" suppressHydrationWarning>{finalTotal.toLocaleString()}đ</span>
        </div>
      </div>

      <Button onClick={onOrder} disabled={isSubmitting || loadingPromos} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-100">
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Đặt hàng ngay"}
      </Button>
    </div>
  );
}