"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ArrowLeft, MapPin, CreditCard, Clock, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

const BASE_URL = "http://localhost:8080";

// --- INTERFACE KHỚP 100% VỚI BACKEND RESPONSE ---
interface OrderItem {
  productName: string;
  imageUrl: string;
  quantity: number;
  finalPrice: number;
  originalPrice: number;
  discountPercent: number;
  sizeName?: string;
  colorName?: string;
}

interface OrderDetail {
  orderId: number;
  orderDate: string;
  subTotal: number;       // Tổng tiền hàng trước Voucher
  discountAmount: number; // Tiền giảm từ Voucher
  totalAmount: number;    // Tiền cuối cùng khách trả
  promoCode?: string;     // Mã Voucher đã dùng
  statusName: string;
  userFullName: string;
  userPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${id}/cancel`);
      if (res.data.success) {
        toast.success("Đã hủy đơn hàng thành công");
        const refresh = await api.get(`/orders/${id}`);
        setOrder(refresh.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng lúc này");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClasses = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return "bg-orange-100 text-orange-600";
      case "DELIVERED": return "bg-green-100 text-green-600";
      case "CANCELLED": return "bg-red-100 text-red-600";
      default: return "bg-blue-100 text-blue-600";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
  );

  if (!order) return <div className="text-center py-20 font-bold text-gray-500">⚠️ Đơn hàng không tồn tại</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-all font-bold text-sm"
        >
          <ArrowLeft size={16} /> QUAY LẠI TÀI KHOẢN
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: SẢN PHẨM */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-8 pb-6 border-b">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết đơn hàng</h1>
                  <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Mã: #BH-{order.orderId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusClasses(order.statusName)}`}>
                    {order.statusName || "Đang xử lý"}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-5 items-center group">
                    <div className="w-24 h-28 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 relative">
                      <img
                        src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={item.productName}
                      />
                      {item.discountPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md animate-pulse">
                          -{item.discountPercent}%
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.productName}</h4>
                      <p className="text-xs text-gray-400 font-medium">
                        Phân loại: {item.sizeName} | Số lượng: <span className="text-gray-900 font-bold">x{item.quantity}</span>
                      </p>

                      <div className="flex items-baseline gap-2 mt-4">
                        <p className="font-black text-green-600 text-xl">
                          {item.finalPrice?.toLocaleString()}đ
                        </p>
                        {item.discountPercent > 0 && (
                          <p className="text-sm text-gray-400 line-through decoration-red-300 decoration-1">
                            {item.originalPrice?.toLocaleString()}đ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.statusName?.toUpperCase() !== 'CANCELLED' && order.statusName?.toUpperCase() !== 'DELIVERED' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={18} /> : <AlertCircle size={18} />}
                HỦY ĐƠN HÀNG NÀY
              </button>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN NHẬN HÀNG & THANH TOÁN */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
                <MapPin size={18} className="text-green-600" />
                <h3 className="text-sm uppercase tracking-wider">Giao tới</h3>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-black text-gray-900">{order.userFullName}</p>
                <p className="text-gray-600 font-medium">{order.userPhone}</p>
                <p className="text-gray-500 leading-relaxed italic">"{order.deliveryAddress}"</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold border-b pb-4">
                <CreditCard size={18} className="text-green-600" />
                <h3 className="text-sm uppercase tracking-wider">Thanh toán</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Tạm tính</span>
                  <span className="font-bold text-gray-900">{order.subTotal?.toLocaleString()}đ</span>
                </div>

                {/* HIỂN THỊ TIỀN GIẢM VOUCHER */}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400 font-medium italic">
                      Giảm giá {order.promoCode ? `(Mã: ${order.promoCode})` : "Voucher"}
                    </span>
                    <span className="font-bold text-red-500">-{order.discountAmount?.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Phí vận chuyển</span>
                  <span className="font-bold text-green-600">Miễn phí</span>
                </div>

                <div className="pt-4 border-t-2 border-dashed flex justify-between items-center">
                  <span className="font-black text-gray-900">TỔNG CỘNG</span>
                  <span className="font-black text-green-600 text-2xl tracking-tighter">
                    {order.totalAmount?.toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4 font-bold">
                <Clock size={18} className="text-green-400" />
                <h3 className="text-sm uppercase tracking-widest text-green-400">Thời gian</h3>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Ngày đặt đơn</p>
                <p className="text-sm font-medium">
                  {new Date(order.orderDate).toLocaleString("vi-VN", {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}