"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(product.originalPrice)
    : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`❤️ Đã thêm "${product.name}" vào yêu thích`);
  };

  const handleGoToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all">
      {/* IMAGE */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />

          {/* CATEGORY */}
          {product.category && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 text-gray-800 shadow-sm backdrop-blur">
              {product.category}
            </div>
          )}

          {/* WISHLIST */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur hover:scale-105 transition"
            aria-label="Yêu thích"
          >
            <Heart className="w-5 h-5 text-gray-500 hover:text-red-500 transition" />
          </button>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-col gap-3 p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 min-h-[44px]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-extrabold text-blue-600">
              {formattedPrice}
            </p>
            {formattedOriginalPrice && (
              <p className="text-xs line-through text-gray-400 mt-0.5">
                {formattedOriginalPrice}
              </p>
            )}
          </div>

          {/* BADGE */}
          {product.badge && (
            <div className="px-2 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600">
              {product.badge}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/products/${product.id}`}
            className="h-11 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-1 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <Eye className="w-4 h-4" />
            Xem
          </Link>

          <button
            onClick={handleGoToDetail}
            className="h-11 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-1 hover:bg-blue-700 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Chọn
          </button>
        </div>
      </div>
    </div>
  );
}
