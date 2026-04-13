import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Wallet, CreditCard } from "lucide-react";

export default function PaymentGuidePage() {
  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center">
          Hướng dẫn thanh toán
        </h1>
        <p className="text-center text-slate-500 mb-10">BallHub cung cấp các phương thức thanh toán an toàn, tiện lợi nhất cho bạn.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thanh toán COD */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Wallet size={100} />
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
              <Wallet size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3 relative z-10">Thanh toán khi nhận hàng (COD)</h2>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Quý khách sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng ngay sau khi nhận và kiểm tra sản phẩm. Phương thức này áp dụng cho mọi đơn hàng trên toàn quốc.
            </p>
          </div>

          {/* Thanh toán VNPay */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <CreditCard size={100} />
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 relative z-10">
              <CreditCard size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3 relative z-10">Thanh toán qua VNPay</h2>
            <p className="text-slate-600 text-sm leading-relaxed relative z-10">
              Thanh toán an toàn, bảo mật thông qua cổng VNPay. Hỗ trợ quét mã QR bằng ứng dụng Mobile Banking của hầu hết các ngân hàng tại Việt Nam, hoặc nhập thẻ ATM/Visa/Mastercard.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}