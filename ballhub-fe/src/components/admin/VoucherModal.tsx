"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Tag,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Percent,
  Hash,
  Info,
} from "lucide-react";

type Voucher = {
  promotionId?: number;
  promotionName?: string;
  promoCode?: string;
  discountPercent?: number;
  discountType?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  status?: boolean;
  valid?: boolean;
};

type Mode = "view" | "create" | "edit";

type Props = {
  mode: Mode;
  voucher?: Voucher | null;
  onClose: () => void;
  onSuccess: () => void;
};

function toInputDateTime(dateStr?: string) {
  if (!dateStr) return "";
  // Convert ISO string to datetime-local format: YYYY-MM-DDTHH:mm
  return dateStr.slice(0, 16);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
}

function formatCurrency(val?: number) {
  if (val == null) return "—";
  return val.toLocaleString("vi-VN") + "đ";
}

import { API_URL } from "@/config/env";

const API_BASE = `${API_URL}/promotions`;

export const VoucherModal = ({ mode, voucher, onClose, onSuccess }: Props) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    promotionName: "",
    promoCode: "",
    discountType: "PERCENT",
    discountPercent: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: true,
  });

  useEffect(() => {
    if (voucher && (isEdit || isView)) {
      setForm({
        promotionName: voucher.promotionName ?? "",
        promoCode: voucher.promoCode ?? "",
        discountType: voucher.discountType ?? "PERCENT",
        discountPercent: voucher.discountPercent?.toString() ?? "",
        maxDiscountAmount: voucher.maxDiscountAmount?.toString() ?? "",
        minOrderAmount: voucher.minOrderAmount?.toString() ?? "",
        usageLimit: voucher.usageLimit?.toString() ?? "",
        startDate: toInputDateTime(voucher.startDate),
        endDate: toInputDateTime(voucher.endDate),
        status: voucher.status ?? true,
      });
    }
  }, [voucher, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.promotionName.trim()) { setError("Vui lòng nhập tên chương trình"); return; }
    if (!form.promoCode.trim()) { setError("Vui lòng nhập mã voucher"); return; }

    setSaving(true);
    try {
      const token = localStorage.getItem("refreshToken");
      const body = {
        promotionName: form.promotionName,
        promoCode: form.promoCode,
        discountType: form.discountType,
        discountPercent: form.discountPercent ? parseInt(form.discountPercent) : null,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        startDate: form.startDate ? form.startDate + ":00" : null,
        endDate: form.endDate ? form.endDate + ":00" : null,
        status: form.status,
      };

      const url = isEdit
        ? `${API_BASE}/admin/${voucher?.promotionId}`
        : `${API_BASE}/admin`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Đã có lỗi xảy ra");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === "view"
      ? "Chi tiết Voucher"
      : mode === "edit"
      ? "Chỉnh sửa Voucher"
      : "Thêm Voucher mới";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg">{title}</h2>
              {isView && voucher?.promoCode && (
                <p className="text-xs text-slate-400 font-mono">{voucher.promoCode}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-5">
          {/* View-only summary badges */}
          {isView && voucher && (
            <div className="flex flex-wrap gap-2 mb-2">
              {voucher.valid ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <CheckCircle size={13} /> Còn hiệu lực
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  <XCircle size={13} /> Hết hiệu lực
                </span>
              )}
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                Đã dùng: {voucher.usedCount ?? 0} / {voucher.usageLimit ?? "∞"} lượt
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl text-sm">
              <Info size={15} /> {error}
            </div>
          )}

          {/* Grid of fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Promotion Name */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Tên chương trình <span className="text-rose-500">*</span>
              </label>
              {isView ? (
                <p className="text-sm font-semibold text-slate-800">{voucher?.promotionName ?? "—"}</p>
              ) : (
                <input
                  type="text"
                  name="promotionName"
                  value={form.promotionName}
                  onChange={handleChange}
                  placeholder="VD: Chào bạn mới"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* Promo Code */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <Hash size={12} className="inline mr-1" />
                Mã Voucher <span className="text-rose-500">*</span>
              </label>
              {isView ? (
                <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm">
                  {voucher?.promoCode ?? "—"}
                </span>
              ) : (
                <input
                  type="text"
                  name="promoCode"
                  value={form.promoCode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }))
                  }
                  placeholder="VD: BALLHUB20"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Loại giảm giá</label>
              {isView ? (
                <p className="text-sm text-slate-700">{voucher?.discountType === "PERCENT" ? "Theo phần trăm" : "Số tiền cố định"}</p>
              ) : (
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                >
                  <option value="PERCENT">Theo phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (đ)</option>
                </select>
              )}
            </div>

            {/* Discount Percent */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${form.discountType === "FIXED" ? "text-slate-300" : "text-slate-600"}`}>
                <Percent size={12} className="inline mr-1" />
                Phần trăm giảm (%)
              </label>
              {isView ? (
                <p className="text-sm font-bold text-emerald-600">{voucher?.discountType === "PERCENT" ? `${voucher?.discountPercent}%` : "—"}</p>
              ) : (
                <input
                  type="number"
                  name="discountPercent"
                  value={form.discountType === "FIXED" ? "" : form.discountPercent}
                  onChange={handleChange}
                  placeholder={form.discountType === "FIXED" ? "N/A" : "VD: 20"}
                  min={0}
                  max={100}
                  disabled={form.discountType === "FIXED"}
                  className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
                    form.discountType === "FIXED" 
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
                      : "focus:ring-2 ring-emerald-200 focus:border-emerald-400"
                  }`}
                />
              )}
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <DollarSign size={12} className="inline mr-1" />
                Đơn hàng tối thiểu (đ)
              </label>
              {isView ? (
                <p className="text-sm text-slate-700">{formatCurrency(voucher?.minOrderAmount)}</p>
              ) : (
                <input
                  type="number"
                  name="minOrderAmount"
                  value={form.minOrderAmount}
                  onChange={handleChange}
                  placeholder="VD: 200000"
                  min={0}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* Max Discount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Giảm tối đa (đ)
              </label>
              {isView ? (
                <p className="text-sm text-slate-700">{formatCurrency(voucher?.maxDiscountAmount)}</p>
              ) : (
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={form.maxDiscountAmount}
                  onChange={handleChange}
                  placeholder="VD: 50000"
                  min={0}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Số lượt dùng tối đa
              </label>
              {isView ? (
                <p className="text-sm text-slate-700">{voucher?.usageLimit ?? "Không giới hạn"}</p>
              ) : (
                <input
                  type="number"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleChange}
                  placeholder="0 = không giới hạn"
                  min={0}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Kích hoạt</label>
              {isView ? (
                voucher?.status ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <CheckCircle size={12} /> Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <XCircle size={12} /> Tắt
                  </span>
                )
              ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-sm text-slate-600">Kích hoạt voucher</span>
                </label>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Ngày bắt đầu
              </label>
              {isView ? (
                <p className="text-sm text-slate-700">{formatDate(voucher?.startDate)}</p>
              ) : (
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                <Calendar size={12} className="inline mr-1" />
                Ngày kết thúc
              </label>
              {isView ? (
                <p className="text-sm text-slate-700">{formatDate(voucher?.endDate)}</p>
              ) : (
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-emerald-200 focus:border-emerald-400 transition-all"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            {isView ? "Đóng" : "Hủy"}
          </button>
          {!isView && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-emerald-200"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo Voucher"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
