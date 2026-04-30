"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DailyRevenue {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: DailyRevenue[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {format(new Date(payload[0].payload.date), "EEEE, dd/MM", { locale: vi })}
        </p>
        <p className="text-sm font-black text-emerald-600">
          {payload[0].value.toLocaleString()} đ
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data = [], loading = false }: RevenueChartProps) => {
  // Mock data if no data provided for preview
  const chartData = data.length > 0 ? data : [
    { date: "2024-04-24", revenue: 1500000 },
    { date: "2024-04-25", revenue: 2300000 },
    { date: "2024-04-26", revenue: 1800000 },
    { date: "2024-04-27", revenue: 3500000 },
    { date: "2024-04-28", revenue: 2800000 },
    { date: "2024-04-29", revenue: 4200000 },
    { date: "2024-04-30", revenue: 3900000 },
  ];

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-8 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400">Đang tải biểu đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Biểu đồ doanh thu</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Thống kê doanh thu thực tế 7 ngày gần nhất
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              dy={15}
              tickFormatter={(str) => {
                const date = new Date(str);
                return format(date, "EEE", { locale: vi }).replace("Thứ ", "T");
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
