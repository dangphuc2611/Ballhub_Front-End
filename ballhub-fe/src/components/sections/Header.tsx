"use client";

import Link from "next/link";
import { Search, ShoppingCart, User as UserIcon, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/categories";
import { useAuth } from "@/app/context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-green-500">BallHub</span>
          </Link>

          {/* Menu điều hướng chính */}
          <nav className="hidden md:flex items-center gap-8 ml-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-green-500 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Ô tìm kiếm */}
          <div className="hidden lg:flex flex-1 mx-8 items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm cầu thủ, quần áo..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {/* Khu vực bên phải (Cart & Auth) */}
          <div className="flex items-center gap-3">
            
            {/* Giỏ hàng */}
            <Link href="/shoppingcart" className="relative p-2 hover:text-green-600 transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* PHẦN PHÂN QUYỀN VÀ USER */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Nút Admin - Chỉ hiện nếu Role là ADMIN */}
                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-orange-600 bg-orange-50 hover:bg-orange-100 gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden xl:inline">Quản trị</span>
                    </Button>
                  </Link>
                )}

                {/* Profile Link */}
                <Link href="/profile" className="flex items-center gap-2 p-2 hover:text-green-600 transition">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </Link>

                {/* Nút Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-600"
                  onClick={logout}
                  title="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              /* Chưa đăng nhập */
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-green-600">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-green-500 text-white hover:bg-green-600 shadow-sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}