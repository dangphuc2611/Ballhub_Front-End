"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { User as UserIcon, Package, Heart, LogOut, Loader2, MapPin, Plus, Trash2, CheckCircle2, KeyRound } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/cartApi"; // Tái sử dụng api config của bạn
import { getImageUrl } from "@/config/env";


const GHN_TOKEN = "dd94ceb1-2e67-11f1-b97a-a2781b0fd428"; 

export default function AddressPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ fullName: "", phone: "", street: "" });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProv, setSelectedProv] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => { refreshUser(); fetchAddresses(); }, []);

  // API GIAO HÀNG NHANH
  useEffect(() => {
    fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", { headers: { "token": GHN_TOKEN } })
      .then(res => res.json()).then(data => setProvinces(data.data || []));
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/addresses/me");
      const data = res.data.data || res.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout(); setShowLogoutModal(false); toast.success("Đăng xuất thành công"); router.push("/login");
  };

  const getAvatarUrl = (path: string | undefined) => getImageUrl(path);

  // HÀM THÊM ĐỊA CHỈ MỚI
  const handleSaveAddress = async () => {
    if (!formData.fullName || !formData.phone || !selectedProv || !selectedDist || !selectedWard || !formData.street) {
      return toast.error("Vui lòng điền đầy đủ thông tin!");
    }
    setIsSubmitting(true);
    try {
      const pName = provinces.find(p => p.ProvinceID.toString() === selectedProv)?.ProvinceName || "";
      const dName = districts.find(d => d.DistrictID.toString() === selectedDist)?.DistrictName || "";
      const wName = wards.find(w => w.WardCode.toString() === selectedWard)?.WardName || "";
      const fullAddressString = `${formData.street}, ${wName}, ${dName}, ${pName}`;

      await api.post("/addresses/me", {
        fullName: formData.fullName,
        phone: formData.phone,
        fullAddress: fullAddressString,
        isDefault: addresses.length === 0
      });

      toast.success("Thêm địa chỉ thành công!");
      setIsModalOpen(false);
      setFormData({ fullName: "", phone: "", street: "" });
      setSelectedProv(""); setSelectedDist(""); setSelectedWard("");
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu địa chỉ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if(!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await api.delete(`/addresses/me/${id}`);
      toast.success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch (error) { toast.error("Lỗi khi xóa địa chỉ"); }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/addresses/me/${id}/default`);
      toast.success("Đã đặt làm mặc định");
      fetchAddresses();
    } catch (error) { toast.error("Lỗi khi thiết lập mặc định"); }
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Địa chỉ của tôi</h2>
                  <p className="text-sm text-gray-500 mt-1">Quản lý thông tin giao hàng để thanh toán nhanh hơn</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm">
                  <Plus size={18} /> Thêm địa chỉ mới
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-500" size={30} /></div>
              ) : addresses.length === 0 ? (
                <div className="text-center text-gray-500 py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                  Bạn chưa có địa chỉ nào được lưu.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.addressId || addr.id} className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${addr.isDefault ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{addr.fullName || user?.fullName}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-600">{addr.phone || user?.phone}</span>
                          </div>
                          {addr.isDefault && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">Mặc định</span>}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed min-h-[40px]">{addr.fullAddress}</p>
                      </div>
                      
                      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr.addressId || addr.id)} className="text-sm font-semibold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                            Thiết lập mặc định
                          </button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr.addressId || addr.id)} className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                          <Trash2 size={16}/> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* MODAL THÊM ĐỊA CHỈ (Chuẩn thiết kế) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-900">Thêm địa chỉ mới</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Họ và tên *</label>
                  <input type="text" placeholder="Nhập họ và tên" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại *</label>
                  <input type="text" placeholder="Nhập số điện thoại" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm outline-none w-full"
                    value={selectedProv} onChange={(e) => {
                        const val = e.target.value; setSelectedProv(val); setSelectedDist(""); setWards([]); setSelectedWard("");
                        fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${val}`, { headers: { "token": GHN_TOKEN } }).then(res => res.json()).then(data => setDistricts(data.data || []));
                    }}>
                    <option value="">Tỉnh/Thành phố</option>
                    {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                </select>
                <select className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm outline-none w-full disabled:opacity-50"
                    disabled={!selectedProv} value={selectedDist} onChange={(e) => {
                        const val = e.target.value; setSelectedDist(val); setSelectedWard("");
                        fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${val}`, { headers: { "token": GHN_TOKEN } }).then(res => res.json()).then(data => setWards(data.data || []));
                    }}>
                    <option value="">Quận/Huyện</option>
                    {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                </select>
                <select className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm outline-none w-full disabled:opacity-50"
                    disabled={!selectedDist} value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
                    <option value="">Phường/Xã</option>
                    {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ cụ thể *</label>
                 <input type="text" placeholder="Số nhà, tên đường..." value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
               <button onClick={handleSaveAddress} disabled={isSubmitting} className="px-8 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-100 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} Hoàn tất
               </button>
            </div>
          </div>
        </div>
      )}

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