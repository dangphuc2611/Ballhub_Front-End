"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import ProfileForm from "@/components/account/ProfileForm";
import { User, Package, RotateCcw, Heart, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 bg-[#f6f9f8]">
        {/* breadcrumb */}
        <p className="text-sm text-gray-500 mb-6">
          Trang chủ <span className="mx-1">›</span> Tài khoản của tôi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR - Hiển thị thông tin từ AuthContext */}
          <aside className="bg-white rounded-2xl p-5 space-y-4 h-fit border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <User className="text-green-600" size={24} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user?.fullName || "Khách hàng"}
                </p>
                <p className="text-xs text-green-600 font-medium">Thành viên Bạc</p>
              </div>
            </div>

            {/* menu */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 font-medium cursor-pointer">
                <User size={16} /> Thông tin cá nhân
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
            {/* 1. Phần Form Hồ sơ (Tách riêng component) */}
            <ProfileForm />

            {/* 2. Recent Orders (Giữ nguyên như thiết kế ban đầu) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800">Đơn hàng gần đây</h3>
                <span className="text-sm text-green-600 font-semibold cursor-pointer hover:underline">
                  Xem tất cả
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 text-xs font-bold text-gray-400 border-b pb-3 mb-3 uppercase tracking-wider">
                  <div>Mã đơn</div>
                  <div>Ngày đặt</div>
                  <div>Tổng tiền</div>
                  <div>Trạng thái</div>
                  <div>Hành động</div>
                </div>

                {[
                  ["#BH-78291", "24/10/2023", "1.250.000đ", "Chờ xử lý", "orange"],
                  ["#BH-78245", "20/10/2023", "450.000đ", "Đang giao", "blue"],
                  ["#BH-77890", "15/10/2023", "3.200.000đ", "Đã giao", "green"],
                  ["#BH-76543", "10/09/2023", "890.000đ", "Đã hủy", "gray"],
                ].map((o, i) => (
                  <div key={i} className="grid grid-cols-5 text-sm items-center py-4 border-b last:border-none hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-900">{o[0]}</div>
                    <div className="text-gray-600">{o[1]}</div>
                    <div className="font-bold text-gray-900">{o[2]}</div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-${o[4]}-100 text-${o[4]}-600`}>
                        {o[3]}
                      </span>
                    </div>
                    <div className="text-green-600 font-semibold cursor-pointer hover:text-green-700 text-sm">
                      Xem chi tiết
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}