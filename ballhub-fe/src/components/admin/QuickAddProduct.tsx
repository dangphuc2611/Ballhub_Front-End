"use client";

import { useState } from "react";
import {
  Plus,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import axios from "@/lib/axios";
import { ImagePickerModal } from "./ImagePickerModal";
import { useFormOptions } from "@/lib/useFormOptions";
import type { SelectOption } from "@/lib/useFormOptions";

const BACKEND = "http://localhost:8080";

/* ─── Re-usable input ───────────────────────────────────────────────────────── */
const InputGroup = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-xs font-bold text-slate-600">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all text-slate-700"
    />
  </div>
);

/* ─── Re-usable select ───────────────────────────────────────────────────────── */
interface SelectGroupProps {
  label: string;
  value: string;
  options: SelectOption[];
  loadingOptions?: boolean;
  placeholder?: string;
  onChange: (val: string) => void;
}

const SelectGroup = ({
  label,
  value,
  options,
  loadingOptions,
  placeholder = "-- Chọn --",
  onChange,
}: SelectGroupProps) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-xs font-bold text-slate-600">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loadingOptions}
        className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-9 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all text-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          !value ? "text-slate-400" : ""
        }`}
      >
        <option value="" disabled>
          {loadingOptions ? "Đang tải..." : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        {loadingOptions ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ChevronDown size={14} />
        )}
      </div>
    </div>
  </div>
);

/* ─── Form state type ─────────────────────────────────────────────────────────── */
interface FormData {
  productName: string;
  description: string;
  categoryId: string;
  brandId: string;
  price: string;
  stockQuantity: string;
  sizeId: string;
  colorId: string;
  sku: string;
}

const INITIAL_FORM: FormData = {
  productName: "",
  description: "",
  categoryId: "",
  brandId: "",
  price: "",
  stockQuantity: "",
  sizeId: "",
  colorId: "",
  sku: "",
};

/* ─── Main component ──────────────────────────────────────────────────────────── */
export const QuickAddProduct = () => {
  const { brands, categories, sizes, colors, loading: optLoading } = useFormOptions();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Post-creation state ──────────────────────────────────────────────────
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [pickedImages, setPickedImages] = useState<string[]>([]);

  const set = (field: keyof FormData) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { productName, description, categoryId, brandId, price, stockQuantity, sizeId, colorId, sku } = formData;

    if (!productName || !description || !categoryId || !brandId || !price || !stockQuantity || !sizeId || !colorId || !sku) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ tất cả các trường" });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productName,
        description,
        categoryId: parseInt(categoryId),
        brandId: parseInt(brandId),
        variants: [
          {
            sizeId: parseInt(sizeId),
            colorId: parseInt(colorId),
            price: parseInt(price),
            stockQuantity: parseInt(stockQuantity),
            sku,
          },
        ],
      };

      const response = await axios.post("/admin/products", payload);

      if (response.status === 200 || response.status === 201) {
        const newProductId = response.data?.data?.productId ?? null;
        setCreatedProductId(newProductId);
        setPickedImages([]);
        setMessage({
          type: "success",
          text: `Sản phẩm đã tạo thành công!${newProductId ? ` (ID: ${newProductId})` : ""} Hãy chọn ảnh bên dưới.`,
        });
        setFormData(INITIAL_FORM);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi khi thêm sản phẩm";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  /* ── Confirm image selection ──────────────────────────────────────────── */
  const handleImageConfirm = async (urls: string[], setFirstAsMain: boolean) => {
    setPickedImages(urls);
    if (!createdProductId || urls.length === 0) return;

    try {
      const token = localStorage.getItem("refreshToken");
      await fetch(`${BACKEND}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrls: urls, isMain: setFirstAsMain }),
      });
      setMessage({
        type: "success",
        text: `Đã gắn ${urls.length} ảnh cho sản phẩm #${createdProductId} thành công!`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: "Gắn ảnh thất bại: " + err.message });
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 sticky top-8">
        {/* Header */}
        <div className="flex items-center gap-2 text-emerald-600">
          <Plus size={20} strokeWidth={3} />
          <h3 className="font-bold text-slate-800">Thêm sản phẩm nhanh</h3>
        </div>

        {/* Message banner */}
        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-xl text-sm font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-700 border-red-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Tên sản phẩm ── */}
          <InputGroup
            label="Tên sản phẩm *"
            placeholder="VD: Giày đá bóng Nike Mercurial..."
            value={formData.productName}
            onChange={(e: any) => set("productName")(e.target.value)}
          />

          {/* ── Mô tả ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Mô tả *</label>
            <textarea
              placeholder="Mô tả ngắn về sản phẩm..."
              value={formData.description}
              onChange={(e) => set("description")(e.target.value)}
              rows={3}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all resize-none text-slate-700"
            />
          </div>

          {/* ── Danh mục & Thương hiệu ── */}
          <div className="grid grid-cols-2 gap-3">
            <SelectGroup
              label="Danh mục *"
              value={formData.categoryId}
              options={categories}
              loadingOptions={optLoading}
              placeholder="-- Chọn danh mục --"
              onChange={set("categoryId")}
            />
            <SelectGroup
              label="Thương hiệu *"
              value={formData.brandId}
              options={brands}
              loadingOptions={optLoading}
              placeholder="-- Chọn thương hiệu --"
              onChange={set("brandId")}
            />
          </div>

          {/* ── Giá & Số lượng ── */}
          <div className="grid grid-cols-2 gap-3">
            <InputGroup
              label="Giá (VNĐ) *"
              placeholder="VD: 1290000"
              type="number"
              value={formData.price}
              onChange={(e: any) => set("price")(e.target.value)}
            />
            <InputGroup
              label="Số lượng *"
              placeholder="VD: 10"
              type="number"
              value={formData.stockQuantity}
              onChange={(e: any) => set("stockQuantity")(e.target.value)}
            />
          </div>

          {/* ── Size & Màu ── */}
          <div className="grid grid-cols-2 gap-3">
            <SelectGroup
              label="Size *"
              value={formData.sizeId}
              options={sizes}
              loadingOptions={optLoading}
              placeholder="-- Chọn size --"
              onChange={set("sizeId")}
            />
            <SelectGroup
              label="Màu sắc *"
              value={formData.colorId}
              options={colors}
              loadingOptions={optLoading}
              placeholder="-- Chọn màu --"
              onChange={set("colorId")}
            />
          </div>

          {/* ── SKU ── */}
          <InputGroup
            label="SKU *"
            placeholder="VD: NIKE-MERCURIAL-39-RED"
            value={formData.sku}
            onChange={(e: any) => set("sku")(e.target.value)}
          />

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading || optLoading}
            className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            {loading ? "Đang lưu..." : optLoading ? "Đang tải dữ liệu..." : "Lưu & Hiển thị ngay"}
          </button>
        </form>

        {/* ── Section ảnh — chỉ hiện sau khi tạo sản phẩm thành công ── */}
        {createdProductId && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">
                Ảnh sản phẩm{" "}
                <span className="text-slate-400 font-normal">(ID: {createdProductId})</span>
              </p>
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
              >
                <ImagePlus size={14} />
                Chọn ảnh
              </button>
            </div>

            {pickedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {pickedImages.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${BACKEND}${url}`}
                      alt={url.split("/").pop()}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setPickedImages((prev) => prev.filter((u) => u !== url))
                      }
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                    >
                      <X size={10} />
                    </button>
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
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-5 flex flex-col items-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all group"
              >
                <ImagePlus
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-semibold">Nhấn để chọn ảnh từ thư viện</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Image Picker Modal ───────────────────────────────────────────── */}
      {showImagePicker && (
        <ImagePickerModal
          onConfirm={handleImageConfirm}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </>
  );
};
