"use client";

import Link from "next/link";
import { Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/categories";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-green-500">BallHub</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 ml-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-green-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 mx-8 items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm cầu thủ lọc, quần áo..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <button className="relative p-2 text-gray-700 hover:text-green-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* User Icon */}
            <button className="p-2 text-gray-700 hover:text-green-500 transition-colors">
              <User className="w-5 h-5" />
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden sm:inline-flex text-xs sm:text-sm border-green-500 text-green-500 hover:bg-green-50 bg-transparent"
              >
                Đăng nhập
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
