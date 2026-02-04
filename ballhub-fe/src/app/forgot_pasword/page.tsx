"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Gửi yêu cầu reset cho email:", email);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setIsSent(true);
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          {!isSent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quên mật khẩu?</h1>
                <p className="text-gray-500 text-sm mt-2">
                  Nhập email của bạn, chúng tôi sẽ gửi mã xác nhận để khôi phục tài khoản.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    Email tài khoản
                  </label>
                  <input 
                    required 
                    type="email" 
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none transition-all
                             focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white text-gray-900"
                  />
                </div>
                
                <Button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                >
                  {isLoading ? "Đang xử lý..." : "Gửi mã xác nhận"}
                </Button>
              </form>
            </>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Kiểm tra email!</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <br />
                <span className="font-bold text-gray-700">{email}</span>
              </p>
              <Button 
                onClick={() => setIsSent(false)} 
                variant="outline" 
                className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50"
              >
                Gửi lại email khác
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button 
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition mx-auto"
            >
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}