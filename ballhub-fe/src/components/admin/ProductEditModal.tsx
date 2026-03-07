"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

type ProductEditModalProps = {
  productId: number;
  onClose: () => void;
  onRefresh: () => void;
};

export const ProductEditModal = ({ productId, onClose, onRefresh }: ProductEditModalProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    categoryId: "",
    brandId: "",
    status: true,
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await axios.get(`http://localhost:8080/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const p = res.data.data ?? res.data;
        setFormData({
          productName: p.productName || "",
          description: p.description || "",
          categoryId: p.categoryId ? p.categoryId.toString() : "",
          brandId: p.brandId ? p.brandId.toString() : "",
          status: p.status ?? true,
        });
      } catch (error: any) {
        console.error("Fetch product details error:", error);
        setMessage({
          type: "error",
          text: "Không thể tải thông tin sản phẩm",
        });
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (!formData.productName || !formData.categoryId || !formData.brandId) {
        setMessage({ type: "error", text: "Vui lòng điền các trường bắt buộc (Tên, Category ID, Brand ID)" });
        setSubmitting(false);
        return;
      }

      const payload = {
        productName: formData.productName,
        description: formData.description,
        categoryId: parseInt(formData.categoryId, 10),
        brandId: parseInt(formData.brandId, 10),
        status: formData.status,
      };

      const token = localStorage.getItem("refreshToken");
      await axios.put(`http://localhost:8080/api/admin/products/${productId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: "success", text: "Cập nhật sản phẩm thành công!" });
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật thất bại";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.")) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("refreshToken");
      await axios.delete(`http://localhost:8080/api/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: "success", text: "Đã xóa sản phẩm thành công!" });
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Xóa thất bại";
      setMessage({ type: "error", text: errorMessage });
      setDeleting(false);
    }
  };

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
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cập nhật sản phẩm</h2>
            <p className="text-xs text-slate-400 mt-1">ID: {productId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          )}

          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Giày đá bóng Adidas Predator"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết sản phẩm..."
                  rows={4}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category ID *</label>
                  <input
                    type="number"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 1"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Brand ID *</label>
                  <input
                    type="number"
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 2"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer"
                />
                <label htmlFor="status" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Trạng thái hoạt động (Active)
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
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
    </div>
  );
};
