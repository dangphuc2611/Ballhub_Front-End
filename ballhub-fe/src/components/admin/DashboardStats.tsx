"use client";

import { ShoppingCart, DollarSign, Users, Star } from "lucide-react";

const StatCard = ({ title, value, sub, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex-1 group hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className={`text-[28px] font-black text-slate-800 tracking-tight group-hover:${color.replace("bg-", "text-")} transition-colors`}>
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-2xl ${color} text-white transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
        <Icon size={20} strokeWidth={2.5} />
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

interface DashboardStatsProps {
  stats?: any;
  loading?: boolean;
}

export const DashboardStats = ({ stats, loading }: DashboardStatsProps) => {
  if (loading) {
    return (
      <div className="flex gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex-1 animate-pulse">
            <div className="h-4 w-20 bg-slate-100 rounded mb-4"></div>
            <div className="h-8 w-32 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex gap-6 mb-8">
      <StatCard
        title="Tổng đơn hàng"
        value={stats.totalOrders?.toLocaleString()}
        trend=""
        sub=""
        icon={ShoppingCart}
        color="bg-blue-500"
      />

      <StatCard
        title="Doanh thu (VND)"
        value={`${stats.totalRevenue?.toLocaleString()} đ`}
        trend=""
        sub=""
        icon={DollarSign}
        color="bg-emerald-500"
      />

      <StatCard
        title="Khách hàng mới"
        value={stats.totalCustomers}
        trend=""
        sub=""
        icon={Users}
        color="bg-purple-500"
      />

      <StatCard
        title="Sản phẩm bán chạy"
        value={stats.topProducts?.[0]?.productName || "N/A"}
        trend="Bán chạy nhất"
        sub={
          stats.topProducts?.[0]
            ? `(Đã bán: ${stats.topProducts[0].quantitySold})`
            : ""
        }
        icon={Star}
        color="bg-orange-500"
      />
    </div>
  );
};
