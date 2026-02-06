"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/categories";
import { useAuth } from "@/app/context/AuthContext";
import type { SuggestProduct } from "@/types/product";

type HeaderProps = {
  showSearch?: boolean;
};

const BASE_URL = "http://localhost:8080";
const MAX_CACHE_KEYS = 30;

export function Header({ showSearch = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const cartCount = 0;

  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestProduct[]>([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ CACHE: key = keyword, value = list suggestions
  const suggestCacheRef = useRef<Map<string, SuggestProduct[]>>(new Map());

  const handleSearch = () => {
    const q = keyword.trim();
    if (!q) return;

    setOpenSuggest(false);
    setActiveIndex(-1);

    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const goToProduct = (id: number) => {
    setOpenSuggest(false);
    setActiveIndex(-1);
    router.push(`/products/${id}`);
  };

  const formatPrice = (v: number) => {
    try {
      return v.toLocaleString("vi-VN") + "đ";
    } catch {
      return v + "đ";
    }
  };

  // ✅ FETCH SUGGESTIONS (debounce + cache)
  useEffect(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) {
      setSuggestions([]);
      setOpenSuggest(false);
      setActiveIndex(-1);
      return;
    }

    // ✅ If cached -> use instantly
    if (suggestCacheRef.current.has(q)) {
      setSuggestions(suggestCacheRef.current.get(q) ?? []);
      setOpenSuggest(true);
      setActiveIndex(-1);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoadingSuggest(true);

        const params = new URLSearchParams();
        params.append("search", q);
        params.append("page", "0");
        params.append("size", "6");
        params.append("sort", "new");

        const res = await fetch(
          `${BASE_URL}/api/products/filter?${params.toString()}`
        );

        const json = await res.json();

        const items: SuggestProduct[] = (json?.data?.content ?? []).map(
          (p: any) => ({
            productId: p.productId,
            productName: p.productName,
            brandName: p.brandName,
            categoryName: p.categoryName,
            mainImage: p.mainImage,
            minPrice: Number(p.minPrice ?? 0),
          })
        );

        // ✅ Save cache
        suggestCacheRef.current.set(q, items);

        // ✅ Limit cache size (keep latest)
        if (suggestCacheRef.current.size > MAX_CACHE_KEYS) {
          const firstKey = suggestCacheRef.current.keys().next().value;
          if (firstKey) suggestCacheRef.current.delete(firstKey);
        }

        setSuggestions(items);
        setOpenSuggest(true);
        setActiveIndex(-1);
      } catch (e) {
        console.error("❌ Suggest error:", e);
        setSuggestions([]);
        setOpenSuggest(false);
      } finally {
        setLoadingSuggest(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [keyword]);

  // ✅ CLOSE WHEN CLICK OUTSIDE
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpenSuggest(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

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
                className="text-sm font-medium text-gray-700 hover:text-green-500 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          {showSearch && (
            <div
              ref={wrapRef}
              className="hidden lg:flex flex-1 mx-8 items-center gap-2 relative"
            >
              {/* Input Box */}
              <div className="flex flex-1 items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-gray-500" />

                <input
                  ref={inputRef}
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setOpenSuggest(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (activeIndex >= 0 && suggestions[activeIndex]) {
                        goToProduct(suggestions[activeIndex].productId);
                      } else {
                        handleSearch();
                      }
                    }

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpenSuggest(true);
                      setActiveIndex((prev) =>
                        Math.min(prev + 1, suggestions.length - 1)
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((prev) => Math.max(prev - 1, -1));
                    }

                    if (e.key === "Escape") {
                      setOpenSuggest(false);
                      setActiveIndex(-1);
                    }
                  }}
                  placeholder="Tìm sản phẩm..."
                  className="flex-1 bg-transparent text-sm outline-none"
                />

                <button
                  onClick={handleSearch}
                  className="text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  Tìm
                </button>
              </div>

              {/* Dropdown */}
              {openSuggest && keyword.trim() && (
                <div className="absolute top-[52px] left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">
                  {/* Loading */}
                  {loadingSuggest && (
                    <div className="p-4 text-sm text-gray-500">
                      Đang tìm...
                    </div>
                  )}

                  {/* Empty */}
                  {!loadingSuggest && suggestions.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">
                      Không có sản phẩm phù hợp
                    </div>
                  )}

                  {/* Items */}
                  {!loadingSuggest && suggestions.length > 0 && (
                    <div className="max-h-[360px] overflow-auto">
                      {suggestions.map((p, idx) => {
                        const img = p.mainImage
                          ? `${BASE_URL}/${p.mainImage.replace(/^\/+/, "")}`
                          : "/no-image.png";

                        const active = idx === activeIndex;

                        return (
                          <button
                            key={p.productId}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => goToProduct(p.productId)}
                            className={`w-full flex items-center gap-3 p-3 text-left transition ${
                              active ? "bg-green-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={p.productName}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {p.productName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {p.brandName} • {p.categoryName}
                              </div>
                            </div>

                            <div className="text-sm font-bold text-green-600">
                              {formatPrice(p.minPrice)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  {!loadingSuggest && suggestions.length > 0 && (
                    <div className="border-t border-gray-100 p-2">
                      <button
                        onClick={handleSearch}
                        className="w-full text-sm font-semibold text-green-700 hover:bg-green-50 rounded-xl py-2 transition"
                      >
                        Xem tất cả kết quả cho “{keyword.trim()}”
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link
              href="/shoppingcart"
              className="relative p-2 hover:text-green-600 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className="text-orange-600 bg-orange-50 hover:bg-orange-100 gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden xl:inline">Quản trị</span>
                    </Button>
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 hover:text-green-600 transition"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </Link>

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
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-green-600"
                  >
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
