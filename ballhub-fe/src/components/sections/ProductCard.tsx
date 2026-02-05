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
    minimumFractionDigits: 0
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0
      }).format(product.originalPrice)
    : null;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`❤️ Đã thêm "${product.name}" vào yêu thích`);
  };

  // Logic: Chuyển hướng để chọn biến thể (Size/Màu)
  const handleGoToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="group flex flex-col h-full bg-white rounded-xl p-3 hover:-translate-y-1 hover:shadow-xl border border-gray-100 relative transition">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition"
          />
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
          >
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </Link>

      <div className="flex-1 flex flex-col px-1 pt-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 h-10">
          {product.name}
        </h3>

        <div className="mt-2 mb-3">
          <p className="text-lg font-bold">{formattedPrice}</p>
          {formattedOriginalPrice && (
            <p className="text-sm line-through text-gray-400">
              {formattedOriginalPrice}
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex items-center justify-center gap-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
          >
            <Eye className="w-4 h-4" />
            Chi tiết
          </Link>

          <button
            onClick={handleGoToDetail}
            className="flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}