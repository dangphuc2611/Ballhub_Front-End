"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, Suspense, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/axios";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isRegistered = searchParams.get("status") === "registered";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

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
        toast.error(err.response?.data?.message || "Đăng nhập Google thất bại");
      } finally {
        setIsProcessing(false);
      }
    },
    onError: () => toast.error("Không thể kết nối với Google"),
  });

  // ✅ FIX HYDRATION: Đồng bộ thẻ div ngoài cùng cho trạng thái Loading
  if (authLoading || user) return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        {isRegistered && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Đăng ký thành công! Mời bạn đăng nhập.</p>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-2xl">B</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Đăng nhập BallHub</h1>

        <AuthForm 
          initialMode="login" 
          onSuccess={() => {
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
          }} 
        />

        <div className="flex justify-end mt-3">
          <Link href="/forgot-password" className="text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
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
          Đăng nhập bằng Google
        </button>

        <p className="text-center text-sm mt-8 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-green-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}