import { Plus, ShoppingCart } from 'lucide-react';

const InputGroup = ({ label, placeholder, type = "text" }: any) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className="text-xs font-bold text-slate-700">{label}</label>
    <input type={type} placeholder={placeholder} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-all" />
  </div>
);

export const QuickAddProduct = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 sticky top-8">
    <div className="flex items-center gap-2 text-emerald-600">
      <Plus size={20} strokeWidth={3}/><h3 className="font-bold text-slate-800">Thêm nhanh</h3>
    </div>
    <InputGroup label="Tên sản phẩm" placeholder="Ví dụ: Áo đấu MU..." />
    <div className="flex gap-4">
      <InputGroup label="Danh mục" placeholder="Premier League" />
      <InputGroup label="Giá niêm yết" placeholder="0" type="number" />
    </div>
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700">Ảnh</label>
      <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 flex flex-col items-center gap-2 bg-slate-50/50 hover:border-emerald-200 cursor-pointer transition-all group">
        <Plus className="text-emerald-500 group-hover:scale-110 transition-transform" />
        <p className="text-[10px] text-slate-400 font-medium">Kéo thả ảnh tại đây</p>
      </div>
    </div>
    <button className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
      <ShoppingCart size={18}/> Lưu & Hiển thị ngay
    </button>
  </div>
);