"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, Info, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

import { API_BASE_URL, getImageUrl } from "@/config/env";

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // ✅ State cho Custom Modal Xác nhận cập nhật
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { updateUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/users/me").then((res) => {
      if (res.data.success) {
        setProfile(res.data.data);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toast.error("Không thể tải thông tin người dùng");
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatar: previewUrl });
  };

  // ✅ Hàm này giờ chỉ làm nhiệm vụ MỞ MODAL
  const handleOpenConfirm = () => {
    if (!profile.fullName?.trim()) return toast.error("Họ tên không được để trống");
    if (!profile.phone?.trim()) return toast.error("Số điện thoại không được để trống");

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(profile.phone)) {
      return toast.error("Số điện thoại không hợp lệ (Phải bắt đầu bằng 0 và có 10 chữ số)");
    }

    setShowConfirmModal(true);
  };

  // ✅ Hàm THỰC HIỆN CẬP NHẬT thật sự
  const handleActualUpdate = async () => {
    setShowConfirmModal(false);
    setUpdating(true);
    try {
      // BƯỚC A: Cập nhật thông tin văn bản
      await api.put("/users/me", {
        fullName: profile.fullName,
        phone: profile.phone,
      });

      // BƯỚC B: Upload Ảnh
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post("/users/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      const refreshRes = await api.get("/users/me");
      
      if (refreshRes.data.success) {
        const newUserInfo = refreshRes.data.data;
        const finalAvatarUrl = getImageUrl(newUserInfo.avatar);
        
        const finalUserObj = { ...newUserInfo, avatar: finalAvatarUrl };
        setProfile(finalUserObj); 
        updateUser(finalUserObj); 
        if (refreshUser) await refreshUser();

        toast.success("Đã cập nhật hồ sơ thành công! ❤️");
        setSelectedFile(null); 
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const renderAvatar = () => {
    if (!profile?.avatar) {
        return <div className="bg-green-50 w-full h-full flex items-center justify-center"><ImageIcon className="text-green-200" size={48} /></div>;
    }
    const src = getImageUrl(profile.avatar);
    return (
      <img 
        src={src} 
        className="w-full h-full object-cover" 
        alt="Avatar người dùng"
        onError={(e) => { (e.target as HTMLImageElement).src = "https://www.w3schools.com/howto/img_avatar.png"; }}
      />
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin text-green-500 mb-2" size={40} />
        <p className="text-gray-500 text-sm">Đang lấy thông tin hồ sơ...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500">Quản lý thông tin để bảo mật tài khoản và đồng bộ BallHub</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Họ và tên</label>
              <input
                value={profile?.fullName || ""}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Nhập họ tên đầy đủ"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</label>
              <input
                value={profile?.phone || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ""); // Chỉ cho phép nhập số
                  if (val.length <= 10) {
                    setProfile({ ...profile, phone: val });
                  }
                }}
                placeholder="Số điện thoại liên hệ"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email (Không thể thay đổi)</label>
            <input disabled value={profile?.email || ""} className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed font-medium" />
          </div>

          <Button 
            onClick={handleOpenConfirm} // ✅ Đổi sang hàm mở Modal
            disabled={updating} 
            className="bg-green-500 hover:bg-green-600 text-white px-10 h-12 rounded-xl font-bold shadow-md shadow-green-100 transition-all active:scale-95"
          >
            {updating ? <Loader2 className="animate-spin mr-2" /> : "Lưu thay đổi"}
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-100">
                {renderAvatar()}
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-bold">Thay đổi ảnh</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 text-gray-700 transition-all">Chọn ảnh từ máy</button>
          <p className="text-[11px] text-gray-400 text-center px-4">Dụng lượng file tối đa 2MB. <br/> Định dạng: .JPEG, .PNG</p>
        </div>
      </div>

      {/* ✅ CUSTOM MODAL XÁC NHẬN CẬP NHẬT HỒ SƠ */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cập nhật hồ sơ?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn thay đổi thông tin cá nhân hiện tại không?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleActualUpdate}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
              >
                Xác nhận lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}