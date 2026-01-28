"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function LoginPage() {
  const router = useRouter();

  return (
    <>
      <Header />

      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>

          <AuthForm initialMode="login" onSuccess={() => router.push("/")} />

          <p className="text-center text-sm mt-4">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-green-600 underline cursor-pointer hover:text-green-700"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
