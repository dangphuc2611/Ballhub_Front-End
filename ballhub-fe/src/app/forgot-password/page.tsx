"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, KeyRound } from "lucide-react";
import api from "@/lib/axios";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Quản lý bước: 1 = Nhập Email, 2 = Nhập OTP + Mật khẩu mới
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // BƯỚC 1: GỬI MÃ OTP VÀO EMAIL
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập Email hoặc Số điện thoại!");

    setIsSubmitting(true);
    try {
      // ⚠️ GỌI API BACKEND ĐỂ GỬI MAIL (Bạn cần viết API này ở Spring Boot)
      await api.post("/auth/forgot-password", { email });
      
      toast.success("Mã xác nhận đã được gửi! Vui lòng kiểm tra hộp thư.");
      setStep(2); // Chuyển sang form nhập OTP
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tài khoản không tồn tại trên hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // BƯỚC 2: XÁC NHẬN OTP & ĐỔI MẬT KHẨU
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      return toast.error("Vui lòng điền đầy đủ thông tin!");
    }
    if (newPassword.length < 6) return toast.error("Mật khẩu phải từ 6 ký tự trở lên!");
    if (newPassword !== confirmPassword) return toast.error("Mật khẩu nhập lại không khớp!");

    setIsSubmitting(true);
    try {
      // ⚠️ GỌI API BACKEND ĐỂ ĐẶT LẠI MẬT KHẨU
      await api.post("/auth/reset-password", { 
        email, 
        otp, 
        newPassword 
      });
      
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-128px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <KeyRound className="text-white w-6 h-6" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            {step === 1 
              ? "Nhập email của bạn để nhận mã xác nhận" 
              : `Mã xác nhận đã được gửi đến ${email}`}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
            
            {/* ================= FORM BƯỚC 1 ================= */}
            {step === 1 && (
              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text" placeholder="Nhập Email hoặc Số điện thoại đăng ký" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none transition-all disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : null} Nhận mã xác nhận
                </button>
              </form>
            )}

            {/* ================= FORM BƯỚC 2 ================= */}
            {step === 2 && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <input
                    type="text" placeholder="Nhập mã OTP (6 số)" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center text-lg tracking-[0.5em] font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none transition-all disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : null} Đặt lại mật khẩu
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}