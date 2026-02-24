"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/lib/axios";
import type { Product } from "@/types/product";

const BASE_URL = "http://localhost:8080";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
  // ✅ Đã fix TypeScript: Chỉ định rõ productId là số (number) và isFavorited là boolean
  onFavoriteToggle?: (productId: number, isFavorited: boolean) => void;
}

export function ProductCard({ product, variant, onFavoriteToggle }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth(); // Lấy thông tin user đăng nhập

  // STATE: Quản lý trạng thái thả tim
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // 1. Format Giá
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(product.minPrice || product.price || 0);

  const isFlashSale = (product.discountPercent || 0) > 0;
  
  const formattedOriginalPrice = isFlashSale && product.minOriginalPrice
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(product.minOriginalPrice)
    : null;

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg";
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  };

  const productId = product.productId || product.id;

  // 2. KIỂM TRA TRẠNG THÁI TIM (khi load trang)
  useEffect(() => {
    if (user && productId) {
      api.get(`/favorites/${productId}/check`)
        .then(res => setIsFavorited(res.data.data))
        .catch(err => console.log("Lỗi check favorite:", err));
    }
  }, [user, productId]);

  // 3. XỬ LÝ KHI BẤM NÚT TIM
  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn click nhầm vào thẻ Link ở dưới

    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
      router.push("/login"); // Điều hướng tới trang đăng nhập
      return;
    }

    setLoadingFav(true);
    try {
      const res = await api.post(`/favorites/${productId}/toggle`);
      if (res.data.success) {
        const newStatus = Boolean(res.data.data); // Ép kiểu về true/false
        setIsFavorited(newStatus); 
        
        // ✅ Gọi hàm callback báo cáo cho Component Cha (Đã fix lỗi TypeScript)
        if (onFavoriteToggle && productId) {
          onFavoriteToggle(Number(productId), newStatus);
        }

        if (newStatus) {
          toast.success(`❤️ Đã thêm "${product.productName || product.name}" vào yêu thích`);
        } else {
          toast.info(`🤍 Đã bỏ "${product.productName || product.name}" khỏi yêu thích`);
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoadingFav(false);
    }
  };

  const handleGoToDetail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${productId}`);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all">
      {/* IMAGE */}
      <Link href={`/products/${productId}`} className="block">
        <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-white">
          <Image
            src={getFullImageUrl(product.mainImage || product.image || "")}
            alt={product.productName || product.name || "Sản phẩm"}
            fill
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />

          {/* NHÃN FLASH SALE (-XX%) */}
          {isFlashSale && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-br-2xl text-[12px] font-black bg-red-600 text-white shadow-md z-10">
              GIẢM {product.discountPercent}%
            </div>
          )}

          {/* CATEGORY */}
          {!isFlashSale && (product.categoryName || product.category) && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 text-gray-800 shadow-sm backdrop-blur">
              {product.categoryName || product.category}
            </div>
          )}

          {/* WISHLIST BUTTON */}
          <button
            onClick={handleWishlist}
            disabled={loadingFav}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur hover:scale-105 transition"
            aria-label="Yêu thích"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorited 
                  ? "fill-red-500 text-red-500" // Khi đã thả tim -> Tim đỏ chót
                  : "text-gray-500 hover:text-red-500" // Khi chưa thả tim -> Tim xám rỗng
              }`} 
            />
          </button>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-col gap-3 p-4">
        <Link href={`/products/${productId}`}>
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 min-h-[44px]">
            {product.productName || product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className={`text-xl font-extrabold ${isFlashSale ? 'text-red-600' : 'text-blue-600'}`}>
              {formattedPrice}
            </p>
            {formattedOriginalPrice && (
              <p className="text-xs line-through text-gray-400 mt-0.5 font-medium">
                {formattedOriginalPrice}
              </p>
            )}
          </div>

          {/* BADGE KHÁC */}
          {product.badge && (
            <div className="px-2 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600">
              {product.badge}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/products/${productId}`}
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