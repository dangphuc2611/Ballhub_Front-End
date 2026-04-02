"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { User, Package, Heart, LogOut, Loader2, Eye, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const BASE_URL = "http://localhost:8080";

interface OrderInfo {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  statusName: string;
  deliveryAddress?: string; 
  subTotal?: number;
  shippingFee?: number;
}

export default function OrdersPage() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ State cho Custom Modal Đăng xuất
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/orders?page=0&size=20`, {
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
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  // ✅ Hàm mở Modal xác nhận thay vì logout ngay
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // ✅ Hàm thực hiện đăng xuất thật sự
  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success("Đã đăng xuất thành công");
    router.push("/login");
  };

  const getAvatarUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `http://localhost:8080${path}`;
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return { label: "Chờ xử lý", classes: "bg-orange-100 text-orange-600" };
      case "CONFIRMED":
        return { label: "Đã xác nhận", classes: "bg-blue-100 text-blue-600" };
      case "SHIPPING":
        return { label: "Đang giao", classes: "bg-indigo-100 text-indigo-600" };
      case "DELIVERED":
        return { label: "Đã giao", classes: "bg-green-100 text-green-600" };
      case "CANCELLED":
        return { label: "Đã hủy", classes: "bg-gray-100 text-gray-600" };
      case "RETURNED":
        return { label: "Đã trả hàng", classes: "bg-red-100 text-red-600" };
      default:
        return { label: status || "Không rõ", classes: "bg-gray-100 text-gray-600" };
    }
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
          Trang chủ <span className="mx-1">›</span> Tài khoản của tôi <span className="mx-1">›</span> Đơn hàng của tôi
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
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-red-500 hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </aside>

          {/* ================= CONTENT: ĐƠN HÀNG ================= */}
          <section className="md:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="text-green-600" size={24}/>
                Đơn hàng của tôi
              </h2>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 text-xs font-bold text-gray-400 border-b pb-3 mb-3 uppercase tracking-wider min-w-[600px]">
                  <div>Mã đơn</div>
                  <div>Ngày đặt</div>
                  <div>Tổng tiền</div>
                  <div>Trạng thái</div>
                  <div>Hành động</div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                    <p className="text-sm text-gray-500">Đang tải danh sách...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
                    <Package className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 mb-6 font-medium text-lg">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/products" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  orders.map((o) => {
                    const statusConfig = getStatusDisplay(o.statusName);
                    const formattedDate = new Date(o.orderDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    });

                    // ✅ SỬA LỖI GIÁ TIỀN: Lấy trực tiếp totalAmount từ Backend
                    // Backend đã tính chuẩn: SubTotal - Discount + ShippingFee
                    const displayTotalAmount = o.totalAmount || 0;

                    return (
                      <div key={o.orderId} className="grid grid-cols-5 text-sm items-center py-4 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors min-w-[600px] rounded-lg px-2">
                        <div className="font-medium text-gray-900">#BH-{o.orderId}</div>
                        <div className="text-gray-600">{formattedDate}</div>
                        <div className="font-bold text-green-600">
                          {displayTotalAmount.toLocaleString()}đ
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig.classes}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div>
                          <Link 
                            href={`/profile/orders/${o.orderId}`}
                            className="inline-flex items-center gap-1 text-blue-600 font-semibold cursor-pointer hover:text-blue-800 text-sm transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                          >
                            <Eye size={14}/>
                            Xem chi tiết
                          </Link>
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
      {showLogoutConfirm && (
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
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
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