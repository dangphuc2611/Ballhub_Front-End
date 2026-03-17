"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Layers,
} from "lucide-react";
import axios from "axios";
import { useFormOptions } from "@/lib/useFormOptions";
import { ConfirmModal } from "@/components/common/ConfirmModal";

const BACKEND = "http://localhost:8080";
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

type Variant = {
  variantId: number;
  sizeName: string;
  colorName: string;
  price: number;
  stockQuantity: number;
  sku: string;
  active?: boolean;
};

type ProductEditModalProps = {
  productId: number;
  onClose: () => void;
  onRefresh: () => void;
};

/* ─── Reuseable field wrapper ─────────────────────────────────────────────── */
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 w-full";

/* ─── Combobox ────────────────────────────────────────────────────────────── */
const ComboBox = ({
  value,
  options,
  loading: optLoading,
  placeholder,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  loading?: boolean;
  placeholder: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={optLoading}
      className={`${inputCls} appearance-none pr-10 cursor-pointer disabled:opacity-60 ${!value ? "text-slate-400" : ""}`}
    >
      <option value="" disabled>
        {optLoading ? "Đang tải..." : placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      {optLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ChevronDown size={16} />
      )}
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
export const ProductEditModal = ({
  productId,
  onClose,
  onRefresh,
}: ProductEditModalProps) => {
  const { brands, categories, loading: optLoading } = useFormOptions();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    categoryId: "",
    brandId: "",
    status: true,
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "success" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "warning",
  });

  /* ── Fetch product detail ─────────────────────────────────────────────── */
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${BACKEND}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = res.data.data ?? res.data;

        setFormData({
          productName: p.productName || "",
          description: p.description || "",
          categoryId: p.categoryId ? p.categoryId.toString() : "",
          brandId: p.brandId ? p.brandId.toString() : "",
          status: p.status ?? true,
        });

        const rawVariants: any[] = p.variants ?? p.productVariants ?? [];

        setVariants(
          rawVariants.map((v: any) => ({
            variantId: v.variantId ?? v.productVariantId ?? v.id,
            sizeName: v.sizeName ?? v.size?.sizeName ?? `Size ${v.sizeId}`,
            colorName: v.colorName ?? v.color?.colorName ?? `Màu ${v.colorId}`,
            price: v.price ?? 0,
            stockQuantity: v.stockQuantity ?? 0,
            sku: v.sku ?? "",
            active: v.active ?? v.status ?? true,
          }))
        );
      } catch (error: any) {
        console.error("Fetch product details error:", error);
        setMessage({ type: "error", text: "Không thể tải thông tin sản phẩm" });
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductDetails();
  }, [productId]);

  /* ── Submit Logic ─────────────────────────────────────────────────────── */
  const executeSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    setConfirmConfig((p) => ({ ...p, open: false }));

    try {
      const payload = {
        productName: formData.productName,
        description: formData.description,
        categoryId: parseInt(formData.categoryId, 10),
        brandId: parseInt(formData.brandId, 10),
        status: formData.status,
      };

      await axios.put(`${BACKEND}/api/admin/products/${productId}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setMessage({ type: "success", text: "Cập nhật sản phẩm thành công!" });
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Cập nhật thất bại",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.categoryId || !formData.brandId) {
      setMessage({
        type: "error",
        text: "Vui lòng điền Tên, Danh mục và Thương hiệu",
      });
      return;
    }

    setConfirmConfig({
      open: true,
      title: "Lưu thay đổi?",
      description: "Bạn có chắc chắn muốn cập nhật thông tin sản phẩm này?",
      onConfirm: executeSubmit,
      variant: "info",
    });
  };

  /* ── Delete Logic ─────────────────────────────────────────────────────── */
  const executeDelete = async () => {
    setDeleting(true);
    setMessage(null);
    setConfirmConfig((p) => ({ ...p, open: false }));
    try {
      await axios.delete(`${BACKEND}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMessage({ type: "success", text: "Đã xóa sản phẩm thành công!" });
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Xóa thất bại",
      });
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    setConfirmConfig({
      open: true,
      title: "Xóa sản phẩm?",
      description: "Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xóa?",
      onConfirm: executeDelete,
      variant: "danger",
    });
  };

  /* ── Loading Spinner ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cập nhật sản phẩm</h2>
            <p className="text-xs text-slate-400 mt-0.5">ID: {productId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="p-7 overflow-y-auto flex-1 custom-scrollbar space-y-7">
          {/* ── Message Banner ── */}
          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* ════ FORM: Thông tin cơ bản ════ */}
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-5">
            <Field label="Tên sản phẩm *">
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={(e) => setFormData((p) => ({ ...p, productName: e.target.value }))}
                placeholder="VD: Giày đá bóng Adidas Predator"
                className={inputCls}
                required
              />
            </Field>

            <Field label="Mô tả">
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả chi tiết sản phẩm..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* ── Danh mục & Thương hiệu → Combobox ── */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Danh mục *">
                <ComboBox
                  value={formData.categoryId}
                  options={categories}
                  loading={optLoading}
                  placeholder="-- Chọn danh mục --"
                  onChange={(v) => setFormData((p) => ({ ...p, categoryId: v }))}
                />
              </Field>
              <Field label="Thương hiệu *">
                <ComboBox
                  value={formData.brandId}
                  options={brands}
                  loading={optLoading}
                  placeholder="-- Chọn thương hiệu --"
                  onChange={(v) => setFormData((p) => ({ ...p, brandId: v }))}
                />
              </Field>
            </div>

            {/* ════ BẢNG BIẾN THỂ (Read-only) ════ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Layers size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Biến thể sản phẩm
                  <span className="ml-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold normal-case tracking-normal">
                    {variants.length}
                  </span>
                </h3>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                  Sản phẩm này chưa có biến thể nào.
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr_100px_70px_1fr_60px] gap-2 px-4 py-2.5 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <span>#</span>
                    <span>Size</span>
                    <span>Màu</span>
                    <span>Giá (₫)</span>
                    <span>SL</span>
                    <span>SKU</span>
                    <span className="text-center">TT</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-50 max-h-[260px] overflow-y-auto custom-scrollbar">
                    {variants.map((v, idx) => (
                      <div
                        key={v.variantId ?? idx}
                        className="grid grid-cols-[40px_1fr_1fr_100px_70px_1fr_60px] gap-2 px-4 py-3 text-sm items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <span className="text-slate-400 font-bold text-xs">{idx + 1}</span>

                        {/* Size */}
                        <span className="inline-flex items-center">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {v.sizeName}
                          </span>
                        </span>

                        {/* Màu */}
                        <span className="inline-flex items-center">
                          <span className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {v.colorName}
                          </span>
                        </span>

                        {/* Giá */}
                        <span className="font-bold text-slate-800">{v.price.toLocaleString()}đ</span>

                        {/* Số lượng */}
                        <span className={`font-bold ${v.stockQuantity === 0 ? "text-red-500" : "text-slate-700"}`}>
                          {v.stockQuantity}
                        </span>

                        {/* SKU */}
                        <span className="font-mono text-xs text-slate-500 truncate" title={v.sku}>
                          {v.sku || <span className="text-slate-300 italic">—</span>}
                        </span>

                        {/* Trạng thái */}
                        <div className="flex justify-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              v.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {v.active !== false ? "Hoạt động" : "Tắt"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Trạng thái ── */}
            <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="status" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                Trạng thái hoạt động
              </label>
            </div>
          </form>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50 border border-rose-100"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
            Xóa sản phẩm
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-200 bg-slate-100 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="edit-product-form"
              disabled={submitting || deleting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
        onClose={() => setConfirmConfig((p) => ({ ...p, open: false }))}
        onConfirm={confirmConfig.onConfirm}
      />
    </div>
  );
};
