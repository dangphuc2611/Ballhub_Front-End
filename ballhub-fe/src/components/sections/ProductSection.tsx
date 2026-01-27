import Link from 'next/link';
import type { Product } from '@/data/products';
import ProductSlider from './ProductSlider';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  featured?: boolean;
}

export function ProductSection({
  title,
  products,
  viewAllHref = '#',
  featured = false
}: ProductSectionProps) {

  const homeProducts = products.slice(0, 8); // ✅ chỉ lấy 8

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <Link
            href={viewAllHref}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base inline-flex items-center gap-2"
          >
            Xem tất cả <span>→</span>
          </Link>
        </div>

        {/* Slider */}
        <ProductSlider
          products={homeProducts}
          featured={featured}
        />

      </div>
    </section>
  );
}
