"use client";

import { Eye, RotateCw } from "lucide-react";
import { useState } from "react";
import { StatusTag } from "./StatusTag";

type Props = {
  orders?: any[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onView?: (orderId: number) => void;
  onRefresh?: () => void;
};

export const OrderTable = ({
  orders = [],
  page = 0,
  totalPages = 1,
  totalElements,
  pageSize = 10,
  onPageChange,
  onView,
  onRefresh,
}: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (!onRefresh) return;
    setIsRefreshing(true); 
    onRefresh(); 
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 z-10">
        <h3 className="font-bold text-lg text-slate-800">Theo dõi đơn hàng</h3>
        
        {onRefresh && (
          <button 
            onClick={handleRefresh}
            title="Tải lại dữ liệu"
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-white border border-slate-100 rounded-lg px-3 py-1.5 hover:border-emerald-200"
          >
            <RotateCw size={14} className={`${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
            <tr>
              <th className="text-left pb-4 w-12">STT</th>
              <th className="text-left pb-4">Mã đơn</th>
              <th className="text-left pb-4">Loại đơn</th>
              <th className="text-left pb-4">Khách hàng</th>
              <th className="text-left pb-4">Ngày đặt</th>
              <th className="text-left pb-4">Tổng tiền</th>
              <th className="text-left pb-4">Trạng thái</th>
              <th className="text-right pb-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders && orders.length > 0 ? (
              orders.map((o, index) => {
                // KIỂM TRA ĐƠN TẠI QUẦY HOẶC ONLINE (Dựa vào việc có địa chỉ ship hay không)
                const isPosOrder = !o.deliveryAddress || o.deliveryAddress === "";
                
                // ✅ LOGIC MỚI: Cực kỳ tối giản, lấy thẳng biến userFullName từ Backend
                const displayCustomerName = o.userFullName || o.fullName || o.customerName || "Khách lẻ";
                const displayPhone = o.phone || o.user?.phone || (isPosOrder ? "Tại quầy" : "---");

                return (
                <tr
                  key={o.orderId}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 text-slate-400 font-medium text-xs">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="py-4 font-bold text-emerald-600">HD{o.orderId}</td>
                  
                  <td>
                    {isPosOrder ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">TẠI QUẦY</span>
                    ) : (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">ONLINE</span>
                    )}
                  </td>
                  
                  <td className="py-4">
                    <p className="font-bold text-xs text-slate-700">
                      {displayCustomerName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {displayPhone}
                    </p>
                  </td>
                  
                  <td className="text-slate-500 text-xs">{o.orderDate ? new Date(o.orderDate).toLocaleString('vi-VN') : '---'}</td>
                  <td className="font-bold text-slate-700">
                    {formatPrice(o.totalAmount)}
                  </td>

                  <td>
                    <StatusTag label={o.statusName} color={o.color} />
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onView?.(o.orderId)}
                      className="p-2 text-slate-300 hover:text-blue-500 transition-all"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan={8} className="py-4 text-center text-slate-400">
                  Không có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="mt-6 flex items-center justify-between z-10 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Hiển thị trang {page + 1} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 0}
              className="px-3 py-1.5 rounded-lg bg-white border text-xs font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white"
            >
              Trước
            </button>

            {[...Array(totalPages || 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold ${i === page ? "bg-emerald-500 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= (totalPages || 1) - 1}
              className="px-3 py-1.5 rounded-lg bg-white border text-xs font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};