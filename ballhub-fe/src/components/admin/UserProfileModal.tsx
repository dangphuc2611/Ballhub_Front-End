import React, { useEffect, useState } from "react";
import { X, ShoppingBag, CheckCircle, XCircle, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export const UserProfileModal = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(false);
        // ✅ ĐÃ SỬA URL: Thêm /users vào trước
        const res = await api.get(`/users/admin/${userId}/stats`);
        setStats(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy thông tin:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  // ✅ XỬ LÝ LỖI TRỰC TIẾP
  if (error || !stats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white p-6 rounded-xl flex flex-col items-center">
          <p className="text-rose-500 font-bold mb-4">Lỗi không thể tải dữ liệu khách hàng!</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Đóng</button>
        </div>
      </div>
    );
  }

  const isRisky = stats?.cancelRate > 30 && stats?.totalOrders >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src={stats.avatar || "/no-image.png"} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" />
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {stats.fullName}
                {isRisky && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1 font-bold">
                    <AlertTriangle size={14}/> Rủi ro cao
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500">{stats.email} • {stats.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 text-slate-400 rounded-full transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Thống kê giao dịch</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<ShoppingBag/>} label="Tổng đơn" value={stats.totalOrders} color="blue" />
            <StatCard icon={<CheckCircle/>} label="Thành công" value={stats.successfulOrders} color="emerald" />
            <StatCard icon={<XCircle/>} label="Hoàn / Hủy" value={stats.canceledOrders} color="rose" />
            <StatCard icon={<DollarSign/>} label="Đã chi tiêu" value={`${stats.totalSpent?.toLocaleString() || 0}đ`} color="amber" />
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Tỷ lệ hủy đơn hàng:</p>
              <p className="text-xs text-slate-500 mt-1">Dựa trên lịch sử mua hàng của khách</p>
            </div>
            <div className={`text-3xl font-black ${isRisky ? "text-rose-600" : "text-emerald-500"}`}>
              {stats.cancelRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colorStyles: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${colorStyles[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
};