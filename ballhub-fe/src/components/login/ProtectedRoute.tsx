"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  allowGuest = false // ✅ THÊM CỜ NÀY: Mặc định là cấm, trừ khi bật thành true
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[],
  allowGuest?: boolean 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // 1. NẾU LÀ ADMIN: Cấm tuyệt đối ra trang của Khách
      if (user && user.role === "ADMIN") {
        if (!pathname.startsWith("/admin")) {
          router.replace("/admin");
          return;
        }
      }

      // 2. NẾU LÀ KHÁCH HÀNG: Cấm tuyệt đối vào kho Admin
      if (user && user.role === "CUSTOMER") {
        if (pathname.startsWith("/admin")) {
          router.replace("/");
          return;
        }
      }

      // 3. XỬ LÝ KHÁCH VÃNG LAI (CHƯA ĐĂNG NHẬP)
      if (!user) {
        // Nếu trang này KHÔNG cho phép khách vãng lai -> Đuổi ra Login
        if (!allowGuest) {
          router.replace("/login");
          return;
        }
      } 
      // 4. XỬ LÝ PHÂN QUYỀN ROLE
      else {
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          if (user.role === "ADMIN") router.replace("/admin");
          else router.replace("/");
          return;
        }
      }

      // Vượt qua hết các trạm kiểm soát -> Mở cửa
      setIsAuthorized(true);
    }
  }, [user, loading, router, pathname, allowedRoles, allowGuest]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-600 mb-4" size={40} />
      </div>
    );
  }

  return <>{children}</>;
}