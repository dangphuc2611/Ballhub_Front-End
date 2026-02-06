import { StatusTag } from './StatusTag';

export const ProductTable = ({ products }: { products: any[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="font-bold text-lg">Sản phẩm hiện có</h3>
        <p className="text-xs text-slate-400">Tất cả {products.length} mặt hàng</p>
      </div>
      <div className="flex bg-slate-50 p-1 rounded-lg">
        <button className="px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md">Tất cả</button>
        <button className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-600">Đang bán</button>
      </div>
    </div>
    <table className="w-full text-sm">
      <thead className="text-slate-400 text-[11px] uppercase tracking-wider">
        <tr>
          <th className="text-left pb-4">Sản phẩm</th>
          <th className="text-left pb-4">Giá bán</th>
          <th className="text-left pb-4">Kho</th>
          <th className="text-left pb-4">Trạng thái</th>
          <th className="text-right pb-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {products.map(p => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
            <td className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                <div>
                  <p className="font-bold text-slate-700">{p.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.sub}</p>
                </div>
              </div>
            </td>
            <td className="font-bold text-slate-600">{p.price}</td>
            <td className="text-slate-500 font-medium">{p.stock}</td>
            <td><StatusTag label={p.status} color={p.color} /></td>
            <td className="text-right">
              <button className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">✎</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);