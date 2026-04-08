"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react"; // Thêm icon khiên

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 px-4 min-h-screen">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
        <h1 className="text-2xl font-black text-center mb-6 text-gray-800">Đăng nhập BallHub</h1>

        <AuthForm 
          initialMode="login" 
          onSuccess={(user) => {
            if (!user) return;
            if (user.role === "ADMIN") {
              router.push("/admin");
            } else {
              router.push("/");
            }
          }} 
        />

        <p className="text-center text-sm mt-6 text-gray-500 font-medium">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-emerald-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
        
        {/* NÚT CHUYỂN SANG CỔNG ADMIN */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
          <Link 
            href="/admin-login" 
            className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-gray-400 hover:text-emerald-600 transition-colors uppercase"
          >
            <ShieldCheck size={14} /> Cổng Quản Trị Viên
          </Link>
        </div>
      </div>
    </div>
  );
}