"use client";

import AuthForm from "./AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterView() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left banner */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-400 text-white p-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">Gia nhập BallHub 🚀</h1>
          <p className="text-lg opacity-90">
            Tạo tài khoản để nhận ưu đãi và mua sắm nhanh hơn.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <AuthForm
            initialMode="register"
            onSuccess={() => router.push("/")}
          />

          <p className="text-center text-sm mt-4">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-green-600 underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
