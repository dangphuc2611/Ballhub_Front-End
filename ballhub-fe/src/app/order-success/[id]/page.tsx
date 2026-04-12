"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios"; // Giả sử bạn có file axios config này

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  // ✅ Fetch thông tin đơn hàng để hiển thị Tổng tiền cho khách
  useEffect(() => {
    if (!orderId) return;
    
    api.get(`/orders/${orderId}`)
      .then(res => {
        if (res.data.success) {
          setOrderTotal(res.data.data.totalAmount);
        }
      })
      .catch(err => console.error("Lỗi lấy thông tin đơn hàng:", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="bg-[#F8F9FA] min-h-screen flex flex-col font-sans text-gray-800">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl border border-gray-50 flex flex-col items-center max-w-lg w-full text-center relative overflow-hidden">
          
          {/* Decor background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <CheckCircle className="text-green-600 w-12 h-12" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium">
            Tuyệt vời! Đơn hàng của bạn đã được tiếp nhận. <br/>
            BallHub sẽ sớm liên hệ để giao hàng đến bạn.
          </p>

          <div className="w-full space-y-3 mb-10">
            {/* Mã đơn hàng */}
            <div className="bg-gray-50 w-full rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Mã đơn hàng</span>
              <span className="text-xl font-black text-gray-900">HD{orderId}</span>
            </div>

            {/* Tổng thanh toán */}
            <div className="bg-green-50/50 w-full rounded-2xl p-5 border border-green-100 flex justify-between items-center">
              <span className="text-green-700 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={16}/> Tổng thanh toán
              </span>
              <span className="text-2xl font-black text-green-600">
                {loading ? <Loader2 className="animate-spin" size={20}/> : `${orderTotal?.toLocaleString()}đ`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1 h-14 rounded-2xl font-bold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>
            
            <Button
              onClick={() => router.push("/profile/orders")} 
              className="flex-1 h-14 rounded-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center justify-center"
            >
              Đơn hàng của tôi
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}