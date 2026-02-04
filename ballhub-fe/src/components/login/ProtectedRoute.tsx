"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized"); // Bạn cần tạo trang này sau
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) return <div className="p-10 text-center">Đang kiểm tra quyền...</div>;

  return <>{children}</>;
}