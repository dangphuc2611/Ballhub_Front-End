import { Eye } from 'lucide-react';
import { StatusTag } from './StatusTag';

export const OrderTable = ({ orders }: { orders: any[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-lg text-slate-800">Theo dõi đơn hàng</h3>
      <button className="text-emerald-500 text-xs font-bold hover:underline">Xem tất cả</button>
    </div>
    <table className="w-full text-sm">
      <thead className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
        <tr>
          <th className="text-left pb-4">Mã đơn</th>
          <th className="text-left pb-4">Khách hàng</th>
          <th className="text-left pb-4">Ngày đặt</th>
          <th className="text-left pb-4">Tổng tiền</th>
          <th className="text-left pb-4">Trạng thái</th>
          <th className="text-right pb-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
            <td className="py-4 font-bold text-emerald-600">{o.id}</td>
            <td className="py-4">
              <p className="font-bold text-xs text-slate-700">{o.customer}</p>
              <p className="text-[10px] text-slate-400">{o.phone}</p>
            </td>
            <td className="text-slate-500 text-xs">{o.date}</td>
            <td className="font-bold text-slate-700">{o.total}</td>
            <td><StatusTag label={o.status} color={o.color} /></td>
            <td className="text-right">
              <button className="p-2 text-slate-300 hover:text-blue-500 transition-all"><Eye size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);