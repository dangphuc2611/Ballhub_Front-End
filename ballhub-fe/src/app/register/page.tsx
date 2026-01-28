"use client";

import AuthForm from "@/components/login/AuthForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <>
      <Header />

      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
          <h1 className="text-2xl font-bold text-center mb-6">Đăng ký</h1>

          <AuthForm initialMode="register" onSuccess={() => router.push("/")} />

          <p className="text-center text-sm mt-4">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-green-600 underline cursor-pointer hover:text-green-700"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
