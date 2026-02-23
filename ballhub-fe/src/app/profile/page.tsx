"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import ProfileForm from "@/components/account/ProfileForm";
import { User as UserIcon, Package, RotateCcw, Heart, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8080";

interface OrderInfo {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  statusName: string;
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- HÀM XỬ LÝ URL ẢNH SIDEBAR (ĐÃ TỐI ƯU) ---
  const getAvatarUrl = (path: string | undefined) => {
    if (!path) return null;
    // Nếu là ảnh vừa chọn (blob) hoặc link đã có http thì trả về luôn
    if (path.startsWith("http") || path.startsWith("blob:")) {
        return path;
    }
    // Nếu là path tương đối từ server (/uploads/...) thì gắn thêm domain
    return `${BASE_URL}${path}`;
  };

  const handleLogout = () => {
    logout();
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
        const res = await fetch(`${BASE_URL}/api/orders?page=0&size=10`, {
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
        return { label: "Đã hủy", classes: "bg-red-100 text-red-600" };
      default:
        return { label: status || "Không rõ", classes: "bg-gray-100 text-gray-600" };
    }
  };

  return (
    <div className="bg-[#f6f9f8] min-h-screen flex flex-col">
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
                  <img
                    src={getAvatarUrl(user.avatar) || ""}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <UserIcon className="text-green-600" size={24} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate text-gray-900">
                  {user?.fullName || "Khách hàng"}
                </p>
                {user?.phone && (
                  <p className="text-[11px] text-gray-500 truncate">{user.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 font-medium cursor-pointer">
                <UserIcon size={16} /> Thông tin cá nhân
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer transition-colors">
                <Package size={16} /> Đơn hàng của tôi
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer transition-colors">
                <RotateCcw size={16} /> Yêu cầu đổi trả
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer transition-colors">
                <Heart size={16} /> Sản phẩm yêu thích
              </div>
            </div>

            <div className="pt-3 border-t">
              <div
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer text-sm font-bold transition-colors"
              >
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
                <span className="text-sm text-green-600 font-semibold cursor-pointer hover:underline">
                  Xem tất cả
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 text-xs font-bold text-gray-400 border-b pb-3 mb-3 uppercase tracking-wider min-w-[600px]">
                  <div>Mã đơn</div>
                  <div>Ngày đặt</div>
                  <div>Tổng tiền</div>
                  <div>Trạng thái</div>
                  <div>Hành động</div>
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="animate-spin text-green-600 mb-2" size={30} />
                    <p className="text-sm text-gray-500">Đang tải đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Bạn chưa có đơn hàng nào.
                  </div>
                ) : (
                  orders.map((o) => {
                    const statusConfig = getStatusDisplay(o.statusName);
                    const formattedDate = new Date(o.orderDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    });

                    return (
                      <div key={o.orderId} className="grid grid-cols-5 text-sm items-center py-4 border-b last:border-none hover:bg-gray-50 transition-colors min-w-[600px]">
                        <div className="font-medium text-gray-900">#BH-{o.orderId}</div>
                        <div className="text-gray-600">{formattedDate}</div>
                        <div className="font-bold text-gray-900">
                          {o.totalAmount?.toLocaleString()}đ
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig.classes}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div
                          className="text-green-600 font-semibold cursor-pointer hover:text-green-700 text-sm transition-colors"
                          // Đổi sang link trang chi tiết đơn hàng riêng
                          onClick={() => router.push(`/profile/orders/${o.orderId}`)}
                        >
                          Xem chi tiết
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
    </div>
  );
}