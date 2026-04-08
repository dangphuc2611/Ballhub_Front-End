"use client";

import React from "react";
import { Zap, Trash2, Pencil, Plus, CheckCircle, XCircle, Loader2, Package } from "lucide-react";

export type Promotion = {
  promotionId: number;
  promotionName: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: boolean;
  valid: boolean;
  appliedProductCount: number; // Trường mới từ Backend
};

type Props = {
  promotions: Promotion[];
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onDelete: (id: number) => void;
  onEdit: (promotion: Promotion) => void;
  onAddNew: () => void;
  onToggleStatus?: (id: number) => void;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export const PromotionTable = ({
  promotions = [], page = 0, totalPages = 1, totalElements,
  onPageChange, onDelete, onEdit, onAddNew, onToggleStatus,
  pageSize = 10, isLoading = false
}: Props) => {
  
  const goTo = (p: number) => {
    if (p < 0 || p >= totalPages) return;
    onPageChange(p);
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
            {isLoading ? <Loader2 size={18} className="text-orange-500 animate-spin" /> : <Zap size={18} className="text-orange-500 fill-orange-500" />}
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">Quản lý Khuyến mãi</h3>
            <p className="text-[11px] text-slate-400 font-medium">{totalElements ?? 0} chương trình</p>
          </div>
        </div>
        <button onClick={onAddNew} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-orange-100">
          <Plus size={16} /> Thêm mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-slate-400 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="text-left px-8 py-4 font-bold w-16">STT</th>
              <th className="text-left px-4 py-4 font-bold">Chương trình</th>
              <th className="text-left px-4 py-4 font-bold">Áp dụng</th>
              <th className="text-left px-4 py-4 font-bold">Giảm giá</th>
              <th className="text-left px-4 py-4 font-bold">Thời hạn</th>
              <th className="text-left px-4 py-4 font-bold">Trạng thái</th>
              <th className="text-right px-8 py-4 font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {promotions.map((p, index) => (
              <tr key={p.promotionId} className="hover:bg-orange-50/30 transition-colors group">
                <td className="px-8 py-4 text-slate-400 font-medium text-xs">{page * pageSize + index + 1}</td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-700 text-xs">{p.promotionName}</p>
                  {!p.valid && <span className="text-[9px] text-rose-500 font-bold uppercase">Hết hạn</span>}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                    <Package size={14} className="text-slate-400" />
                    <span>{p.appliedProductCount || 0} Sản phẩm</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-black text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg text-xs">-{p.discountPercent}%</span>
                </td>
                <td className="px-4 py-4 text-slate-500 text-xs font-medium">
                  <p className="text-[10px]"><span className="text-emerald-500">Từ:</span> {formatDate(p.startDate)}</p>
                  <p className="text-[10px]"><span className="text-rose-500">Đến:</span> {formatDate(p.endDate)}</p>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => onToggleStatus?.(p.promotionId)}>
                    {p.status ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg"><CheckCircle size={12} /> HOẠT ĐỘNG</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg"><XCircle size={12} /> ĐÃ TẮT</span>
                    )}
                  </button>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Pencil size={15} /></button>
                    <button onClick={() => onDelete(p.promotionId)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ... Giữ nguyên phần Pagination ... */}
    </div>
  );
};