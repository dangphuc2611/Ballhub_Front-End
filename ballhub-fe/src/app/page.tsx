'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/sections/Header';
import { HeroBanner } from '@/components/sections/HeroBanner';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { ProductSection } from '@/components/sections/ProductSection';
import { PromoBanner } from '@/components/sections/PromoBanner';
import { Footer } from '@/components/sections/Footer';
import { categories } from '@/data/categories';
import type { Product } from '@/types/product';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  async function fetchProducts(keyword?: string) {
    try {
      setLoading(true);

      // ✅ backend có thể là keyword hoặc search
      // bạn chọn 1 cái đúng với backend của bạn
      const url =
        keyword && keyword.length > 0
          ? `http://localhost:8080/api/products?keyword=${encodeURIComponent(
              keyword
            )}&page=0&size=8`
          : `http://localhost:8080/api/products?page=0&size=8`;

      const res = await fetch(url);

      if (!res.ok) throw new Error('Fetch products failed');

      const json = await res.json();

      const mapped: Product[] = json.data.content.map((item: any) => ({
        id: String(item.productId),
        name: item.productName,
        price: item.minPrice,
        image: item.mainImage
          ? `http://localhost:8080${item.mainImage}`
          : '/no-image.png',
        category: item.categoryName,
        badge: 'MỚI'
      }));

      setProducts(mapped);
    } catch (err) {
      console.error('❌ Lỗi load product:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  // load lần đầu
  useEffect(() => {
    fetchProducts();
  }, []);

  // search theo keyword
  useEffect(() => {
    fetchProducts(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // demo: chia ra 2 section (new + best)
  const newProducts = useMemo(() => products, [products]);
  const bestProducts = useMemo(() => products, [products]);

  return (
    <main className="w-full min-h-screen bg-white">
      <Header />

      <HeroBanner
        title="BallHub – Áo bóng đá chính hãng"
        description="Hữu giai mới – Ưu đãi lên đến 30% cho các mẫu áo đấu mới nhất."
        primaryButtonText="Mua ngay"
        secondaryButtonText="Xem khuyến mãi"
        primaryButtonHref="/products"
        secondaryButtonHref="/promotions"
      />

      <CategoryGrid categories={categories} />

      {/* ================= PRODUCTS ================= */}
      {loading ? (
        <div className="w-full min-h-[40vh] flex items-center justify-center text-xl font-semibold">
          Đang tải sản phẩm...
        </div>
      ) : products.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-600">
            Không tìm thấy sản phẩm nào.
          </div>
        </div>
      ) : (
        <>
          <ProductSection
            title="Sản phẩm mới"
            products={newProducts}
            viewAllHref="/products?sort=newest"
          />

          <PromoBanner
            badge="Ưu Đãi Có Hạn"
            title="ƯU ĐÃI HÈ RỰC RỠ"
            description="Áp dụng đến hết 30/9/2024"
            discount="30%"
            buttonText="Xem thêm"
            buttonHref="/promotions"
          />

          <ProductSection
            title="Bán chạy nhất"
            products={bestProducts}
            viewAllHref="/products?sort=popular"
          />
        </>
      )}

      <Footer />
    </main>
  );
}
