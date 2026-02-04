"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function ProfileForm() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get("/users/me").then((res) => {
      if (res.data.success) setProfile(res.data.data);
      setLoading(false);
    });
  }, []);

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
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-green-500 outline-none transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Số điện thoại</label>
              <input 
                value={profile?.phone || ""} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-green-500 outline-none transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input disabled value={profile?.email || ""} className="w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <Button disabled={updating} className="bg-green-500 hover:bg-green-600 text-white px-10 h-12 rounded-xl shadow-md transition-all active:scale-95">
            {updating ? <Loader2 className="animate-spin mr-2" /> : "Cập nhật thông tin"}
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="w-36 h-36 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center relative group">
            {profile?.avatar ? (
              <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <ImageIcon className="text-gray-300" size={48} />
            )}
          </div>
          <button className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all text-gray-600">
            Chọn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}