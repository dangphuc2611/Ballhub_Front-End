"use client";

import ProtectedRoute from "@/components/login/ProtectedRoute";

export default function AdminDashboard() {
  return (
    // Chỉ những user có role là ADMIN mới xem được nội dung bên trong
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-red-600">
          Chào mừng Admin!
        </h1>
        <p className="mt-4 text-gray-600">
          Đây là trang quản trị bí mật chỉ dành cho người có quyền cao nhất.
        </p>
        
        <div className="mt-6 p-4 bg-white border rounded shadow">
          <p>Thống kê hệ thống: 100 đơn hàng mới.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}