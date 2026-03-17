"use client";

import React from "react";
import { MessageSquare, Trash2, Star, User, Package } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type Review = {
  reviewId: number;
  productId: number;
  productName: string;
  userId: number;
  fullName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: boolean;
};

type Props = {
  reviews?: Review[];
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onDelete?: (id: number) => void;
};

export const ReviewTable = ({
  reviews = [],
  page = 0,
  totalPages = 1,
  totalElements,
  onPageChange,
  onDelete,
  pageSize = 10,
}: Props) => {
  const goTo = (p: number) => {
    if (!onPageChange) return;
    if (p < 0 || p >= (totalPages || 1)) return;
    onPageChange(p);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-50"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <MessageSquare size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">Quản lý Đánh giá</h3>
            {totalElements != null && (
              <p className="text-[11px] text-slate-400 font-medium">{totalElements} đánh giá</p>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60">
            <tr className="text-slate-400 text-[11px] uppercase">
              <th className="text-left px-8 py-4 font-semibold w-16">STT</th>
              <th className="text-left px-4 py-4 font-semibold w-20">ID</th>
              <th className="text-left px-4 py-4 font-semibold">Sản phẩm</th>
              <th className="text-left px-4 py-4 font-semibold">Người dùng</th>
              <th className="text-left px-4 py-4 font-semibold">Đánh giá</th>
              <th className="text-left px-4 py-4 font-semibold w-[30%]">Nhận xét</th>
              <th className="text-left px-4 py-4 font-semibold">Ngày tạo</th>
              <th className="text-right px-8 py-4 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reviews.length > 0 ? (
              reviews.map((r, index) => (
                <tr
                  key={r.reviewId}
                  className="hover:bg-emerald-50/30 transition-colors group text-xs text-slate-600"
                >
                  <td className="px-8 py-4 text-slate-400 font-medium text-xs">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="px-8 py-4">
                    <span className="font-mono font-bold text-slate-400">
                      #{r.reviewId}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <Package size={14} className="text-slate-300" />
                       <p className="font-bold text-slate-700 max-w-[150px] truncate" title={r.productName}>
                        {r.productName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <User size={14} className="text-slate-300" />
                       <span className="font-medium text-slate-600">{r.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {renderStars(r.rating)}
                      <span className="text-[10px] font-bold text-slate-400">{r.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-500 line-clamp-2 italic" title={r.comment}>
                      "{r.comment || "Không có nội dung"}"
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                    {format(new Date(r.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button
                      onClick={() => onDelete?.(r.reviewId)}
                      title="Xóa đánh giá"
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <MessageSquare size={22} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Chưa có đánh giá nào</p>
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
