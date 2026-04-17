"use client";

import React from "react";
import {
  Edit2,
  Trash2,
  Package,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { ImagePickerModal } from "./ImagePickerModal";
import axios from "axios";
import { toast } from "sonner";

const BACKEND = "http://localhost:8080";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

interface Variant {
  variantId: number;
  productId: number;
  productName: string;
  productImage: string;
  sizeName: string;
  colorName: string;
  price: number;
  stockQuantity: number;
  sku: string;
  status: boolean;
  images?: { imageId: number; imageUrl: string; isMain: boolean }[];
}

interface VariantTableProps {
  variants: Variant[];
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onEdit: (v: Variant) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (v: Variant) => void;
  onAddNew?: () => void;
  onRefresh: () => void;
}

export const GlobalVariantTable = ({
  variants,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
  onRefresh,
}: VariantTableProps) => {
  const [openingImagePickerFor, setOpeningImagePickerFor] = React.useState<{ variantId: number; productId: number } | null>(null);
  const [loadingAction, setLoadingAction] = React.useState<number | null>(null);

  const handleImageConfirm = async (urls: string[], setFirstAsMain: boolean) => {
    if (!urls.length || !openingImagePickerFor) return;

    try {
      const token = getToken();
      await axios.post(`${BACKEND}/api/admin/products/${openingImagePickerFor.productId}/images`, {
        imageUrls: urls,
        isMain: setFirstAsMain,
        variantId: openingImagePickerFor.variantId
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
  return (
    <div className="flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white px-8 py-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Quản lý biến thể
            <span className="bg-emerald-50 text-emerald-600 px-3 py-0.5 rounded-full text-xs font-black">
              {totalElements || 0}
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Toàn bộ kho hàng của tất cả sản phẩm</p>
        </div>
        
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100"
        >
          <Plus size={18} />
          Thêm biến thể mới
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Sản phẩm</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ảnh biến thể</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Phân loại</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Giá bán</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Kho</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {variants.map((v) => (
                <tr key={v.variantId} className="group hover:bg-slate-50/50 transition-all duration-200">
                  <td className="px-6 py-4 text-xs font-bold text-slate-300">#{v.variantId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                        {v.productImage ? (
                          <img src={`http://localhost:8080${v.productImage}`} alt={v.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col max-w-[200px]">
                        <span className="text-sm font-bold text-slate-800 truncate" title={v.productName}>
                          {v.productName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">Product ID: {v.productId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[240px] pb-1">
                      <div className="flex gap-2 shrink-0">
                        {(v.images || []).map((img) => (
                          <div
                            key={img.imageId}
                            className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden group/img shrink-0 shadow-sm"
                          >
                            <img
                              src={`${BACKEND}${img.imageUrl}`}
                              alt="variant"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(img.imageId);
                              }}
                              className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpeningImagePickerFor({
                            variantId: v.variantId,
                            productId: v.productId,
                          });
                        }}
                        className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all shrink-0 bg-slate-50/50"
                      >
                        <ImagePlus size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {v.sizeName}
                      </span>
                      <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {v.colorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800">
                      {v.price?.toLocaleString()}đ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black ${v.stockQuantity === 0 ? "text-rose-500" : "text-slate-600"}`}>
                      {v.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 tracking-tighter">
                      {v.sku}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggleStatus(v)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all active:scale-95 ${
                        v.status
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {v.status ? <Eye size={10} /> : <EyeOff size={10} />}
                      {v.status ? "HIỆN" : "ẨN"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(v)}
                        className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(v.variantId)}
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {variants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-400 text-sm font-medium">
                    Không tìm thấy biến thể sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-medium">
            Hiển thị <span className="text-slate-800 font-bold">{variants.length}</span> trên <span className="text-slate-800 font-bold">{totalElements || 0}</span> biến thể
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-500 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => onPageChange(i)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    page === i
                      ? "bg-emerald-500 text-white"
                      : "bg-white border border-slate-100 text-slate-400 hover:text-emerald-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-emerald-500 disabled:opacity-50 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      {openingImagePickerFor && (
        <ImagePickerModal
          onClose={() => setOpeningImagePickerFor(null)}
          onConfirm={handleImageConfirm}
          multiple={true}
        />
      )}
    </div>
  );
};
