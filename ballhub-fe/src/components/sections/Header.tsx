"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/categories";
import { useEffect, useState } from "react";

export function Header() {
  const [user, setUser] = useState<any>(null);


  const cartCount = 0;

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

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

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-8 ml-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-green-500 transition cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden lg:flex flex-1 mx-8 items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm cầu thủ, quần áo..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/shoppingcart"
              className="relative p-2 hover:text-green-600 transition cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User icon */}
            <Link
              href={user ? "/profile" : "/login"}
              className="p-2 hover:text-green-600 transition cursor-pointer"
            >
              <User className="w-5 h-5" />
            </Link>

            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-green-600 font-medium">
                  {user.fullName}
                </span>

                <Button
                  variant="outline"
                  className="
                    border-red-500 text-red-500
                    hover:bg-red-50 hover:text-red-600
                    transition cursor-pointer
                  "
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="
                      border-green-500 text-green-600
                      hover:bg-green-50 hover:text-green-700
                      transition cursor-pointer
                    "
                  >
                    Đăng nhập
                  </Button>
                </Link>

                <Link href="/register">
                  <Button
                    className="
                      bg-green-500 text-white
                      hover:bg-green-600
                      active:scale-95
                      transition cursor-pointer
                    "
                  >
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
