"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Đảm bảo bạn có import api

interface User {
  userId: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  avatar?: string;
  phone?: string; 
}

interface AuthContextType {
  user: User | null;
  login: (userData: any) => void;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>; // <-- Thêm hàm này
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm làm mới dữ liệu từ Database
  const refreshUser = async () => {
    try {
      const res = await api.get("/users/me");
      if (res.data.success) {
        const freshData = res.data.data;
        // Chuẩn hóa link avatar trước khi lưu
        if (freshData.avatar && !freshData.avatar.startsWith('http')) {
          freshData.avatar = `http://localhost:8080${freshData.avatar}`;
        }
        updateUser(freshData);
      }
    } catch (err) {
      console.error("Không thể refresh user", err);
    }
  };

  const login = (data: any) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    // Lưu ý: Nhớ nhắc Backend trả về avatar trong API Login
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};