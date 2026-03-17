"use client";

import React from "react";
import { Eye, Pencil, Trash2, Plus, Tag, CheckCircle, XCircle } from "lucide-react";

type Voucher = {
  promotionId: number;
  promotionName: string;
  promoCode: string;
  discountPercent: number;
  discountType: string;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: boolean;
  valid: boolean;
};

type Props = {
  vouchers?: Voucher[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onView?: (voucher: Voucher) => void;
  onEdit?: (voucher: Voucher) => void;
  onDelete?: (id: number) => void;
  onAddNew?: () => void;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(val?: number) {
  if (val == null) return "—";
  return val.toLocaleString("vi-VN") + "đ";
}

export const VoucherTable = ({
  vouchers = [],
  page = 0,
  totalPages = 1,
  totalElements,
  onPageChange,
  onView,
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
            <Tag size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">Quản lý Voucher</h3>
            {totalElements != null && (
              <p className="text-[11px] text-slate-400 font-medium">{totalElements} voucher</p>
            )}
          </div>
        </div>
        <button
          id="btn-add-voucher"
          onClick={onAddNew}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-emerald-100"
        >
          <Plus size={16} /> Thêm Voucher
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60">
            <tr className="text-slate-400 text-[11px] uppercase">
              <th className="text-left px-8 py-4 font-semibold w-16">STT</th>
              <th className="text-left px-4 py-4 font-semibold">Mã Voucher</th>
              <th className="text-left px-4 py-4 font-semibold">Tên chương trình</th>
              <th className="text-left px-4 py-4 font-semibold">Giảm giá</th>
              <th className="text-left px-4 py-4 font-semibold">Đơn tối thiểu</th>
              <th className="text-left px-4 py-4 font-semibold">Lượt dùng</th>
              <th className="text-left px-4 py-4 font-semibold">Ngày hết hạn</th>
              <th className="text-left px-4 py-4 font-semibold">Trạng thái</th>
              <th className="text-right px-8 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vouchers.length > 0 ? (
              vouchers.map((v, index) => (
                <tr
                  key={v.promotionId}
                  className="hover:bg-emerald-50/30 transition-colors group"
                >
                  <td className="px-8 py-4 text-slate-400 font-medium text-xs">
                    {page * pageSize + index + 1}
                  </td>
                  {/* Promo Code */}
                  <td className="px-8 py-4">
                    <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                      {v.promoCode}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-700 text-xs max-w-[160px] truncate">
                      {v.promotionName}
                    </p>
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-4">
                    {v.discountType === "PERCENT" ? (
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                        -{v.discountPercent}%
                      </span>
                    ) : (
                      <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
                        -{formatCurrency(v.maxDiscountAmount)}
                      </span>
                    )}
                  </td>

                  {/* Min Order */}
                  <td className="px-4 py-4 text-slate-500 text-xs">
                    {formatCurrency(v.minOrderAmount)}
                  </td>

                  {/* Usage */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600 font-medium">
                        {v.usedCount ?? 0} / {v.usageLimit ?? "∞"}
                      </span>
                      {v.usageLimit && v.usageLimit > 0 && (
                        <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((v.usedCount ?? 0) / v.usageLimit) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* End Date */}
                  <td className="px-4 py-4 text-slate-500 text-xs">{formatDate(v.endDate)}</td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {v.valid ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                        <CheckCircle size={12} /> Hiệu lực
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
                        <XCircle size={12} /> Hết hạn
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onView?.(v)}
                        title="Xem chi tiết"
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEdit?.(v)}
                        title="Chỉnh sửa"
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete?.(v.promotionId)}
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
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Tag size={22} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Chưa có voucher nào</p>
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
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = totalPages <= 7 ? i : page <= 3 ? i : page >= totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    p === page
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "bg-white border border-slate-100 text-slate-500 hover:bg-emerald-50"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
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
