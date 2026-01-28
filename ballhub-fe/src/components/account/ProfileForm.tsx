"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

type UserProfile = {
  fullName: string;
  phone: string;
  email: string;
  avatar?: string;
};

export default function ProfileForm() {
  const [user, setUser] = useState<UserProfile>({
    fullName: "Nguyễn Văn A",
    phone: "0912 345 678",
    email: "nguyenvana@example.com",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl p-8">
      <h2 className="text-lg font-semibold mb-1">Hồ sơ của tôi</h2>
      <p className="text-sm text-gray-500 mb-6">
        Quản lý thông tin để bảo mật tài khoản
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* FORM */}
        <div className="md:col-span-2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Họ và tên</label>
              <input
                name="fullName"
                value={user.fullName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm">Số điện thoại</label>
              <input
                name="phone"
                value={user.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              disabled
              value={user.email}
              className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100"
            />
            <span className="text-xs text-green-600 mt-1 inline-block">
              ✔ Đã xác thực
            </span>
          </div>

          <Button className="bg-green-500 hover:bg-green-600 text-white px-8">
            Cập nhật thông tin
          </Button>
        </div>

        {/* AVATAR */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-gray-100 bg-[#fff3e8] flex items-center justify-center">
            <ImageIcon className="text-gray-500" size={36} />
          </div>

          <button className="mt-4 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Chọn ảnh
          </button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Dung lượng tối đa 1MB <br />
            Định dạng: JPEG, PNG
          </p>
        </div>
      </div>
    </div>
  );
}
