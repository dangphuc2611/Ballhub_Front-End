"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

// Cấu hình domain Backend của bạn
const BASE_URL = "http://localhost:8080";

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Lấy hàm updateUser và refreshUser (nếu bạn đã thêm vào Context ở bước trước)
  const { updateUser, refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Tải dữ liệu ban đầu
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

  // 2. Xử lý chọn ảnh (Preview local)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Kiểm tra kích thước (ví dụ < 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB");
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatar: previewUrl });
  };

  // 3. Hàm cập nhật tổng thể
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // BƯỚC A: Cập nhật thông tin văn bản
      await api.put("/users/me", {
        fullName: profile.fullName,
        phone: profile.phone,
      });

      // BƯỚC B: Upload Ảnh (nếu có chọn ảnh mới)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post("/users/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // BƯỚC C: Đồng bộ hóa dữ liệu (Rất quan trọng)
      // Đợi 300ms để đảm bảo Server đã xử lý xong file
      await new Promise(resolve => setTimeout(resolve, 300));

      const refreshRes = await api.get("/users/me");
      
      if (refreshRes.data.success) {
        const newUserInfo = refreshRes.data.data;
        
        // BƯỚC D: Chuẩn hóa link Avatar trước khi đẩy vào Context
        let finalAvatarUrl = newUserInfo.avatar;
        if (finalAvatarUrl && !finalAvatarUrl.startsWith('http') && !finalAvatarUrl.startsWith('blob:')) {
            finalAvatarUrl = `${BASE_URL}${finalAvatarUrl.startsWith('/') ? '' : '/'}${finalAvatarUrl}`;
        }
        
        const finalUserObj = {
            ...newUserInfo,
            avatar: finalAvatarUrl
        };

        // Cập nhật State tại chỗ và Context toàn hệ thống
        setProfile(finalUserObj); 
        updateUser(finalUserObj); 
        
        // Nếu Context của bạn có hàm refreshUser riêng, hãy gọi nó
        if (refreshUser) await refreshUser();

        toast.success("Đã cập nhật hồ sơ thành công! ❤️");
        setSelectedFile(null); 
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(errorMsg);
      console.error("Update Error:", error);
    } finally {
      setUpdating(false);
    }
  };

  // 4. Helper hiển thị Avatar chuẩn
  const renderAvatar = () => {
    if (!profile?.avatar) {
        return <div className="bg-green-50 w-full h-full flex items-center justify-center"><ImageIcon className="text-green-200" size={48} /></div>;
    }

    let src = profile.avatar;
    // Fix link nếu là path tương đối từ server
    if (!src.startsWith("blob:") && !src.startsWith("http")) {
      src = `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
    }

    return (
      <img 
        src={src} 
        className="w-full h-full object-cover" 
        alt="Avatar người dùng"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://www.w3schools.com/howto/img_avatar.png"; 
        }}
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
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500">Quản lý thông tin để bảo mật tài khoản và đồng bộ BallHub</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* CỘT TRÁI: NHẬP LIỆU */}
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
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Số điện thoại liên hệ"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email (Không thể thay đổi)</label>
            <input 
                disabled 
                value={profile?.email || ""} 
                className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed font-medium" 
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={updating} 
            className="bg-green-500 hover:bg-green-600 text-white px-10 h-12 rounded-xl font-bold shadow-md shadow-green-100 transition-all active:scale-95"
          >
            {updating ? <Loader2 className="animate-spin mr-2" /> : "Lưu thay đổi"}
          </Button>
        </div>

        {/* CỘT PHẢI: AVATAR */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-100">
                {renderAvatar()}
            </div>
            {/* Overlay khi hover vào ảnh */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
                <span className="text-white text-xs font-bold">Thay đổi ảnh</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 text-gray-700 transition-all"
          >
            Chọn ảnh từ máy
          </button>
          <p className="text-[11px] text-gray-400 text-center px-4">
            Dụng lượng file tối đa 2MB. <br/> Định dạng: .JPEG, .PNG
          </p>
        </div>
      </div>
    </div>
  );
}