"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Variant {
  variantId: number;
  productName: string;
  sizeName: string;
  colorName: string;
  price: number;
  stockQuantity: number;
  sku: string;
  status: boolean;
}

interface VariantEditModalProps {
  variant: Variant;
  onClose: () => void;
  onSuccess: () => void;
}

const BACKEND = "http://localhost:8080";
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

export const VariantEditModal = ({
  variant,
  onClose,
  onSuccess,
}: VariantEditModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    price: variant.price,
    stockQuantity: variant.stockQuantity,
    status: variant.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getToken();
      await axios.put(
        `${BACKEND}/api/admin/variants/${variant.variantId}`,
        {
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          status: formData.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật biển thể thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật biến thể");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Sửa biến thể</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{variant.productName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Size</label>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">{variant.sizeName}</div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Màu sắc</label>
              <div className="px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">{variant.colorName}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Giá bán (₫)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Số lượng tồn kho</label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <input
              type="checkbox"
              id="status-edit"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="w-5 h-5 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="status-edit" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
              Hiển thị biến thể này
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
