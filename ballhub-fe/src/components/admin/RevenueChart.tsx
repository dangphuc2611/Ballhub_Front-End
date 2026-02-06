export const RevenueChart = () => (
  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-8">
    <div className="flex justify-between items-center mb-10">
      <div>
        <h3 className="text-lg font-black text-slate-800">Biểu đồ doanh thu</h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">Tổng quan doanh thu 7 ngày qua</p>
      </div>
      <button className="flex items-center gap-4 px-4 py-2 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
        7 ngày qua <span className="text-[10px]">▼</span>
      </button>
    </div>
    
    {/* Placeholder cho Chart - Bạn có thể dùng Recharts với type="monotone" */}
    <div className="relative h-64 w-full group">
      <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible">
        <path 
          d="M0,150 C150,150 250,50 400,100 C550,150 650,50 800,100 C950,150 1000,50 1000,50" 
          fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round"
        />
        <circle cx="400" cy="100" r="6" fill="white" stroke="#10b981" strokeWidth="3" />
        <circle cx="800" cy="100" r="6" fill="white" stroke="#10b981" strokeWidth="3" />
      </svg>
      {/* Trục X */}
      <div className="flex justify-between mt-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span><span>CN</span>
      </div>
    </div>
  </div>
);