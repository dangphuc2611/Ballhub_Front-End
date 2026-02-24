"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ProductCard } from "@/components/sections/ProductCard";
import { User, Package, Heart, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/lib/axios";
import type { Product } from "@/types/product";
import { usePathname, useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get("/favorites?page=0&size=20");
        const mapped: Product[] = (res.data.data.content ?? []).map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: Number(item.minPrice ?? 0),
          minOriginalPrice: item.minOriginalPrice,
          discountPercent: item.discountPercent,
          image: item.mainImage
            ? `http://localhost:8080/${item.mainImage.replace(/^\/+/, "")}`
            : "/placeholder.svg",
          category: item.categoryName,
          badge: item.brandName,
        }));
        setProducts(mapped);
      } catch (error) {
        console.error("Lỗi lấy danh sách yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  // HÀM XỬ LÝ: Khi thẻ ProductCard báo lên là "Đã bị hủy tim"
  const handleFavoriteToggle = (productId: string | number, isFavorited: boolean) => {
    if (!isFavorited) {
      // Lọc bỏ sản phẩm có ID này ra khỏi danh sách đang hiển thị
      setProducts((prevProducts) => prevProducts.filter(p => p.id !== productId));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getAvatarUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `http://localhost:8080${path}`;
  };

  const menuItems = [
    { name: "Thông tin cá nhân", icon: <User size={16} />, href: "/profile" },
    { name: "Đơn hàng của tôi", icon: <Package size={16} />, href: "/profile/orders" },
    { name: "Sản phẩm yêu thích", icon: <Heart size={16} />, href: "/profile/favorites" },
  ];

  if (!user && !loading) return <div className="text-center py-20 font-bold text-xl">Vui lòng đăng nhập để xem trang này!</div>;

  return (
    <div className="bg-[#f6f9f8] min-h-screen flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <p className="text-sm text-gray-500 mb-6">
          Trang chủ <span className="mx-1">›</span> Tài khoản của tôi <span className="mx-1">›</span> Sản phẩm yêu thích
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ================= SIDEBAR ================= */}
          <aside className="bg-white rounded-2xl p-5 space-y-4 h-fit border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200">
                {user?.avatar ? (
                  <img src={getAvatarUrl(user.avatar) || ""} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <User className="text-green-600" size={24} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">{user?.fullName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.phone}</p>
              </div>
            </div>

            <nav className="space-y-1 text-sm">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    pathname === item.href ? "bg-green-50 text-green-600" : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-red-500 hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </aside>

          {/* ================= CONTENT: YÊU THÍCH ================= */}
          <section className="md:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={24}/>
                Sản phẩm yêu thích
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                  <p className="text-sm text-gray-500">Đang tải danh sách...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
                  <Heart className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 mb-6 font-medium text-lg">Bạn chưa thả tim sản phẩm nào 😢</p>
                  <Link href="/products" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                    Khám phá ngay
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onFavoriteToggle={handleFavoriteToggle} // Truyền cái ống nghe xuống cho con
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}