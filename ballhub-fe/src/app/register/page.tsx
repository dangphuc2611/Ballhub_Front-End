"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && user && !isRedirecting) {
      router.replace("/"); 
    }
  }, [user, loading, router, isRedirecting]);

  // Logic Đăng nhập/Đăng ký nhanh bằng Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsProcessing(true);
      try {
        const res = await api.post("/auth/google-login", {
          token: tokenResponse.access_token,
        });

        if (res.data && res.data.success) {
          login(res.data.data);
          toast.success("Đăng nhập Google thành công!");
          router.push("/");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi kết nối với Google");
      } finally {
        setIsProcessing(false);
      }
    },
    onError: () => toast.error("Không thể kết nối với Google"),
  });

  // ✅ FIX HYDRATION: Đảm bảo layout ngoài cùng khớp nhau
  if (loading || user) return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
         <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
      <Footer />
    </>
  ); 

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          
          {/* Overlay hiển thị khi đang chuyển hướng */}
          {isRedirecting && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-2" />
              <p className="text-sm font-bold text-gray-700">Đang tạo tài khoản...</p>
            </div>
          )}

          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">B</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">Tạo tài khoản</h1>
          <p className="text-gray-500 text-center text-sm mb-8 font-medium">Gia nhập BallHub ngay hôm nay</p>

          <AuthForm 
            initialMode="register" 
            onSuccess={() => {
              setIsRedirecting(true);
              setTimeout(() => {
                router.push("/login?status=registered");
              }, 1000);
            }} 
          />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-4 text-gray-400">Hoặc tiếp tục với</span>
            </div>
          </div>

          {/* NÚT GOOGLE FULL CHIỀU RỘNG */}
          <button 
            onClick={() => handleGoogleLogin()}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-sm text-gray-700 disabled:opacity-50 shadow-sm"
          >
            {isProcessing ? (
               <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            )}
            Đăng ký bằng Google
          </button>

          <p className="text-center text-sm mt-8 text-gray-600">
            Đã có tài khoản? <Link href="/login" className="text-green-600 font-bold hover:underline">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}