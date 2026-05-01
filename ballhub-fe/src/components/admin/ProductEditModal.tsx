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
  ImagePlus,
  Plus,
} from "lucide-react";
import axios from "axios";
import { API_URL, API_BASE_URL, getImageUrl } from "@/config/env";
import { useFormOptions } from "@/lib/useFormOptions";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import * as Tabs from "@radix-ui/react-tabs";
import { ProductVariantManager } from "./ProductVariantManager";
import { ImagePickerModal } from "./ImagePickerModal";


const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

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
  const { brands, categories, sizes, colors, materials, styles, loading: optLoading } = useFormOptions();
  const [activeTab, setActiveTab] = useState("info");

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
    materialId: "",
    styleId: "",
    status: true,
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  const [productImages, setProductImages] = useState<{ imageId: number; imageUrl: string; isMain: boolean; variantId?: number | null }[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

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
        const res = await axios.get(`${API_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = res.data.data ?? res.data;

        setFormData({
          productName: p.productName || "",
          description: p.description || "",
          categoryId: p.categoryId ? p.categoryId.toString() : "",
          brandId: p.brandId ? p.brandId.toString() : "",
          materialId: p.materialId ? p.materialId.toString() : "",
          styleId: p.styleId ? p.styleId.toString() : "",
          status: p.status ?? true,
        });

        setProductImages((p.images || []).filter((img: any) => img.variantId === null));

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

  const handleRefreshInner = async () => {
    // Re-fetch product details to update variants table
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = res.data.data ?? res.data;
      setProductImages((p.images || []).filter((img: any) => img.variantId === null));
      const rawVariants: any[] = p.variants ?? p.productVariants ?? [];

      setVariants(
        rawVariants.map((v: any) => ({
          variantId: v.variantId ?? v.productVariantId ?? v.id,
          sizeId: v.sizeId,
          sizeName: v.sizeName ?? v.size?.sizeName ?? `Size ${v.sizeId}`,
          colorId: v.colorId,
          colorName: v.colorName ?? v.color?.colorName ?? `Màu ${v.colorId}`,
          price: v.price ?? 0,
          stockQuantity: v.stockQuantity ?? 0,
          sku: v.sku ?? "",
          status: v.status ?? true,
        }))
      );
    } catch (e) {
      console.error("Refresh inner error:", e);
    }
    // Also notify parent (AdminDashboard) that product list might need refresh
    onRefresh();
  };

  const handleImageConfirm = async (urls: string[], setFirstAsMain: boolean) => {
    if (!urls.length) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/admin/products/${productId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          imageUrls: urls, 
          isMain: setFirstAsMain,
          variantId: null 
        }),
      });
      setMessage({ type: "success", text: `Đã cập nhật ${urls.length} ảnh chung!` });
      handleRefreshInner();
    } catch (err: any) {
      setMessage({ type: "error", text: "Gắn ảnh thất bại: " + err.message });
    } finally {
      setShowImagePicker(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/admin/products/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: "Xóa ảnh thành công!" });
      handleRefreshInner();
    } catch (err: any) {
      setMessage({ type: "error", text: "Xóa ảnh thất bại: " + err.message });
    }
  };

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
        materialId: formData.materialId ? parseInt(formData.materialId, 10) : null,
        styleId: formData.styleId ? parseInt(formData.styleId, 10) : null,
        status: formData.status,
      };

      await axios.put(`${API_URL}/admin/products/${productId}`, payload, {
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
      await axios.delete(`${API_URL}/admin/products/${productId}`, {
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full overflow-hidden min-h-0"
          >
            {/* ── Tab List ── */}
            <div className="px-7 bg-white border-b border-slate-50">
              <Tabs.List className="flex gap-8">
                <Tabs.Trigger
                  value="info"
                  className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                    activeTab === "info"
                      ? "text-emerald-500"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Thông tin cơ bản
                  {activeTab === "info" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="variants"
                  className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                    activeTab === "variants"
                      ? "text-emerald-500"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Quản lý biến thể
                  {activeTab === "variants" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
                  )}
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            <div className="p-7 overflow-y-auto flex-1 custom-scrollbar">
              {/* ── Message Banner ── */}
              {message && (
                <div
                  className={`flex items-center gap-3 p-4 mb-6 rounded-xl border text-sm font-semibold animate-in fade-in zoom-in-95 duration-300 ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </div>
              )}

              <Tabs.Content value="info" className="space-y-7 outline-none">
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

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Chất liệu">
                      <ComboBox
                        value={formData.materialId}
                        options={materials}
                        loading={optLoading}
                        placeholder="-- Chọn chất liệu --"
                        onChange={(v) => setFormData((p) => ({ ...p, materialId: v }))}
                      />
                    </Field>
                    <Field label="Kiểu dáng">
                      <ComboBox
                        value={formData.styleId}
                        options={styles}
                        loading={optLoading}
                        placeholder="-- Chọn kiểu dáng --"
                        onChange={(v) => setFormData((p) => ({ ...p, styleId: v }))}
                      />
                    </Field>
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
                
                {/* ── Section quản lý ảnh chung ── */}
                <div className="border-t border-slate-100 mt-6 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-700">Ảnh hệ thống chung</p>
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <ImagePlus size={14} />
                      Chọn ảnh chung
                    </button>
                  </div>

                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {productImages.map((img) => (
                        <div
                          key={img.imageId}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImageUrl(img.imageUrl)}
                            alt="product image"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.imageId)}
                            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-rose-500 hover:text-white text-rose-500 rounded-md shadow-sm transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa ảnh"
                          >
                            <Trash2 size={10} />
                          </button>
                          {img.isMain && (
                            <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              MAIN
                            </span>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(true)}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-300 hover:text-emerald-400 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all group"
                    >
                      <ImagePlus size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Nhấn để chọn ảnh chung từ thư viện</span>
                    </button>
                  )}
                </div>
              </Tabs.Content>

              <Tabs.Content value="variants" className="outline-none">
                <ProductVariantManager
                  productId={productId}
                  variants={variants as any}
                  sizes={sizes}
                  colors={colors}
                  onRefresh={handleRefreshInner}
                />
              </Tabs.Content>
            </div>
          </Tabs.Root>
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
            {activeTab === "info" && (
              <button
                type="submit"
                form="edit-product-form"
                disabled={submitting || deleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                Lưu thay đổi
              </button>
            )}
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
      {showImagePicker && (
        <ImagePickerModal
          title="Ảnh hệ thống chung cho sản phẩm"
          onConfirm={handleImageConfirm}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
};
