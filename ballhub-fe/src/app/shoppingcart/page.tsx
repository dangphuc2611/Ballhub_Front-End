"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  RefreshCcw,
  Info
} from "lucide-react";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/cartApi";
import { toast } from "sonner";
import { getImageUrl } from "@/config/env";

type CartItem = {
  cartItemId: number;
  productName: string;
  price: number;
  finalPrice: number;
  quantity: number;
  stockQuantity: number;
  sizeName: string;
  colorName: string;
  imageUrl: string;
  subtotal: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // ✅ STATE MỚI: Lưu giá trị người dùng đang gõ tay
  const [localQuantities, setLocalQuantities] = useState<Record<number, string>>({});
  
  const router = useRouter();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: number, name: string} | null>(null);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const { items, totalAmount } = response.data.data;
      setCartItems(items || []);
      setTotalAmount(totalAmount || 0);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getFullImageUrl = (url: string) => getImageUrl(url);

  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return "0đ";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "0đ";
    return numPrice.toLocaleString("vi-VN") + "đ";
  };

  // ✅ HÀM MỚI: Xử lý gom chung cả click +/- và gõ tay
  const handleUpdateQuantity = async (cartItemId: number, targetQty: number, maxStock: number) => {
    let finalQty = targetQty;
    
    // Ràng buộc số lượng hợp lệ (không được gõ chữ, không được < 1)
    if (isNaN(finalQty) || finalQty < 1) finalQty = 1;
    
    // Ràng buộc số lượng tồn kho
    if (finalQty > maxStock) {
      finalQty = maxStock;
      toast.error(`Kho chỉ còn ${maxStock} sản phẩm`);
    }

    const item = cartItems.find(i => i.cartItemId === cartItemId);
    
    // Nếu số lượng gõ vào bằng đúng số cũ -> Không gọi API, chỉ xóa state local
    if (!item || item.quantity === finalQty) {
       setLocalQuantities(prev => { const next = {...prev}; delete next[cartItemId]; return next; });
       return;
    }

    setUpdatingId(cartItemId);
    try {
      await api.put(`/cart/items/${cartItemId}`, { quantity: finalQty });
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Không thể cập nhật số lượng");
    } finally {
      setUpdatingId(null);
      // Xóa state gõ tạm sau khi update xong
      setLocalQuantities(prev => { const next = {...prev}; delete next[cartItemId]; return next; });
    }
  };

  const handleRemoveClick = (id: number, name: string) => {
    setItemToRemove({ id, name });
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = () => {
    if (!itemToRemove) return;
    const id = itemToRemove.id;
    setShowRemoveModal(false);

    toast.promise(api.delete(`/cart/items/${id}`), {
      loading: "Đang xóa...",
      success: () => {
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
        return "Đã xóa sản phẩm khỏi giỏ hàng";
      },
      error: "Lỗi khi xóa",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12 w-full flex-1">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
              <ShoppingBag size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-gray-500 mb-8 text-center max-w-sm">Hãy khám phá những sản phẩm mới nhất của chúng tôi!</p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 rounded-full font-bold shadow-md"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold mb-10 flex items-center gap-3">
              Giỏ hàng
              <span className="text-green-600 text-xl font-medium">({cartItems.length})</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="p-5 text-xs font-bold text-gray-400 uppercase">Sản phẩm</th>
                        <th className="p-5 text-xs font-bold text-gray-400 uppercase text-center">Giá</th>
                        <th className="p-5 text-xs font-bold text-gray-400 uppercase text-center">SL</th>
                        <th className="p-5 text-xs font-bold text-gray-400 uppercase text-right">Thành tiền</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cartItems.map((item) => {
                        const maxStock = item.stockQuantity || 100;
                        const isMaxQty = item.quantity >= maxStock;

                        return (
                          <tr key={item.cartItemId} className="hover:bg-green-50/50 transition">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 relative bg-gray-50 rounded-xl overflow-hidden border">
                                  <Image
                                    src={getFullImageUrl(item.imageUrl)}
                                    alt={item.productName}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{item.productName}</h4>
                                  <div className="flex gap-2 mt-1.5 text-[10px] uppercase font-bold tracking-wider">
                                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">
                                      Size {item.sizeName}
                                    </span>
                                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                      {item.colorName}
                                    </span>
                                  </div>
                                  {isMaxQty && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 italic">
                                      *Đã đạt số lượng tối đa trong kho
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-center font-medium text-sm">{formatPrice(item.finalPrice)}</td>
                            <td className="p-5">
                              <div className="flex justify-center">
                                {/* ✅ KHUNG NHẬP SỐ LƯỢNG MỚI */}
                                <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1, maxStock)}
                                    disabled={updatingId === item.cartItemId || item.quantity <= 1}
                                    className={`w-8 h-8 flex items-center justify-center transition-colors border-r
                                      ${item.quantity <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  
                                  <input
                                    type="text" // Dùng text để chặn được các ký tự lạ
                                    value={updatingId === item.cartItemId ? "..." : (localQuantities[item.cartItemId] ?? item.quantity)}
                                    onChange={(e) => {
                                      // Chỉ cho phép nhập số
                                      const val = e.target.value.replace(/[^0-9]/g, "");
                                      setLocalQuantities({ ...localQuantities, [item.cartItemId]: val });
                                    }}
                                    onBlur={(e) => {
                                      // Gửi API khi click chuột ra chỗ khác
                                      const parsed = parseInt(e.target.value, 10);
                                      handleUpdateQuantity(item.cartItemId, parsed, maxStock);
                                    }}
                                    onKeyDown={(e) => {
                                      // Gửi API khi ấn nút Enter
                                      if (e.key === "Enter") {
                                        e.currentTarget.blur();
                                      }
                                    }}
                                    disabled={updatingId === item.cartItemId}
                                    className={`w-12 text-center text-xs font-bold outline-none transition-colors 
                                      ${updatingId === item.cartItemId ? 'text-gray-300' : 'text-gray-900'} 
                                      focus:bg-green-50`}
                                  />

                                  <button
                                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1, maxStock)}
                                    disabled={updatingId === item.cartItemId || isMaxQty}
                                    className={`w-8 h-8 flex items-center justify-center transition-colors border-l
                                      ${isMaxQty ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-right font-bold text-green-600 text-sm">
                              {formatPrice(item.subtotal)}
                            </td>
                            <td className="p-5 text-right">
                              <button
                                onClick={() => handleRemoveClick(item.cartItemId, item.productName)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="mt-6 flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold text-xs uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Quay lại cửa hàng
                </button>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 sticky top-24">
                  <h3 className="text-xl font-bold mb-6">Đơn hàng của bạn</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="font-bold">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-bold">Miễn phí</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-green-600 tracking-tighter">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-bold shadow-lg shadow-green-100 uppercase tracking-widest text-xs transition-transform active:scale-95"
                  >
                    Thanh toán ngay
                  </Button>
                  <div className="grid grid-cols-2 gap-3 mt-8 text-[10px] uppercase font-bold tracking-tighter text-gray-400">
                    <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <ShieldCheck className="text-green-500 mb-2" size={20} />
                      Bảo mật 100%
                    </div>
                    <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <RefreshCcw className="text-green-500 mb-2" size={20} />
                      Đổi trả 30 ngày
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* ✅ CUSTOM MODAL XÁC NHẬN XÓA SẢN PHẨM */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa sản phẩm?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa <span className="font-bold text-gray-900">"{itemToRemove?.name}"</span> khỏi giỏ hàng?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmRemoveItem}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}