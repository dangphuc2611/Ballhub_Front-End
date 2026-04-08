"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Hiệu ứng đèn LED nền */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[32px] shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ShieldAlert size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cổng Quản Lý</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Dành riêng cho Ban Quản Lý BallHub</p>
        </div>

        {/* Ẩn bớt các nút Đăng nhập Google / Đăng ký nếu chúng nằm trong AuthForm */}
        <div className="admin-auth-wrapper">
          <AuthForm 
            initialMode="login" 
            onSuccess={(user) => {
              if (!user) return;
              // Kiểm tra nghiêm ngặt: Lấy nick Customer đăng nhập vào cổng Admin là đá ra ngay
              if (user.role !== "ADMIN") {
                toast.error("Tài khoản của bạn không có quyền Quản trị viên!");
                router.push("/");
              } else {
                toast.success("Xác thực quyền Admin thành công!");
                router.push("/admin");
              }
            }} 
          />
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại trang Khách hàng
          </Link>
        </div>
      </div>
    </div>
  );
}