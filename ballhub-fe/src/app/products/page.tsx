'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ProductCard } from "@/components/sections/ProductCard";
import type { Product } from "@/types/product";

export default function ProductsPage() {

    // ================= SORT =================
    const [sort, setSort] = useState<"new" | "price_asc" | "price_desc">("new");

    // ================= DATA =================
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    // ================= FILTER =================
    const [categories, setCategories] = useState<string[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [price, setPrice] = useState<[number, number]>([0, 10000000]);
    const [usePriceFilter, setUsePriceFilter] = useState(false);

    const [applyKey, setApplyKey] = useState(0);

    // ================= FETCH =================
    const fetchProducts = async (pageIndex: number) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", String(pageIndex));
            params.append("size", "12");
            params.append("sort", sort);

            categories.forEach(c => params.append("categories", c));
            sizes.forEach(s => params.append("sizes", s));
            brands.forEach(b => params.append("teams", b));

            if (usePriceFilter) {
                params.append("minPrice", String(price[0]));
                params.append("maxPrice", String(price[1]));
            }

            const res = await fetch(
                `http://localhost:8080/api/products/filter?${params.toString()}`
            );

            const json = await res.json();

            const mapped: Product[] = json.data.content.map((item: any) => ({
                id: String(item.productId),
                name: item.productName,
                price: item.minPrice,
                image: item.mainImage
                    ? `http://localhost:8080/${item.mainImage.replace(/^\/+/, "")}`
                    : "/no-image.png",
                category: item.categoryName
            }));

            setProducts(mapped);
            setTotalPages(json.data.totalPages);

        } catch (e) {
            console.error("❌ Load products error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, [page, applyKey, sort]);

    // ================= ACTION =================
    const toggleItem = (value: string, list: string[], setList: any) => {
        setList((prev: string[]) =>
            prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
        );
    };

    const applyFilter = () => {
        setPage(0);
        setApplyKey(k => k + 1);
    };

    const clearFilter = () => {
        setCategories([]);
        setSizes([]);
        setBrands([]);
        setPrice([0, 10000000]);
        setUsePriceFilter(false);
        setPage(0);
        setApplyKey(k => k + 1);
    };

    // ================= UI =================
    return (
        <main className="bg-gray-50 min-h-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* ================= SIDEBAR ================= */}
                <aside className="bg-white rounded-2xl shadow p-6 h-fit sticky top-24 space-y-8">

                    {/* CATEGORY TREE */}
                    <div>
                        <h2 className="font-bold text-lg mb-3">Danh mục</h2>

                        <div className="space-y-3">

                            <div>
                                <p className="font-semibold text-sm mb-2">Áo đấu</p>
                                {["Áo CLB", "Áo ĐTQG"].map(item => (
                                    <label key={item} className="flex items-center gap-2 text-sm mb-2 cursor-pointer ml-3">
                                        <input
                                            type="checkbox"
                                            checked={categories.includes(item)}
                                            onChange={() => toggleItem(item, categories, setCategories)}
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>

                            <div>
                                <p className="font-semibold text-sm mb-2">Giày bóng đá</p>
                                {["Giày sân cỏ nhân tạo"].map(item => (
                                    <label key={item} className="flex items-center gap-2 text-sm mb-2 cursor-pointer ml-3">
                                        <input
                                            type="checkbox"
                                            checked={categories.includes(item)}
                                            onChange={() => toggleItem(item, categories, setCategories)}
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* PRICE */}
                    <div>
                        <h2 className="font-bold text-lg mb-3">Khoảng giá</h2>
                        <input
                            type="range"
                            min={0}
                            max={10000000}
                            step={50000}
                            value={price[1]}
                            onChange={(e) => {
                                setPrice([0, Number(e.target.value)]);
                                setUsePriceFilter(true);
                            }}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0đ</span>
                            <span>{price[1].toLocaleString()}đ</span>
                        </div>
                    </div>

                    {/* SIZE */}
                    <div className="space-y-5">

                        {/* SIZE ÁO */}
                        <div>
                            <h2 className="font-bold text-lg mb-3">Size áo</h2>
                            <div className="flex flex-wrap gap-2">
                                {["S", "M", "L", "XL", "XXL"].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleItem(size, sizes, setSizes)}
                                        className={`px-3 py-1 rounded-lg border text-sm transition
                                                ${sizes.includes(size)
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "hover:border-blue-500 hover:text-blue-600"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SIZE GIÀY */}
                        <div>
                            <h2 className="font-bold text-lg mb-3">Kích cỡ giày</h2>
                            <div className="flex flex-wrap gap-2">
                                {["39", "40", "41", "42", "43", "44"].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleItem(size, sizes, setSizes)}
                                        className={`px-3 py-1 rounded-lg border text-sm transition
                                                ${sizes.includes(size)
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "hover:border-blue-500 hover:text-blue-600"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>


                    {/* BRAND */}
                    <div>
                        <h2 className="font-bold text-lg mb-3">Thương hiệu</h2>
                        {["Nike", "Adidas", "Puma", "Kamito"].map(brand => (
                            <label key={brand} className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={brands.includes(brand)}
                                    onChange={() => toggleItem(brand, brands, setBrands)}
                                />
                                {brand}
                            </label>
                        ))}
                    </div>

                    {/* BUTTON */}
                    <div className="space-y-2">
                        <button
                            onClick={applyFilter}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            Áp dụng lọc
                        </button>

                        <button
                            onClick={clearFilter}
                            className="w-full border py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>

                </aside>

                {/* ================= PRODUCT LIST ================= */}
                <section className="lg:col-span-3">

                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Tất cả sản phẩm</h1>

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value as any);
                                setPage(0);
                            }}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="new">Mới nhất</option>
                            <option value="price_asc">Giá tăng dần</option>
                            <option value="price_desc">Giá giảm dần</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 font-semibold">
                            Đang tải sản phẩm...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 font-semibold text-gray-500">
                            Không có sản phẩm phù hợp
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* PAGINATION */}
                            {/* PAGINATION */}
                            <div className="flex justify-center items-center mt-12 gap-2 flex-wrap">

                                {/* PREVIOUS */}
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition
                                            ${page === 0
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                        }`}
                                >
                                    ← Trước
                                </button>

                                {/* PAGE NUMBER */}
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i)}
                                        className={`w-9 h-9 rounded-lg border text-sm font-semibold transition
                                                ${page === i
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "hover:bg-blue-50 hover:border-blue-400"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                {/* NEXT */}
                                <button
                                    disabled={page === totalPages - 1 || totalPages === 0}
                                    onClick={() => setPage(p => p + 1)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition
                                            ${(page === totalPages - 1 || totalPages === 0)
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                        }`}
                                >
                                    Sau →
                                </button>

                            </div>
                        </>
                    )}
                </section>
            </div>

            <Footer />
        </main>
    );
}
