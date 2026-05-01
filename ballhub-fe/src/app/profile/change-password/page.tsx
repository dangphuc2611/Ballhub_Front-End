"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { User as UserIcon, Package, Heart, LogOut, MapPin, KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/cartApi"; // Sử dụng axios instance có sẵn auth token
import { getImageUrl } from "@/config/env";



export default function ChangePasswordPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Toggle Visibility State
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    toast.success("Đăng xuất thành công");
    router.push("/login");
  };

  const getAvatarUrl = (path: string | undefined) => getImageUrl(path);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      return toast.error("Vui lòng điền đầy đủ các trường mật khẩu!");
    }
    if (formData.newPassword.length < 6) {
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Mật khẩu mới và Nhập lại mật khẩu không khớp!");
    }
    if (formData.oldPassword === formData.newPassword) {
      return toast.error("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
    }

    setIsSubmitting(true);
    try {
      await api.put("/users/me/password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      // ✅ BÁO THÀNH CÔNG VÀ TỰ ĐỘNG ĐĂNG XUẤT SAU 1.5 GIÂY
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      
      setTimeout(() => {
          logout();
          router.push("/login");
      }, 1500); 
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ!");
    } finally {
      setIsSubmitting(false);
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
        <p className="text-sm text-gray-500 mb-6">Trang chủ <span className="mx-1">›</span> Tài khoản của tôi</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="bg-white rounded-2xl p-5 space-y-4 h-fit border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border border-green-200">
                {user?.avatar ? ( <img src={getAvatarUrl(user.avatar) || ""} className="w-full h-full object-cover" alt="avatar" /> ) : ( <UserIcon className="text-green-600" size={24} /> )}
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
              <div className="mb-8 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
                <p className="text-sm text-gray-500 mt-1">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                
                {/* Mật khẩu hiện tại */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showOld ? "text" : "password"} 
                      placeholder="Nhập mật khẩu hiện tại"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mật khẩu mới <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showNew ? "text" : "password"} 
                      placeholder="Nhập mật khẩu mới (Tối thiểu 6 ký tự)"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Nhập lại mật khẩu mới */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      placeholder="Nhập lại mật khẩu mới"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-10 py-3.5 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : null}
                    Cập nhật mật khẩu
                  </button>
                </div>

              </form>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng xuất?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Bạn có chắc chắn muốn rời khỏi hệ thống <span className="font-bold text-gray-900">BallHub</span> không?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Ở lại</button>
              <button onClick={confirmLogout} className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100">Đăng xuất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}