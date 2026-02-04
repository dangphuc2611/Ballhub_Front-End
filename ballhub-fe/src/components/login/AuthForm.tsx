"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/app/context/AuthContext";

type Mode = "login" | "register";

export default function AuthForm({
  onSuccess,
  initialMode = "login",
}: {
  onSuccess?: (user: any) => void;
  initialMode?: Mode;
}) {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" 
        ? { email: form.email, password: form.password }
        : form;

      const res = await api.post(url, payload);

      if (res.data && res.data.success) {
        const authData = res.data.data;

        if (mode === "login") {
          login(authData); 
          onSuccess?.(authData.user);
        } else {
          onSuccess?.(null); 
        }
      
      } else {
        setError(res.data?.message || "Thông tin không chính xác");
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <input
            name="fullName"
            placeholder="Họ tên"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
            onChange={handleChange}
          />
        </div>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
        onChange={handleChange}
        required
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg animate-in fade-in zoom-in duration-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
      </button>
    </form>
  );
}