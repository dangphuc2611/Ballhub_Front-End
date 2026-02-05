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
  TicketPercent,
} from "lucide-react";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/cartApi";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080";

type CartItem = {
  cartItemId: number;
  productName: string;
  price: number;
  finalPrice: number;
  quantity: number;
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
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();

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

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.png";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const updateQty = async (
    cartItemId: number,
    currentQty: number,
    delta: number
  ) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    setUpdatingId(cartItemId);
    try {
      await api.put(`/cart/items/${cartItemId}`, { quantity: newQty });
      await fetchCart();
    } catch {
      toast.error("Không thể cập nhật số lượng");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = (id: number) => {
    toast.promise(api.delete(`/cart/items/${id}`), {
      loading: "Đang xóa...",
      success: () => {
        fetchCart();
        return "Đã xóa sản phẩm";
      },
      error: "Lỗi khi xóa",
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    toast.info(`Đang áp dụng mã: ${couponCode}`);
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
            <p className="text-gray-500 mb-8 text-center max-w-sm">
              Hãy khám phá những sản phẩm mới nhất của chúng tôi!
            </p>
            <Button
              onClick={() => router.push("/")}
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
                      {cartItems.map((item) => (
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
                                  <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Size {item.sizeName}</span>
                                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{item.colorName}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-center font-medium text-sm">
                            {item.finalPrice.toLocaleString()}đ
                          </td>
                          <td className="p-5">
                            <div className="flex justify-center">
                              <div className="flex items-center border rounded-lg bg-white">
                                <button
                                  onClick={() => updateQty(item.cartItemId, item.quantity, -1)}
                                  disabled={updatingId === item.cartItemId}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold">
                                  {updatingId === item.cartItemId ? ".." : item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item.cartItemId, item.quantity, 1)}
                                  disabled={updatingId === item.cartItemId}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-right font-bold text-green-600 text-sm">
                            {item.subtotal.toLocaleString()}đ
                          </td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => removeItem(item.cartItemId)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
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

                  {/* PHẦN TẠM TÍNH VÀ VẬN CHUYỂN TRƯỚC */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="font-bold">{totalAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-bold">Miễn phí</span>
                    </div>
                  </div>

                  {/* PHẦN NHẬP MÃ GIẢM GIÁ (ĐÃ CHUYỂN XUỐNG ĐÂY) */}
                  <div className="mb-8 pt-6 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Mã giảm giá
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="NHẬP MÃ..."
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all uppercase font-medium"
                        />
                      </div>
                      <button 
                        onClick={handleApplyCoupon}
                        className="bg-gray-900 text-white px-4 rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm"
                      >
                        ÁP DỤNG
                      </button>
                    </div>
                  </div>

                  {/* TỔNG CỘNG*/}
                  <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-green-600 tracking-tighter">
                        {totalAmount.toLocaleString()}đ
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
    </div>
  );
}