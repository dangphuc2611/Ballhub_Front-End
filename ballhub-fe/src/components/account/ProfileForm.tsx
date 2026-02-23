"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    api.get("/users/me").then((res) => {
      if (res.data.success) setProfile(res.data.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toast.error("Không thể tải thông tin người dùng");
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfile({ ...profile, avatar: previewUrl });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // 1. Cập nhật thông tin chữ
      await api.put("/users/me", {
        fullName: profile.fullName,
        phone: profile.phone,
      });

      // 2. Upload Ảnh
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post("/users/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Đồng bộ lại dữ liệu toàn hệ thống
      const refreshRes = await api.get("/users/me");
      if (refreshRes.data.success) {
        const newUserInfo = refreshRes.data.data;
        setProfile(newUserInfo); 
        updateUser(newUserInfo); 
        toast.success("Đã cập nhật hồ sơ!");
      }
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const renderAvatar = () => {
    if (!profile?.avatar) return <ImageIcon className="text-gray-300" size={48} />;

    let src = profile.avatar;
    if (!src.startsWith("blob:") && !src.startsWith("http")) {
      src = `http://localhost:8080${src}`;
    }

    return (
      <img 
        src={src} 
        className="w-full h-full object-cover" 
        alt="avatar"
        onError={(e) => {
          // Khi lỗi, thay bằng ảnh mặc định hoặc icon thay vì hiện thông báo toast spam
          (e.target as HTMLImageElement).src = "https://www.w3schools.com/howto/img_avatar.png"; 
          // Hoặc bạn có thể ẩn thông báo lỗi đi để giao diện sạch sẽ hơn
        }}
      />
    );
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-500" /></div>;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h2>
        <p className="text-sm text-gray-500">Quản lý thông tin để bảo mật tài khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Họ và tên</label>
              <input
                value={profile?.fullName || ""}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-green-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Số điện thoại</label>
              <input
                value={profile?.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-green-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input disabled value={profile?.email || ""} className="w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>

          <Button onClick={handleUpdate} disabled={updating} className="bg-green-500 hover:bg-green-600 text-white px-10 h-12 rounded-xl">
            {updating ? <Loader2 className="animate-spin mr-2" /> : "Cập nhật thông tin"}
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-36 h-36 rounded-full border-4 border-gray-100 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
            {renderAvatar()}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 text-gray-600">
            Chọn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}