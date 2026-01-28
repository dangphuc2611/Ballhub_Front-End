"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center py-20 bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>

        <AuthForm initialMode="login" onSuccess={() => router.push("/")} />

        <p className="text-center text-sm mt-4">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-green-600 underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
