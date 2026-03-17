import { Eye } from "lucide-react";
import { StatusTag } from "./StatusTag";

type Props = {
  orders?: any[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onView?: (orderId: number) => void;
};

export const OrderTable = ({
  orders = [],
  page = 0,
  totalPages = 1,
  totalElements,
  pageSize = 10,
  onPageChange,
  onView,
}: Props) => {
  const totalCount = totalElements ?? orders.length;

  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-slate-800">Theo dõi đơn hàng</h3>
    </div>
    <table className="w-full text-sm">
      <thead className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
        <tr>
<<<<<<< HEAD
          <th className="text-left pb-4 w-10">STT</th>
=======
          <th className="text-left pb-4 w-12">STT</th>
>>>>>>> ae72dbc (done)
          <th className="text-left pb-4">Mã đơn</th>
          <th className="text-left pb-4">Khách hàng</th>
          <th className="text-left pb-4">Ngày đặt</th>
          <th className="text-left pb-4">Tổng tiền</th>
          <th className="text-left pb-4">Trạng thái</th>
          <th className="text-right pb-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {orders && orders.length > 0 ? (
          orders.map((o, index) => (
            <tr
              key={o.orderId}
              className="hover:bg-slate-50/50 transition-colors group"
            >
<<<<<<< HEAD
              <td className="py-4 text-slate-400 font-medium">
                {page * pageSize + index + 1}
              </td>
              <td className="py-4 font-bold text-emerald-600">#{o.orderId}</td>
              <td className="py-4">
                <p className="font-bold text-xs text-slate-700">{o.userFullName || `User ID: ${o.userId}`}</p>
                <p className="text-[10px] text-slate-400">{o.phone}</p>
              </td>
              <td className="text-slate-500 text-xs">
                {new Date(o.orderDate).toLocaleString("vi-VN")}
              </td>
              <td className="font-bold text-slate-700">
                {o.totalAmount?.toLocaleString()}đ
              </td>
=======
              <td className="py-4 text-slate-400 font-medium text-xs">
                {page * pageSize + index + 1}
              </td>
              <td className="py-4 font-bold text-emerald-600">{o.orderId}</td>
              <td className="py-4">
                <p className="font-bold text-xs text-slate-700">{o.fullName}</p>
                <p className="text-[10px] text-slate-400">{o.phone}</p>
              </td>
              <td className="text-slate-500 text-xs">{o.orderDate}</td>
              <td className="font-bold text-slate-700">{formatPrice(o.totalAmount)}</td>
>>>>>>> ae72dbc (done)
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
          ))
        ) : (
          <tr>
            <td colSpan={7} className="py-4 text-center text-slate-400">
              Không có đơn hàng
            </td>
          </tr>
        )}
      </tbody>
    </table>

    {/* Pagination controls */}
    {onPageChange && (
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Hiển thị trang {page + 1} / {totalPages || 1}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 0}
            className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50 hover:bg-slate-50"
          >
<<<<<<< HEAD
            Trang trước
=======
            Trước
>>>>>>> ae72dbc (done)
          </button>

          {[...Array(totalPages || 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`px-3 py-1 rounded-md text-sm ${i === page ? "bg-emerald-500 text-white" : "bg-white border hover:bg-slate-50"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= (totalPages || 1) - 1}
            className="px-3 py-1 rounded-md bg-white border text-sm disabled:opacity-50 hover:bg-slate-50"
          >
<<<<<<< HEAD
            Trang sau
=======
            Sau
>>>>>>> ae72dbc (done)
          </button>
        </div>
      </div>
    )}
  </div>
  );
};