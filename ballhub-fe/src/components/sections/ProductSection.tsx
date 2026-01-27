import Link from 'next/link';
import { ProductCard } from './ProductCard';
import type { Product } from '@/data/products';

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
            Xem tất cả
            <span>→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-4 md:gap-6 ${
          featured
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={featured ? 'featured' : 'default'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
