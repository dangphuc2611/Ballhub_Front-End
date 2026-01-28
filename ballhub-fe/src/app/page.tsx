'use client';

import { useEffect, useState } from "react";
import { Header } from "@/components/sections/Header";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ProductSection } from "@/components/sections/ProductSection";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { Footer } from "@/components/sections/Footer";
import { categories } from "@/data/categories";
import type { Product } from "@/types/product";

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestProducts, setBestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/products?page=0&size=8");

        if (!res.ok) throw new Error("Fetch products failed");

        const json = await res.json();

        const mapped: Product[] = json.data.content.map((item: any) => ({
          id: String(item.productId),
          name: item.productName,
          price: item.minPrice,
          image: `http://localhost:8080${item.mainImage}`,
          category: item.categoryName,
          badge: "MỚI", // tạm
        }));

        setNewProducts(mapped);
        setBestProducts(mapped); 
      } catch (err) {
        console.error("❌ Lỗi load product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-xl font-semibold">
        Đang tải sản phẩm...
      </div>
    );
  }

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

      <ProductSection
        title="Sản phẩm mới"
        products={newProducts}
        viewAllHref="/products?sort=newest"
      />

      <PromoBanner
        badge="Ưu đãi cỏ hạt"
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

      <Footer />
    </main>
  );
}
