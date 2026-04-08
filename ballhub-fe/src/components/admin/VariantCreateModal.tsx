"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Package, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useFormOptions } from "@/lib/useFormOptions";

interface ProductOption {
  productId: number;
  productName: string;
}

interface VariantCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BACKEND = "http://localhost:8080";
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

export const VariantCreateModal = ({
  onClose,
  onSuccess,
}: VariantCreateModalProps) => {
  const { sizes, colors, loading: optionsLoading } = useFormOptions();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    productId: "" as number | "",
    sizeId: "" as number | "",
    colorId: "" as number | "",
    price: "" as number | "",
    stockQuantity: "" as number | "",
    sku: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getToken();
        // Fetching more products or a specific 'all' endpoint if exists
        // Here we try to fetch a reasonably large number for selection
        const res = await axios.get(`${BACKEND}/api/products?size=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const content = res.data.data?.content || res.data.content || [];
        setProducts(content.map((p: any) => ({
          productId: p.productId,
          productName: p.productName
        })));
      } catch (error) {
        console.error("Fetch products error:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.sizeId || !formData.colorId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      await axios.post(
        `${BACKEND}/api/admin/products/${formData.productId}/variants`,
        {
          sizeId: formData.sizeId,
          colorId: formData.colorId,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          sku: formData.sku,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Thêm biến thể thành công");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm biến thể");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Thêm biến thể mới</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tạo biến thể cho sản phẩm có sẵn</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Chọn sản phẩm *</label>
            <div className="relative">
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>{p.productName}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                {loadingProducts ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kích cỡ (Size) *</label>
              <select
                value={formData.sizeId}
                onChange={(e) => setFormData({ ...formData, sizeId: Number(e.target.value) })}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">-- Chọn Size --</option>
                {sizes.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Màu sắc *</label>
              <select
                value={formData.colorId}
                onChange={(e) => setFormData({ ...formData, colorId: Number(e.target.value) })}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">-- Chọn Màu --</option>
                {colors.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Giá bán (₫) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="VD: 550000"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Số lượng kho *</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                placeholder="VD: 50"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SKU (Tùy chọn)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="VD: ADI-PRED-RED-40"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-emerald-50 focus:border-emerald-500 transition-all"
            />
            <p className="text-[10px] text-slate-400 italic px-1">Để trống hệ thống sẽ tự sinh SKU</p>
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
              disabled={submitting || optionsLoading}
              className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Tạo biến thể
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
