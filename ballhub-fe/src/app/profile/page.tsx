"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import ProfileForm from "@/components/account/ProfileForm";
import { User as UserIcon, Package, Heart, LogOut, Loader2, Eye, MapPin, KeyRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080";

interface OrderInfo {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  statusName: string;
  shippingFee?: number;
}

export default function AccountPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ✅ State điều khiển Custom Modal Đăng xuất
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const getAvatarUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${BASE_URL}${path}`;
  };

  // ✅ Hàm mở Modal khi bấm nút Đăng xuất
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // ✅ Hàm thực hiện đăng xuất thật sự
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success("Đăng xuất thành công");
    router.push("/login");
  };

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoadingOrders(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/orders?page=0&size=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const json = await res.json();
          setOrders(json.data?.content || []);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách đơn hàng:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyOrders();
  }, []);

  // ✅ ĐÃ SỬA: Bổ sung đầy đủ RETURNED và thêm viền (border) cho đẹp
  const getStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return { label: "Chờ xử lý", classes: "bg-orange-100 text-orange-600 border border-orange-200" };
      case "CONFIRMED": return { label: "Đã xác nhận", classes: "bg-blue-100 text-blue-600 border border-blue-200" };
      case "SHIPPING": return { label: "Đang giao", classes: "bg-indigo-100 text-indigo-600 border border-indigo-200" };
      case "DELIVERED": return { label: "Đã giao", classes: "bg-green-100 text-green-600 border border-green-200" };
      case "CANCELLED": return { label: "Đã hủy", classes: "bg-gray-100 text-gray-600 border border-gray-200" };
      case "RETURNED": return { label: "Đã trả hàng", classes: "bg-red-100 text-red-600 border border-red-200" };
      default: return { label: status || "Không rõ", classes: "bg-gray-100 text-gray-600 border border-gray-200" };
    }
  };

  const menuItems = [
    { name: "Thông tin cá nhân", icon: <UserIcon size={16} />, href: "/profile" },
    { name: "Sổ địa chỉ", icon: <MapPin size={16} />, href: "/profile/address" },
    { name: "Đơn hàng của tôi", icon: <Package size={16} />, href: "/profile/orders" },
    { name: "Sản phẩm yêu thích", icon: <Heart size={16} />, href: "/profile/favorites" },
    { name: "Đổi mật khẩu", icon: <KeyRound size={16} />, href: "/profile/change-password" },
  ];

  return (
    <div className="bg-[#f6f9f8] min-h-screen flex flex-col font-sans relative">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <p className="text-sm text-gray-500 mb-6">
          Trang chủ <span className="mx-1">›</span> Tài khoản của tôi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white rounded-2xl p-5 space-y-4 h-fit border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200">
                {user?.avatar ? (
                  <img src={getAvatarUrl(user.avatar) || ""} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <UserIcon className="text-green-600" size={24} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">{user?.fullName || "Khách hàng"}</p>
                {user?.phone && <p className="text-[11px] text-gray-500 truncate">{user.phone}</p>}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              {menuItems.map((item) => (
                <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${pathname === item.href ? "bg-green-50 text-green-600" : "hover:bg-gray-50 text-gray-600"}`}>
                  {item.icon} {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div onClick={handleLogoutClick} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer text-sm font-bold transition-colors">
                <LogOut size={16} /> Đăng xuất
              </div>
            </div>
          </aside>

          {/* CONTENT SECTION */}
          <section className="md:col-span-3 space-y-8">
            <ProfileForm />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Đơn hàng gần đây</h3>
                <Link href="/profile/orders" className="text-sm text-green-600 font-semibold cursor-pointer hover:underline">
                  Xem tất cả
                </Link>
              </div>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 text-xs font-bold text-gray-400 border-b pb-3 mb-3 uppercase tracking-wider min-w-[600px]">
                  <div>Mã đơn</div>
                  <div>Ngày đặt</div>
                  <div>Tổng cộng</div>
                  <div>Trạng thái</div>
                  <div>Hành động</div>
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="animate-spin text-green-600 mb-2" size={30} />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Bạn chưa có đơn hàng nào.
                  </div>
                ) : (
                  orders.map((o) => {
                    const statusConfig = getStatusDisplay(o.statusName);
                    return (
                      <div key={o.orderId} className="grid grid-cols-5 text-sm items-center py-4 border-b last:border-none hover:bg-gray-50 transition-colors min-w-[600px] px-2 rounded-lg">
                        <div className="font-medium text-gray-900">#BH-{o.orderId}</div>
                        <div className="text-gray-600">
                           {new Date(o.orderDate).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="font-bold text-green-600">
                          {o.totalAmount?.toLocaleString()}đ
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig.classes}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div
                          className="text-blue-600 font-semibold cursor-pointer hover:text-blue-800 text-sm transition-colors flex items-center gap-1"
                          onClick={() => router.push(`/profile/orders/${o.orderId}`)}
                        >
                          <Eye size={14} /> Xem chi tiết
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* ✅ CUSTOM MODAL XÁC NHẬN ĐĂNG XUẤT */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn rời khỏi hệ thống <span className="font-bold text-gray-900">BallHub</span> không?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Ở lại
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}