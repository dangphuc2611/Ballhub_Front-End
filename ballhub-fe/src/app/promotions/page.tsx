"use client";

import Breadcrumb from "@/components/ui/breadcrumb";
import { ProductCardSkeleton } from "@/components/sections/ProductCardSkeleton";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ProductCard } from "@/components/sections/ProductCard";
import type { Product } from "@/types/product";

const BASE_URL = "http://localhost:8080";

// Tách nội dung chính ra để bọc Suspense (Fix triệt để lỗi Hydration liên quan đến URL Params)
function PromotionsContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search")?.trim() || "";

  const urlCategories = useMemo(() => {
    return searchParams
      .getAll("categories")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [searchParams]);

  const [sort, setSort] = useState<"new" | "price_asc" | "price_desc">("new");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 10000000]);
  const [usePriceFilter, setUsePriceFilter] = useState(false);
  const [applyKey, setApplyKey] = useState(0);

  useEffect(() => {
    if (urlCategories.length > 0) {
      setCategories(urlCategories);
      setPage(0);
    }
  }, [urlCategories]);

  const fetchProducts = async (pageIndex: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(pageIndex));
      params.append("size", "12");
      params.append("sort", sort);
      params.append("isSale", "true");

      categories.forEach((c) => params.append("categories", c));
      sizes.forEach((s) => params.append("sizes", s));
      brands.forEach((b) => params.append("teams", b));

      if (usePriceFilter) {
        params.append("minPrice", String(price[0]));
        params.append("maxPrice", String(price[1]));
      }
      if (keyword) params.append("search", keyword);

      const res = await fetch(`${BASE_URL}/api/products/filter?${params.toString()}`);
      const json = await res.json();

      const mapped: Product[] = (json?.data?.content ?? []).map((item: any) => ({
        id: item.productId,
        name: item.productName,
        price: Number(item.minPrice ?? 0),
        minOriginalPrice: item.minOriginalPrice,
        discountPercent: item.discountPercent,
        image: item.mainImage ? `${BASE_URL}/${item.mainImage.replace(/^\/+/, "")}` : "/no-image.png",
        category: item.categoryName,
        badge: item.brandName,
      }));

      setProducts(mapped);
      setTotalPages(json?.data?.totalPages ?? 0);
      setTotalElements(json?.data?.totalElements ?? 0);
    } catch (e) {
      console.error("❌ Load products error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, applyKey, sort, keyword]);

  const toggleItem = (value: string, list: string[], setList: any) => {
    setList((prev: string[]) => prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]);
  };

  // Hàm Format tiền tệ dùng Regex (đảm bảo Server và Client giống hệt nhau)
  const formatVND = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* SIDEBAR */}
      <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24 space-y-8">
        <div>
          <h2 className="font-bold text-lg mb-3">Danh mục</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-sm mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Áo đấu</p>
              {["Áo CLB", "Áo ĐTQG"].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm mb-2 cursor-pointer hover:text-blue-600 transition ml-1">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={categories.includes(item)} onChange={() => toggleItem(item, categories, setCategories)} />
                  {item}
                </label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-sm mb-2 text-gray-400 uppercase tracking-widest text-[10px]">Quần đấu</p>
              {["Quần CLB", "Quần ĐTQG"].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm mb-2 cursor-pointer hover:text-blue-600 transition ml-1">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={categories.includes(item)} onChange={() => toggleItem(item, categories, setCategories)} />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* PRICE FILTER */}
        <div>
          <h2 className="font-bold text-lg mb-3">Khoảng giá</h2>
          <input type="range" min={0} max={10000000} step={100000} value={price[1]}
            onChange={(e) => { setPrice([0, Number(e.target.value)]); setUsePriceFilter(true); }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs font-bold text-gray-500 mt-2">
            <span>0đ</span>
            {/* ✅ FIX HYDRATION 1: Thêm suppressHydrationWarning */}
            <span className="text-blue-600" suppressHydrationWarning>
              {formatVND(price[1])}
            </span>
          </div>
        </div>

        {/* SIZE */}
        <div>
          <h2 className="font-bold text-lg mb-4">Kích cỡ</h2>
          <div className="flex flex-wrap gap-2">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <button key={size} onClick={() => toggleItem(size, sizes, setSizes)}
                className={`w-10 h-10 rounded-xl border font-bold text-xs transition-all ${
                  sizes.includes(size) ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" : "bg-white text-gray-600 hover:border-blue-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <button onClick={() => { setPage(0); setApplyKey(k => k + 1); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            Áp dụng lọc
          </button>
          <button onClick={() => { setCategories([]); setSizes([]); setBrands([]); setPrice([0, 10000000]); setUsePriceFilter(false); setPage(0); setApplyKey(k => k + 1); }} className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
            Xóa tất cả
          </button>
        </div>
      </aside>

      {/* PRODUCT LIST */}
      <section className="lg:col-span-3">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm khuyến mãi" }]} />

        <div className="flex flex-wrap items-center justify-between gap-4 my-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            {keyword ? `Kết quả: "${keyword}"` : "Sản phẩm khuyến mãi"}
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {totalElements} sản phẩm
            </span>
          </h1>

          <select value={sort} onChange={(e) => { setSort(e.target.value as any); setPage(0); setApplyKey(k => k + 1); }}
            className="border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="new">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>

        {/* ACTIVE TAGS */}
        {(categories.length > 0 || sizes.length > 0 || usePriceFilter) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(c => <span key={c} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-2">{c}</span>)}
            {sizes.map(s => <span key={s} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold flex items-center gap-2">Size {s}</span>)}
            {/* ✅ FIX HYDRATION 2: Thêm suppressHydrationWarning */}
            {usePriceFilter && <span suppressHydrationWarning className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold tracking-tight">Dưới {formatVND(price[1])}</span>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-lg font-bold text-gray-400">Không tìm thấy sản phẩm nào phù hợp ☹️</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2.5 rounded-xl border hover:bg-gray-50 disabled:opacity-30 transition-all">←</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)} className={`w-11 h-11 rounded-xl font-bold transition-all ${page === i ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border hover:border-blue-500"}`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2.5 rounded-xl border hover:bg-gray-50 disabled:opacity-30 transition-all">→</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// COMPONENT CHÍNH: Dùng Suspense để bao bọc phần nội dung dùng useSearchParams
export default function PromotionsPage() {
  return (
    <main className="bg-[#F8F9FA] min-h-screen">
      <Header />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center font-bold text-gray-400 animate-pulse">
          Đang tải dữ liệu khuyến mãi...
        </div>
      }>
        <PromotionsContent />
      </Suspense>
      <Footer />
    </main>
  );
}