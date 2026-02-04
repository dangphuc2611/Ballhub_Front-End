"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && !isRedirecting) {
      router.replace("/"); 
    }
  }, [user, loading, router, isRedirecting]);

  if (loading) return null; 

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
          
          {/* Overlay hiển thị khi đang chuyển hướng */}
          {isRedirecting && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-2" />
              <p className="text-sm font-medium text-gray-600">Đang chuyển sang trang đăng nhập...</p>
            </div>
          )}

          <h1 className="text-2xl font-bold text-center mb-2">Tạo tài khoản</h1>
          <p className="text-gray-500 text-center text-sm mb-8">Gia nhập BallHub ngay hôm nay</p>

          <AuthForm 
            initialMode="register" 
            onSuccess={() => {
              setIsRedirecting(true);
              setTimeout(() => {
                router.push("/login?status=registered");
              }, 500);
            }} 
          />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium">Hoặc đăng ký bằng</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" /> Facebook
            </button>
          </div>

          <p className="text-center text-sm mt-8 text-gray-500">
            Đã có tài khoản? <Link href="/login" className="text-green-600 font-semibold hover:underline">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}