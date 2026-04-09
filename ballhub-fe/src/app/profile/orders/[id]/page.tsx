"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ArrowLeft, MapPin, CreditCard, Clock, Loader2, AlertCircle, Trash2, Info, Store, Globe } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

const BASE_URL = "http://localhost:8080";

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
  subTotal: number;       
  discountAmount: number; 
  totalAmount: number;    
  promoCode?: string;     
  statusName: string;
  userFullName: string;
  userPhone: string;
  deliveryAddress: string;
  shippingFee?: number; 
  items: OrderItem[];
  isPos?: boolean; // ✅ Đã thêm
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleCancelOrderClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelModal(false);
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

  const getStatusDisplay = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return { label: "Chờ xử lý", classes: "bg-orange-100 text-orange-600" };
      case "CONFIRMED":
        return { label: "Đã xác nhận", classes: "bg-blue-100 text-blue-600" };
      case "SHIPPING":
        return { label: "Đang giao", classes: "bg-indigo-100 text-indigo-600" };
      case "DELIVERED":
        return { label: "Đã giao", classes: "bg-green-100 text-green-600" };
      case "CANCELLED":
        return { label: "Đã hủy", classes: "bg-gray-100 text-gray-600" };
      case "RETURNED":
        return { label: "Đã trả hàng", classes: "bg-red-100 text-red-600" };
      default:
        return { label: status || "Không rõ", classes: "bg-gray-100 text-gray-600" };
    }
  };

  const calculateShippingFee = (addressText: string, totalAmount: number) => {
    if (!addressText || addressText.trim() === "") return 0;
    if (totalAmount >= 1000000) return 0;

    let baseFee = 30000;
    const addr = addressText.toLowerCase();

    if (addr.includes("hà nội") || addr.includes("ha noi")) baseFee = 15000;
    else if (addr.includes("hồ chí minh") || addr.includes("ho chi minh") || addr.includes("hcm")) baseFee = 35000;
    else if (addr.includes("đà nẵng") || addr.includes("da nang")) baseFee = 25000;
    else if (addr.includes("hải phòng") || addr.includes("hai phong") || addr.includes("quảng ninh")) baseFee = 20000;
    else if (addr.includes("cần thơ") || addr.includes("can tho") || addr.includes("bình dương")) baseFee = 30000;

    return baseFee;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
  );

  if (!order) return <div className="text-center py-20 font-bold text-gray-500">⚠️ Đơn hàng không tồn tại</div>;

  const displayShippingFee = order.shippingFee !== undefined ? order.shippingFee : calculateShippingFee(order.deliveryAddress, order.subTotal);
  const displayTotalAmount = (order.subTotal - (order.discountAmount || 0) > 0 ? order.subTotal - (order.discountAmount || 0) : 0) + displayShippingFee;
  const statusConfig = getStatusDisplay(order.statusName);
  const isDeliveryOrder = displayShippingFee > 0;

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1 text-gray-800">
        <button
          onClick={() => router.push('/profile/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-6 transition-all font-bold text-sm"
        >
          <ArrowLeft size={16} /> QUAY LẠI TÀI KHOẢN
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-8 pb-6 border-b">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết đơn hàng</h1>
                    {/* 🚀 BADGE PHÂN LOẠI CHO USER CHI TIẾT */}
                    {order.isPos ? (
                      <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Store size={10}/> Mua tại cửa hàng</span>
                    ) : (
                      <span className="bg-blue-50 text-blue-500 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Globe size={10}/> Đặt hàng Online</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Mã: #BH-{order.orderId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.classes}`}>
                    {statusConfig.label}
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
                      <p className="text-xs text-gray-400 font-medium flex items-center flex-wrap gap-1 mt-1">
                        <span>Phân loại:</span>
                        <span className="text-gray-700 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.sizeName}
                        </span>
                        {item.colorName && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-700 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.colorName}
                            </span>
                          </>
                        )}
                        <span className="text-gray-300 mx-1">•</span>
                        <span>Số lượng: <span className="text-gray-900 font-bold">x{item.quantity}</span></span>
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

            {(order.statusName?.toUpperCase() === 'PENDING' || order.statusName?.toUpperCase() === 'CONFIRMED') && (
              <button
                onClick={handleCancelOrderClick}
                disabled={cancelling}
                className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={18} /> : <AlertCircle size={18} />}
                HỦY ĐƠN HÀNG NÀY
              </button>
            )}

            {order.statusName?.toUpperCase() === 'CANCELLED' && (
              <div className="w-full py-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                ĐƠN HÀNG ĐÃ BỊ HỦY
              </div>
            )}

            {order.statusName?.toUpperCase() === 'RETURNED' && (
              <div className="w-full py-4 rounded-2xl bg-red-50 border-2 border-red-100 text-red-600 font-bold text-sm flex items-center justify-center gap-2">
                <AlertCircle size={18} />
                ĐƠN HÀNG ĐÃ BỊ TRẢ LẠI
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
                <MapPin size={18} className="text-green-600" />
                <h3 className="text-sm uppercase tracking-wider">Thông tin nhận hàng</h3>
              </div>
              <div className="text-sm space-y-2">
                <p className="font-black text-gray-900">{order.userFullName}</p>
                <p className="text-gray-600 font-medium">{order.userPhone}</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                  <p className="text-xs text-gray-400 uppercase font-black mb-1">Địa chỉ giao tới:</p>
                  <p className="text-gray-700 font-semibold italic">
                    {order.isPos 
                      ? (isDeliveryOrder ? `${order.deliveryAddress} (Giao từ cửa hàng)` : "Nhận trực tiếp tại shop (58 Trúc Khê)")
                      : (order.deliveryAddress || "---")
                    }
                  </p>
                </div>
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
                  <span className={displayShippingFee === 0 ? "font-bold text-green-600" : "font-bold text-gray-900"}>
                    {displayShippingFee === 0 ? "Miễn phí" : `+${displayShippingFee.toLocaleString()}đ`}
                  </span>
                </div>

                <div className="pt-4 border-t-2 border-dashed flex justify-between items-center">
                  <span className="font-black text-gray-900">TỔNG CỘNG</span>
                  <span className="font-black text-green-600 text-2xl tracking-tighter">
                    {displayTotalAmount.toLocaleString()}đ
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

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đơn hàng?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold text-gray-900">#BH-{order.orderId}</span>? Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={confirmCancelOrder}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}