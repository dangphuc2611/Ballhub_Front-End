"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  
  const rawId = params?.id;
  const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

  return (
    <div className="bg-[#F8F9FA] min-h-screen flex flex-col font-sans text-gray-800">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-lg w-full text-center">
          
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="text-green-600 w-12 h-12" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Cảm ơn bạn đã mua sắm tại BallHub. Đơn hàng của bạn đang được hệ thống xử lý và sẽ sớm được giao đến bạn.
          </p>

        
          <div className="bg-gray-50 w-full rounded-2xl p-6 mb-10 border border-gray-100 flex justify-between items-center">
            <span className="text-gray-500 font-medium">Mã đơn hàng:</span>
            <span className="text-2xl font-black text-green-600">#{orderId}</span>
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1 h-14 rounded-2xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Tiếp tục mua sắm
            </Button>
            
            <Button
              onClick={() => router.push("/profile")} 
              className="flex-1 h-14 rounded-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 transition-transform active:scale-95"
            >
              Xem đơn hàng
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}