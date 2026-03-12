"use client";

import { useState } from "react";
import {
  Plus,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  X,
} from "lucide-react";
import axios from "@/lib/axios";
import { ImagePickerModal } from "./ImagePickerModal";

const BACKEND = "http://localhost:8080";

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

interface ApiResponse {
  success: boolean;
  message: string;
}

const InputGroup = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: any) => (
  <div className="flex flex-col gap-2 flex-1">
    <label className="text-xs font-bold text-slate-700">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-all"
    />
  </div>
);

export const QuickAddProduct = () => {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    description: "",
    categoryId: "",
    brandId: "",
    price: "",
    stockQuantity: "",
    sizeId: "",
    colorId: "",
    sku: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Trạng thái sau khi tạo sản phẩm ──────────────────────────────────────
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // ── Danh sách ảnh đã chọn (preview) ──────────────────────────────────────
  const [pickedImages, setPickedImages] = useState<string[]>([]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (
        !formData.productName ||
        !formData.description ||
        !formData.categoryId ||
        !formData.brandId ||
        !formData.price ||
        !formData.stockQuantity ||
        !formData.sizeId ||
        !formData.colorId ||
        !formData.sku
      ) {
        setMessage({
          type: "error",
          text: "Vui lòng điền đầy đủ tất cả các trường",
        });
        setLoading(false);
        return;
      }

      const payload = {
        productName: formData.productName,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        variants: [
          {
            sizeId: parseInt(formData.sizeId),
            colorId: parseInt(formData.colorId),
            price: parseInt(formData.price),
            stockQuantity: parseInt(formData.stockQuantity),
            sku: formData.sku,
          },
        ],
      };

      const response = await axios.post("/admin/products", payload);

      if (response.status === 200 || response.status === 201) {
        const newProductId = response.data?.data?.productId ?? null;
        setCreatedProductId(newProductId);
        setMessage({
          type: "success",
          text: `Sản phẩm đã tạo thành công! ${newProductId ? `(ID: ${newProductId})` : ""} — Bây giờ bạn có thể chọn ảnh cho sản phẩm.`,
        });
        // Reset form
        setFormData({
          productName: "",
          description: "",
          categoryId: "",
          brandId: "",
          price: "",
          stockQuantity: "",
          sizeId: "",
          colorId: "",
          sku: "",
        });
        setPickedImages([]);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi thêm sản phẩm";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // ── Xử lý khi chọn ảnh xong ──────────────────────────────────────────────
  const handleImageConfirm = async (urls: string[], setFirstAsMain: boolean) => {
    setPickedImages(urls);

    if (!createdProductId || urls.length === 0) return;

    try {
      const token = localStorage.getItem("refreshToken");
      await fetch(
        `${BACKEND}/api/admin/products/${createdProductId}/images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrls: urls, isMain: setFirstAsMain }),
        }
      );
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
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 sticky top-8">
        <div className="flex items-center gap-2 text-emerald-600">
          <Plus size={20} strokeWidth={3} />
          <h3 className="font-bold text-slate-800">Thêm nhanh</h3>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputGroup
            label="Tên sản phẩm"
            placeholder="Ví dụ: Giày đá bóng Adidas..."
            value={formData.productName}
            onChange={(e: any) =>
              handleInputChange("productName", e.target.value)
            }
          />

          <InputGroup
            label="Mô tả"
            placeholder="Ví dụ: Giày đá bóng sân cỏ nhân tạo..."
            value={formData.description}
            onChange={(e: any) =>
              handleInputChange("description", e.target.value)
            }
          />

          <div className="flex gap-4 flex-col">
            <InputGroup
              label="ID Danh mục"
              placeholder="1"
              type="number"
              value={formData.categoryId}
              onChange={(e: any) =>
                handleInputChange("categoryId", e.target.value)
              }
            />
            <InputGroup
              label="ID Thương hiệu"
              placeholder="2"
              type="number"
              value={formData.brandId}
              onChange={(e: any) => handleInputChange("brandId", e.target.value)}
            />
          </div>

          <div className="flex gap-4 flex-col">
            <InputGroup
              label="Giá"
              placeholder="1290000"
              type="number"
              value={formData.price}
              onChange={(e: any) => handleInputChange("price", e.target.value)}
            />
            <InputGroup
              label="Số lượng"
              placeholder="10"
              type="number"
              value={formData.stockQuantity}
              onChange={(e: any) =>
                handleInputChange("stockQuantity", e.target.value)
              }
            />
          </div>

          <div className="flex gap-4 flex-col">
            <InputGroup
              label="ID Size"
              placeholder="1"
              type="number"
              value={formData.sizeId}
              onChange={(e: any) => handleInputChange("sizeId", e.target.value)}
            />
            <InputGroup
              label="ID Màu"
              placeholder="3"
              type="number"
              value={formData.colorId}
              onChange={(e: any) =>
                handleInputChange("colorId", e.target.value)
              }
            />
          </div>

          <InputGroup
            label="SKU"
            placeholder="PRED-39-RED"
            value={formData.sku}
            onChange={(e: any) => handleInputChange("sku", e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 disabled:bg-slate-400 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {loading ? "Đang lưu..." : "Lưu & Hiển thị ngay"}
          </button>
        </form>

        {/* ── Phần chọn ảnh — chỉ hiện sau khi sản phẩm đã được tạo ─────── */}
        {createdProductId && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">
                Ảnh sản phẩm{" "}
                <span className="text-slate-400 font-normal">
                  (ID: {createdProductId})
                </span>
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
                {/* Add more */}
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
                <span className="text-xs font-semibold">
                  Nhấn để chọn ảnh từ thư viện
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Image Picker Modal ─────────────────────────────────────────────── */}
      {showImagePicker && (
        <ImagePickerModal
          onConfirm={handleImageConfirm}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </>
  );
};
