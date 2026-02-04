"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  const isRegistered = searchParams.get("status") === "registered";

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (user) return null;

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {isRegistered && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Đăng ký thành công! Mời bạn đăng nhập vào hệ thống.</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập BallHub</h1>

        <AuthForm 
          initialMode="login" 
          onSuccess={() => {
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
          }} 
        />

        <div className="flex justify-end mt-2">
          <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-green-600">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Hoặc đăng nhập bằng</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-sm text-gray-700">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-sm text-gray-700">
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
            Facebook
          </button>
        </div>

        <p className="text-center text-sm mt-8 text-gray-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-green-600 font-semibold hover:underline">
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
      <Suspense fallback={<div className="min-h-screen" />}>
        <LoginContent />
      </Suspense>
      <Footer />
    </>
  );
}