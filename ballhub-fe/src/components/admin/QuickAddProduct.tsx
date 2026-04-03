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
  Trash2,
  PackagePlus,
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
  compact = false,
}: any) => (
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    {label && (
      <label className={`font-bold text-slate-600 ${compact ? "text-[10px]" : "text-xs"}`}>
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all ${
        compact ? "py-1.5 text-xs" : "py-2.5 text-sm"
      }`}
    />
  </div>
);

/* ─── Re-usable select ───────────────────────────────────────────────────────── */
interface SelectGroupProps {
  label?: string;
  value: string;
  options: SelectOption[];
  loadingOptions?: boolean;
  placeholder?: string;
  onChange: (val: string) => void;
  compact?: boolean;
}

const SelectGroup = ({
  label,
  value,
  options,
  loadingOptions,
  placeholder = "-- Chọn --",
  onChange,
  compact = false,
}: SelectGroupProps) => (
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    {label && (
      <label className={`font-bold text-slate-600 ${compact ? "text-[10px]" : "text-xs"}`}>
        {label}
      </label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loadingOptions}
        className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pr-7 text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          !value ? "text-slate-400" : ""
        } ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm"}`}
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
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
        {loadingOptions ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <ChevronDown size={12} />
        )}
      </div>
    </div>
  </div>
);

/* ─── Variant type ───────────────────────────────────────────────────────────── */
interface VariantRow {
  id: string; // local key cho React
  sizeId: string;
  colorId: string;
  price: string;
  stockQuantity: string;
  sku: string;
}

const makeVariant = (): VariantRow => ({
  id: crypto.randomUUID(),
  sizeId: "",
  colorId: "",
  price: "",
  stockQuantity: "",
  sku: "",
});

/* ─── Form state type ─────────────────────────────────────────────────────────── */
interface BaseFormData {
  productName: string;
  description: string;
  categoryId: string;
  brandId: string;
  materialId: string;
  styleId: string;
}

const INITIAL_BASE: BaseFormData = {
  productName: "",
  description: "",
  categoryId: "",
  brandId: "",
  materialId: "",
  styleId: "",
};

/* ─── Main component ──────────────────────────────────────────────────────────── */
export const QuickAddProduct = () => {
  const { brands, categories, sizes, colors, materials, styles, loading: optLoading } = useFormOptions();

  const [baseData, setBaseData] = useState<BaseFormData>(INITIAL_BASE);
  const [variants, setVariants] = useState<VariantRow[]>([makeVariant()]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Post-creation state ──────────────────────────────────────────────────
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [pickedImages, setPickedImages] = useState<string[]>([]);

  /* ── Variant helpers ────────────────────────────────────────────────────── */
  const setVariantField = (id: string, field: keyof Omit<VariantRow, "id">, val: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const addVariant = () => setVariants((prev) => [...prev, makeVariant()]);

  const removeVariant = (id: string) => {
    if (variants.length === 1) return; // luôn giữ ít nhất 1
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const duplicateVariant = (row: VariantRow) => {
    setVariants((prev) => [
      ...prev,
      { ...row, id: crypto.randomUUID(), sku: "" }, // SKU phải unique
    ]);
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { productName, description, categoryId, brandId, materialId, styleId } = baseData;

    if (!productName || !description || !categoryId || !brandId) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ thông tin sản phẩm" });
      setLoading(false);
      return;
    }

    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sizeId || !v.colorId || !v.price || !v.stockQuantity || !v.sku) {
        setMessage({
          type: "error",
          text: `Biến thể #${i + 1}: Vui lòng điền đầy đủ Size, Màu, Giá, Số lượng và SKU`,
        });
        setLoading(false);
        return;
      }
    }

    // Check duplicate SKU
    const skus = variants.map((v) => v.sku.trim());
    const uniqueSkus = new Set(skus);
    if (uniqueSkus.size !== skus.length) {
      setMessage({ type: "error", text: "SKU trong danh sách biến thể bị trùng lặp" });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productName,
        description,
        categoryId: parseInt(categoryId),
        brandId: parseInt(brandId),
        materialId: materialId ? parseInt(materialId) : null,
        styleId: styleId ? parseInt(styleId) : null,
        variants: variants.map((v) => ({
          sizeId: parseInt(v.sizeId),
          colorId: parseInt(v.colorId),
          price: parseInt(v.price),
          stockQuantity: parseInt(v.stockQuantity),
          sku: v.sku.trim(),
        })),
      };

      const response = await axios.post("/admin/products", payload);

      if (response.status === 200 || response.status === 201) {
        const newProductId = response.data?.data?.productId ?? null;
        setCreatedProductId(newProductId);
        setPickedImages([]);
        setMessage({
          type: "success",
          text: `Tạo sản phẩm thành công với ${variants.length} biến thể!${
            newProductId ? ` (ID: ${newProductId})` : ""
          } Hãy chọn ảnh bên dưới.`,
        });
        setBaseData(INITIAL_BASE);
        setVariants([makeVariant()]);
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
      const token = localStorage.getItem("accessToken");
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
        {/* ── Header ── */}
        <div className="flex items-center gap-2 text-emerald-600">
          <PackagePlus size={20} strokeWidth={2.5} />
          <h3 className="font-bold text-slate-800">Thêm sản phẩm nhanh</h3>
        </div>

        {/* ── Message banner ── */}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ════════════════════════════════════════
              PHẦN 1: Thông tin cơ bản sản phẩm
          ════════════════════════════════════════ */}
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
              Thông tin sản phẩm
            </p>

            <InputGroup
              label="Tên sản phẩm *"
              placeholder="VD: Giày đá bóng Nike Mercurial..."
              value={baseData.productName}
              onChange={(e: any) => setBaseData((p) => ({ ...p, productName: e.target.value }))}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Mô tả *</label>
              <textarea
                placeholder="Mô tả ngắn về sản phẩm..."
                value={baseData.description}
                onChange={(e) => setBaseData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all resize-none text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectGroup
                label="Danh mục *"
                value={baseData.categoryId}
                options={categories}
                loadingOptions={optLoading}
                placeholder="-- Chọn danh mục --"
                onChange={(val) => setBaseData((p) => ({ ...p, categoryId: val }))}
              />
              <SelectGroup
                label="Thương hiệu *"
                value={baseData.brandId}
                options={brands}
                loadingOptions={optLoading}
                placeholder="-- Chọn thương hiệu --"
                onChange={(val) => setBaseData((p) => ({ ...p, brandId: val }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectGroup
                label="Chất liệu"
                value={baseData.materialId}
                options={materials}
                loadingOptions={optLoading}
                placeholder="-- Chọn chất liệu --"
                onChange={(val) => setBaseData((p) => ({ ...p, materialId: val }))}
              />
              <SelectGroup
                label="Kiểu dáng"
                value={baseData.styleId}
                options={styles}
                loadingOptions={optLoading}
                placeholder="-- Chọn kiểu dáng --"
                onChange={(val) => setBaseData((p) => ({ ...p, styleId: val }))}
              />
            </div>
          </div>

          {/* ════════════════════════════════════════
              PHẦN 2: Danh sách biến thể
          ════════════════════════════════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                Biến thể sản phẩm{" "}
                <span className="ml-1 bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-[10px] normal-case font-bold tracking-normal">
                  {variants.length}
                </span>
              </p>
            </div>

            {/* Container bọc bảng biến thể để cuộn ngang nếu màn hình nhỏ */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white p-1">
              <div className="overflow-x-auto custom-scrollbar-horizontal pb-2">
                <div className="min-w-[650px] space-y-2">
                  {/* ── Header của bảng biến thể (Sticky) ── */}
                  <div className="grid grid-cols-[1.2fr_1.2fr_100px_70px_120px_60px] gap-2 px-3 py-2 bg-slate-50/50 rounded-xl">
                    {["Size", "Màu", "Giá (₫)", "SL", "SKU", "H.động"].map((h) => (
                      <span key={h} className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* ── Các dòng biến thể (Scroll dọc bên trong) ── */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar px-1">
                    {variants.map((v) => (
                      <div
                        key={v.id}
                        className="group grid grid-cols-[1.2fr_1.2fr_100px_70px_120px_60px] gap-2 items-center bg-white rounded-xl px-2 py-2 border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        {/* Size */}
                        <SelectGroup
                          value={v.sizeId}
                          options={sizes}
                          loadingOptions={optLoading}
                          placeholder="Chọn Size"
                          compact
                          onChange={(val) => setVariantField(v.id, "sizeId", val)}
                        />

                        {/* Màu */}
                        <SelectGroup
                          value={v.colorId}
                          options={colors}
                          loadingOptions={optLoading}
                          placeholder="Chọn Màu"
                          compact
                          onChange={(val) => setVariantField(v.id, "colorId", val)}
                        />

                        {/* Giá */}
                        <InputGroup
                          placeholder="Giá"
                          type="number"
                          value={v.price}
                          compact
                          onChange={(e: any) => setVariantField(v.id, "price", e.target.value)}
                        />

                        {/* Số lượng */}
                        <InputGroup
                          placeholder="SL"
                          type="number"
                          value={v.stockQuantity}
                          compact
                          onChange={(e: any) => setVariantField(v.id, "stockQuantity", e.target.value)}
                        />

                        {/* SKU */}
                        <InputGroup
                          placeholder="SKU"
                          value={v.sku}
                          compact
                          onChange={(e: any) => setVariantField(v.id, "sku", e.target.value)}
                        />

                        {/* Action buttons */}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Xóa"
                            onClick={() => removeVariant(v.id)}
                            disabled={variants.length === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            type="button"
                            title="Nhân đôi"
                            onClick={() => duplicateVariant(v)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Nút thêm biến thể (dạng dashed) ── */}
            <button
              type="button"
              onClick={addVariant}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all text-xs font-bold"
            >
              <Plus size={16} strokeWidth={3} />
              Thêm biến thể mới
            </button>
          </div>

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
            {loading
              ? "Đang lưu..."
              : optLoading
              ? "Đang tải dữ liệu..."
              : `Lưu sản phẩm (${variants.length} biến thể)`}
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
