"use client";

import React from "react";
import { Briefcase, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

type Brand = {
  brandId: number;
  brandName: string;
  description: string;
  logo: string;
  status: boolean;
};

type Props = {
  brands?: Brand[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onEdit?: (brand: Brand) => void;
  onDelete?: (id: number) => void;
  onAddNew?: () => void;
};

export const BrandTable = ({
  brands = [],
  page = 0,
  totalPages = 1,
  totalElements,
  onPageChange,
  onEdit,
  onDelete,
  onAddNew,
  pageSize = 10,
}: Props) => {
  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">Quản lý Hãng sản xuất</h3>
            {totalElements != null && (
              <p className="text-[11px] text-slate-400 font-medium">{totalElements} thương hiệu</p>
            )}
          </div>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-100"
        >
          <Plus size={16} /> Thêm Hãng
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60">
            <tr className="text-slate-400 text-[11px] uppercase">
              <th className="text-left px-8 py-4 font-semibold w-16">STT</th>
              <th className="text-left px-4 py-4 font-semibold w-24">ID</th>
              <th className="text-left px-4 py-4 font-semibold">Tên Hãng</th>
              <th className="text-left px-4 py-4 font-semibold">Mô tả</th>
              <th className="text-left px-4 py-4 font-semibold text-center">Trạng thái</th>
              <th className="text-right px-8 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {brands.length > 0 ? (
              brands.map((b, index) => (
                <tr
                  key={b.brandId}
                  className="hover:bg-emerald-50/30 transition-colors group"
                >
                  <td className="px-8 py-4 text-slate-400 font-medium text-xs">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="px-8 py-4">
                    <span className="font-mono font-bold text-slate-400 text-xs">
                      #{b.brandId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-700 text-sm">
                      {b.brandName}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500 max-w-[200px] truncate" title={b.description}>
                      {b.description || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {b.status ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle size={12} /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <XCircle size={12} /> Tạm ngưng
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit?.(b)}
                        title="Chỉnh sửa"
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete?.(b.brandId)}
                        title="Xóa"
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Briefcase size={22} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Chưa có hãng sản xuất nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Trang {page + 1} / {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              ← Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  i === page
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "bg-white border border-slate-100 text-slate-500 hover:bg-emerald-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-100 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
