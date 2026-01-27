import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(product.price);

  if (variant === 'featured') {
    return (
      <Link href={`/products/${product.id}`} className="group">
        <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
              {product.badge}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square mb-4">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase">
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm md:text-base font-semibold text-gray-800 group-hover:text-green-500 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            <p className="text-base md:text-lg font-bold text-gray-900">
              {formattedPrice}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  minimumFractionDigits: 0
                }).format(product.originalPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
