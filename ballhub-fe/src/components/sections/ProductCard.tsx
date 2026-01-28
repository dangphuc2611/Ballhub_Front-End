import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
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

  const WishlistButton = (
    <button
      onClick={(e) => {
        e.preventDefault();
        console.log("WISHLIST:", product);
        alert("❤️ Đã thêm vào yêu thích");
      }}
      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow 
                 opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition"
    >
      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition" />
    </button>
  );

  // ================= FEATURED =================
  if (variant === "featured") {
    return (
      <div className="group flex flex-col h-full bg-white rounded-xl p-3 transition-all hover:-translate-y-1 hover:shadow-xl">

        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl overflow-hidden">

            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition" />

            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />

            {product.badge && (
              <span className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                {product.badge}
              </span>
            )}

            {WishlistButton}
          </div>
        </Link>

        <div className="flex-1 flex flex-col px-1 pt-3">
          <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-green-600 transition">
            {product.name}
          </h3>

          <div className="mt-2 mb-3">
            <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
            {formattedOriginalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {formattedOriginalPrice}
              </p>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex items-center justify-center gap-1.5 text-sm font-semibold 
                         border border-blue-600 text-blue-600 py-2 rounded-lg 
                         hover:bg-blue-600 hover:text-white transition"
            >
              <Eye className="w-4 h-4" />
              Chi tiết
            </Link>

            <button
              onClick={() => {
                console.log("ADD TO CART:", product);
                alert(`🛒 Đã thêm vào giỏ: ${product.name}`);
              }}
              className="flex items-center justify-center gap-1.5 text-sm font-semibold 
                         bg-blue-600 text-white py-2 rounded-lg 
                         hover:bg-blue-700 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= DEFAULT =================
  return (
    <div className="group flex flex-col h-full bg-white rounded-xl p-3 transition-all hover:-translate-y-1 hover:shadow-xl">

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl overflow-hidden">

          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition" />

          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            unoptimized
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />

          {product.badge && (
            <span className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold uppercase">
              {product.badge}
            </span>
          )}

          {WishlistButton}
        </div>
      </Link>

      <div className="flex-1 flex flex-col px-1 pt-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-green-600 transition">
          {product.name}
        </h3>

        <div className="mt-2 mb-3">
          <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
          {formattedOriginalPrice && (
            <p className="text-sm text-gray-500 line-through">
              {formattedOriginalPrice}
            </p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold 
                       border border-blue-600 text-blue-600 py-2 rounded-lg 
                       hover:bg-blue-600 hover:text-white transition"
          >
            <Eye className="w-4 h-4" />
            Chi tiết
          </Link>

          <button
            onClick={() => {
              console.log("ADD TO CART:", product);
              alert(`🛒 Đã thêm vào giỏ: ${product.name}`);
            }}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold 
                       bg-blue-600 text-white py-2 rounded-lg 
                       hover:bg-blue-700 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
