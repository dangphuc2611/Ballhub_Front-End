"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type Mode = "login" | "register";

export default function AuthForm({
  onSuccess,
  initialMode = "login",
}: {
  onSuccess?: (user: any) => void;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";

      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              fullName: form.fullName,
              email: form.email,
              password: form.password,
              phone: form.phone,
            };

      const res = await api.post(url, payload);

      if (!res.data.success) {
        setError(res.data.message || "Thao tác thất bại");
        return;
      }

      const { accessToken, refreshToken, user } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      onSuccess?.(user);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <>
          <input
            name="fullName"
            placeholder="Họ tên"
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={handleChange}
          />
        </>
      )}

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        onChange={handleChange}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full bg-black text-white py-3 rounded
          hover:bg-gray-900 transition
          cursor-pointer
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {loading
          ? "Đang xử lý..."
          : mode === "login"
          ? "Đăng nhập"
          : "Đăng ký"}
      </button>
    </form>
  );
}
