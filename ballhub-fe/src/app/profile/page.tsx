import ProfileForm from "@/components/account/ProfileForm";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { User, Package, RotateCcw, Heart, LogOut } from "lucide-react";

export default function AccountPage() {
  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10 bg-[#f6f9f8]">
        {/* breadcrumb */}
        <p className="text-sm text-gray-500 mb-6">
          Trang chủ <span className="mx-1">›</span> Tài khoản của tôi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white rounded-2xl p-5 space-y-4 h-fit">
            {/* user box */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Nguyễn Văn A</p>
                <p className="text-xs text-green-600">Thành viên Bạc</p>
              </div>
            </div>

            {/* menu */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 font-medium cursor-pointer">
                <User size={16} /> Thông tin cá nhân
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer">
                <Package size={16} /> Đơn hàng của tôi
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer">
                <RotateCcw size={16} /> Yêu cầu đổi trả
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer">
                <Heart size={16} /> Sản phẩm yêu thích
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer text-sm">
                <LogOut size={16} /> Đăng xuất
              </div>
            </div>
          </aside>

          {/* CONTENT */}
          <section className="md:col-span-3 space-y-8">
            <ProfileForm />

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Đơn hàng gần đây</h3>
                <span className="text-sm text-green-600 cursor-pointer">
                  Xem tất cả
                </span>
              </div>

              <div className="grid grid-cols-5 text-xs text-gray-500 border-b pb-2 mb-3">
                <div>MÃ ĐƠN</div>
                <div>NGÀY ĐẶT</div>
                <div>TỔNG TIỀN</div>
                <div>TRẠNG THÁI</div>
                <div>HÀNH ĐỘNG</div>
              </div>

              {[
                ["#BH-78291", "24/10/2023", "1.250.000đ", "Chờ xử lý", "yellow"],
                ["#BH-78245", "20/10/2023", "450.000đ", "Đang giao", "blue"],
                ["#BH-77890", "15/10/2023", "3.200.000đ", "Đã giao", "green"],
                ["#BH-76543", "10/09/2023", "890.000đ", "Đã hủy", "gray"],
              ].map((o, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 text-sm items-center py-2 border-b last:border-none"
                >
                  <div>{o[0]}</div>
                  <div>{o[1]}</div>
                  <div className="font-medium">{o[2]}</div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs bg-${o[4]}-100 text-${o[4]}-600`}
                    >
                      {o[3]}
                    </span>
                  </div>
                  <div className="text-green-600 cursor-pointer text-sm">
                    Xem chi tiết
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
