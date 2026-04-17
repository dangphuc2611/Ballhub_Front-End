"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { SelectOption } from "@/lib/useFormOptions";
import { ImagePickerModal } from "./ImagePickerModal";
import { ImagePlus } from "lucide-react";

const BACKEND = "http://localhost:8080";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

interface Variant {
  variantId: number;
  sizeId: number;
  sizeName: string;
  colorId: number;
  colorName: string;
  price: number;
  stockQuantity: number;
  sku: string;
  status: boolean;
  images?: { imageId: number; imageUrl: string; isMain: boolean }[];
}

interface ProductVariantManagerProps {
  productId: number;
  variants: Variant[];
  sizes: SelectOption[];
  colors: SelectOption[];
  onRefresh: () => void;
}

interface EditingState {
  id: number | "new";
  data: Partial<Variant>;
}

export const ProductVariantManager = ({
  productId,
  variants,
  sizes,
  colors,
  onRefresh,
}: ProductVariantManagerProps) => {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [loading, setLoading] = useState<number | "new" | null>(null);
  const [openingImagePickerFor, setOpeningImagePickerFor] = useState<number | null>(null);

  const handleImageConfirm = async (urls: string[], setFirstAsMain: boolean) => {
    if (!urls.length || openingImagePickerFor === null) return;
    
    try {
      const token = getToken();
      await fetch(`${BACKEND}/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          imageUrls: urls, 
          isMain: setFirstAsMain,
          variantId: openingImagePickerFor 
        }),
      });
      toast.success(`Đã gắn ${urls.length} ảnh thành công!`);
      onRefresh();
    } catch (err: any) {
      toast.error("Gắn ảnh thất bại: " + err.message);
    } finally {
      setOpeningImagePickerFor(null);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
    try {
      const token = getToken();
      await axios.delete(`${BACKEND}/api/admin/products/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa ảnh thành công");
      onRefresh();
    } catch (err: any) {
      toast.error("Xóa ảnh thất bại: " + err.message);
    }
  };

  const handleStartEdit = (v: Variant) => {
    setEditing({ id: v.variantId, data: { ...v } });
  };

  const handleStartAdd = () => {
    setEditing({
      id: "new",
      data: {
        sizeId: sizes[0] ? parseInt(sizes[0].value) : 0,
        colorId: colors[0] ? parseInt(colors[0].value) : 0,
        price: 0,
        stockQuantity: 0,
        sku: "",
        status: true,
      },
    });
  };

  const handleCancel = () => {
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const isNew = editing.id === "new";
    setLoading(isNew ? "new" : editing.id);

    try {
      const token = getToken();
      if (isNew) {
        await axios.post(
          `${BACKEND}/api/admin/products/${productId}/variants`,
          {
            sizeId: editing.data.sizeId,
            colorId: editing.data.colorId,
            price: editing.data.price,
            stockQuantity: editing.data.stockQuantity,
            sku: editing.data.sku,
            status: true, // Mặc định tạo mới là hiện
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Thêm biến thể thành công");
      } else {
        await axios.put(
          `${BACKEND}/api/admin/variants/${editing.id}`,
          {
            price: editing.data.price,
            stockQuantity: editing.data.stockQuantity,
            status: editing.data.status !== false, // Ép kiểu an toàn
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Cập nhật biến thể thành công");
      }
      setEditing(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi thao tác");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa biến thể này?")) return;
    setLoading(variantId);
    try {
      const token = getToken();
      await axios.delete(`${BACKEND}/api/admin/variants/${variantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa biến thể thành công");
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xóa biến thể");
    } finally {
      setLoading(null);
    }
  };

  const handleToggleStatus = async (v: Variant) => {
    setLoading(v.variantId);
    try {
      const token = getToken();
      const currentStatus = v.status !== false; // Mặc định là true nếu null
      await axios.put(
        `${BACKEND}/api/admin/variants/${v.variantId}`,
        {
          price: v.price,
          stockQuantity: v.stockQuantity,
          status: !currentStatus, // Đảo ngược trạng thái hiện tại
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${currentStatus ? "Đã ẩn" : "Đã hiện"} biến thể thành công`);
      onRefresh();
    } catch (error: any) {
      toast.error("Lỗi cập nhật trạng thái, vui lòng thử lại!");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            Danh sách biến thể
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {variants.length}
            </span>
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Quản lý kích thước, màu sắc và kho hàng</p>
        </div>
        <button
          onClick={handleStartAdd}
          disabled={!!editing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-100"
        >
          <Plus size={14} /> Thêm biến thể
        </button>
      </div> */}

      <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-12">#</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Size / Màu</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Giá bán (đ)</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Kho</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">SKU</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ảnh</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Trạng thái</th>
              <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Hàng tạo mới biến thể */}
            {editing?.id === "new" && (
              <tr className="bg-emerald-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <td className="px-5 py-4 text-center">
                  <Plus size={14} className="text-emerald-500 animate-pulse mx-auto" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <select
                      value={editing.data.sizeId}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: { ...editing.data, sizeId: parseInt(e.target.value) },
                        })
                      }
                      className="text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-100 outline-none"
                    >
                      {sizes.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editing.data.colorId}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          data: { ...editing.data, colorId: parseInt(e.target.value) },
                        })
                      }
                      className="text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-100 outline-none"
                    >
                      {colors.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <input
                    type="number"
                    value={editing.data.price}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, price: parseFloat(e.target.value) },
                      })
                    }
                    className="w-full text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                  />
                </td>
                <td className="px-5 py-4">
                  <input
                    type="number"
                    value={editing.data.stockQuantity}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, stockQuantity: parseInt(e.target.value) },
                      })
                    }
                    className="w-20 text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                </td>
                <td className="px-5 py-4">
                  <input
                    type="text"
                    placeholder="Auto-gen if empty"
                    value={editing.data.sku}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: { ...editing.data, sku: e.target.value },
                      })
                    }
                    className="w-full text-[10px] border border-emerald-200 bg-white rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-100 outline-none font-mono"
                  />
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="text-[10px] text-slate-400 font-medium">Lưu trước</span>
                </td>
                <td className="px-5 py-4 text-center">—</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={handleSave}
                      disabled={loading === "new"}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      {loading === "new" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {variants.length === 0 && editing?.id !== "new" && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Chưa có biến thể nào được tạo.</p>
                </td>
              </tr>
            )}

            {variants.map((v, idx) => {
              // ✅ FIX LOGIC TRẠNG THÁI Ở ĐÂY: Nếu không bằng false thì mặc định là đang HIỆN
              const isVisible = v.status !== false;

              return (
                <tr
                  key={v.variantId}
                  className={`hover:bg-slate-50/50 transition-colors group ${!isVisible ? "opacity-60 bg-slate-50/30" : ""}`}
                >
                  <td className="px-5 py-4 text-xs font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                        {v.sizeName}
                      </span>
                      <span className="text-slate-200">/</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                        {v.colorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {editing?.id === v.variantId ? (
                      <input
                        type="number"
                        value={editing.data.price}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, price: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-800">{v.price?.toLocaleString()}đ</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {editing?.id === v.variantId ? (
                      <input
                        type="number"
                        value={editing.data.stockQuantity}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, stockQuantity: parseInt(e.target.value) },
                          })
                        }
                        className="w-20 text-xs border border-emerald-200 bg-white rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-100 outline-none"
                      />
                    ) : (
                      <span
                        className={`text-xs font-black ${v.stockQuantity === 0 ? "text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full" : "text-slate-600"}`}
                      >
                        {v.stockQuantity}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group-hover:bg-white">{v.sku}</span>
                  </td>
                  <td className="px-5 py-4 min-w-[120px]">
                    <div className="flex items-center gap-1.5 flex-wrap max-w-[150px]">
                      {v.images && v.images.length > 0 ? (
                        <>
                          {v.images.map((img) => (
                            <div key={img.imageId} className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden group/img">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`${BACKEND}${img.imageUrl}`} alt="thumb" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.imageId)}
                                className="absolute inset-0 flex items-center justify-center bg-rose-500/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                title="Xóa ảnh"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setOpeningImagePickerFor(v.variantId)}
                            disabled={openingImagePickerFor !== null}
                            className="w-8 h-8 shrink-0 flex items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-all disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpeningImagePickerFor(v.variantId)}
                          disabled={openingImagePickerFor !== null}
                          className="w-8 h-8 flex items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ImagePlus size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {/* ✅ GIAO DIỆN NÚT TRẠNG THÁI HIỆN/ẨN ĐÃ ĐƯỢC LÀM RÕ RÀNG */}
                    <button
                      onClick={() => handleToggleStatus(v)}
                      disabled={loading === v.variantId}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all active:scale-90 ${
                        isVisible
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                      }`}
                    >
                      {loading === v.variantId ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : isVisible ? (
                        <Eye size={10} />
                      ) : (
                        <EyeOff size={10} />
                      )}
                      {isVisible ? "HIỆN" : "ẨN"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editing?.id === v.variantId ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={loading === v.variantId}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm"
                          >
                            {loading === v.variantId ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(v)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.variantId)}
                            disabled={loading === v.variantId}
                            className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Xóa"
                          >
                            {loading === v.variantId ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openingImagePickerFor !== null && (
        <ImagePickerModal
          title={`Ảnh cho biến thể ID: ${openingImagePickerFor}`}
          onConfirm={handleImageConfirm}
          onClose={() => setOpeningImagePickerFor(null)}
        />
      )}
    </div>
  );
};