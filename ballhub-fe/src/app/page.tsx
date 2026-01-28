import { Header } from "@/components/sections/Header";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ProductSection } from "@/components/sections/ProductSection";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { Footer } from "@/components/sections/Footer";
import { categories } from "@/data/categories";
import { newProducts, bestsellingProducts } from "@/data/products";
import AuthForm from "@/components/auth/AuthForm";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Banner */}
      <HeroBanner
        title="BallHub – Áo bóng đá chính hãng"
        description="Hữu giai mới – Ưu đãi liên đến 30% cho các mẫu áo đấu mới nhất."
        primaryButtonText="Mua ngay"
        secondaryButtonText="Xem khuyến mãi"
        primaryButtonHref="/products"
        secondaryButtonHref="/promotions"
      />

      {/* Category Section */}
      <CategoryGrid categories={categories} />

      {/* New Products Section */}
      <ProductSection
        title="Sản phẩm mới"
        products={newProducts}
        viewAllHref="/products?sort=newest"
      />

      {/* Promo Banner */}
      <PromoBanner
        badge="Ưu Đãi Có Hạn"
        title="ƯU ĐÃI HÈ RỰC RỠ"
        description="Áp dụng đến hạng 30/9/2024"
        discount="30%"
        buttonText="Xem thêm"
        buttonHref="/promotions"
      />

      {/* Bestselling Products Section */}
      <ProductSection
        title="Bán chạy nhất"
        products={bestsellingProducts}
        viewAllHref="/products?sort=popular"
      />

      {/* Footer */}
      <Footer />
    </main>
  );
}

