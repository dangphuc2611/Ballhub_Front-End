"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, Users, Star } from "lucide-react";

const StatCard = ({ title, value, sub, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex-1">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-xs font-medium mb-1">{title}</p>
        <h3 className="text-[28px] font-black text-slate-800 tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-[20px]`}>
        <Icon size={20} className={color.replace("bg-", "text-")} />
      </div>
    </div>

    <div
      className={`flex items-center gap-1 text-[11px] font-bold ${
        trend?.includes("+") ? "text-emerald-500" : "text-slate-400"
      }`}
    >
      {trend?.includes("+") && <span>↗</span>}
      {trend}
      <span className="text-slate-400 font-medium ml-1">{sub}</span>
    </div>
  </div>
);

export const DashboardStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("refreshToken");

        const res = await fetch(
          "http://localhost:8080/api/admin/stats/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await res.json();
        console.log(result);

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Fetch dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  if (!stats) return <p>Không có dữ liệu</p>;

  return (
    <div className="flex gap-6 mb-8">
      <StatCard
        title="Tổng đơn hàng"
        value={stats.totalOrders?.toLocaleString()}
        trend="+12%"
        sub="so với tháng trước"
        icon={ShoppingCart}
        color="bg-blue-500"
      />

      <StatCard
        title="Doanh thu (VND)"
        value={`${stats.totalRevenue?.toLocaleString()} đ`}
        trend="+8.5%"
        sub="so với tháng trước"
        icon={DollarSign}
        color="bg-emerald-500"
      />

      <StatCard
        title="Khách hàng mới"
        value={stats.totalCustomers}
        trend="+2.4%"
        sub="so với tuần trước"
        icon={Users}
        color="bg-purple-500"
      />

      <StatCard
        title="Sản phẩm bán chạy"
        value={stats.topProducts}
        trend="Top 1 tuần này"
        sub=""
        icon={Star}
        color="bg-orange-500"
      />
    </div>
  );
};
