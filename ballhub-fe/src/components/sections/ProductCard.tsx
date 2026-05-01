"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/lib/axios";
import { getImageUrl } from "@/config/env";
import { Product } from "@/types/product/product";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
  onFavoriteToggle?: (productId: number, isFavorited: boolean) => void;
}

export function ProductCard({ product, variant, onFavoriteToggle }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // ✅ FORMAT TIỀN TỆ: Đảm bảo server và client hiển thị đồng nhất
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const currentPrice = product.minPrice || product.price || 0;
  const originalPrice = product.minOriginalPrice || 0;
  const discountPercent = product.discountPercent || 0;
  const isSale = discountPercent > 0;

  const getFullImageUrl = (url: string) => getImageUrl(url);

  const productId = product.productId || product.id;

  useEffect(() => {
    if (user && productId) {
      api.get(`/favorites/${productId}/check`)
        .then(res => setIsFavorited(res.data.data))
        .catch(err => console.log("Lỗi check favorite:", err));
    }
  }, [user, productId]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
      router.push("/login"); return;
    }
    setLoadingFav(true);
    try {
      const res = await api.post(`/favorites/${productId}/toggle`);
      if (res.data.success) {
        const newStatus = Boolean(res.data.data);
        setIsFavorited(newStatus); 
        if (onFavoriteToggle && productId) onFavoriteToggle(Number(productId), newStatus);
        if (newStatus) toast.success(`❤️ Đã thêm "${product.productName || product.name}" vào yêu thích`);
        else toast.info(`🤍 Đã bỏ khỏi yêu thích`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoadingFav(false);
    }
  };

  const handleGoToDetail = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    router.push(`/products/${productId}`);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      
      {/* IMAGE SECTION */}
      <div className="relative aspect-[4/5] bg-gray-50/50 overflow-hidden">
        <Link href={`/products/${productId}`} className="absolute inset-0 z-0">
          <Image
            src={getFullImageUrl(product.mainImage || product.image || "")}
            alt={product.productName || product.name || "Sản phẩm"}
            fill
            priority // ✅ THÊM ĐÚNG CHỮ NÀY LÀ HẾT BÁO VÀNG LCP
            className="object-contain p-8 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
        </Link>

        {/* OVERLAY ACTIONS */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out flex gap-2 z-20">
          <button onClick={handleGoToDetail} className="flex-1 h-12 rounded-xl bg-white text-gray-900 font-bold shadow-lg hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors">
            <Eye size={18} /> Xem
          </button>
          <button onClick={handleGoToDetail} className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
            <ShoppingBag size={18} /> Chọn
          </button>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>

        {/* BADGES */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
          {isSale && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-lg animate-pulse">
              -{discountPercent}%
            </span>
          )}
          {product.badge && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-green-500 text-white shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          onClick={handleWishlist} disabled={loadingFav}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 transition-transform z-20"
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </button>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col gap-2 p-6">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {product.categoryName || product.category || "BallHub Item"}
        </span>

        <Link href={`/products/${productId}`}>
          <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors min-h-[44px]">
            {product.productName || product.name}
          </h3>
        </Link>

        {/* PRICE - ✅ Thêm suppressHydrationWarning */}
        <div className="flex items-baseline gap-2.5 mt-2" suppressHydrationWarning>
          <p className="text-xl font-black text-blue-600">
            {formatVND(currentPrice)}
          </p>
          {isSale && originalPrice > currentPrice && (
            <p className="text-xs line-through text-gray-300 font-bold">
              {formatVND(originalPrice)}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}