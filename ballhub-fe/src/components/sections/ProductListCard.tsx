"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { ProductBadge } from "@/components/ui/product-badge";
import type { Product } from "@/data/products-listing";

interface ProductListCardProps {
  product: Product;
}

export function ProductListCard({ product }: ProductListCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Product Image Container */}
      <div className="relative h-64 bg-neutral-100 overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Badge */}
        {product.badge && product.badgeLabel && (
          <ProductBadge type={product.badge} label={product.badgeLabel} />
        )}

        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-neutral-50 transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Team Info */}
        <p className="text-xs text-neutral-500 mb-3">{product.team}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-neutral-300"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-neutral-500">({product.rating})</span>
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 px-3 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors">
            Chi tiết
          </button>
          <button className="py-2 px-3 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
