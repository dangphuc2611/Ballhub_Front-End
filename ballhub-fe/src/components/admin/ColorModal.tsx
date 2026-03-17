"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Palette } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Color = {
  colorId: number;
  colorName: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  colorData?: Color | null;
  onClose: () => void;
  onRefresh: () => void;
};

export const ColorModal = ({
  open,
  mode,
  colorData,
  onClose,
  onRefresh,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [colorName, setColorName] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && colorData) {
        setColorName(colorData.colorName);
      } else {
        setColorName("");
      }
    }
  }, [open, mode, colorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorName.trim()) {
      toast.error("Vui lòng nhập tên màu");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("refreshToken");
      const url = mode === "create" 
        ? "http://localhost:8080/api/admin/colors"
        : `http://localhost:8080/api/admin/colors/${colorData?.colorId}`;
      
      const method = mode === "create" ? "post" : "put";

      const res = await axios({
        method,
        url,
        data: { colorName },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status === "success" || res.status === 200 || res.status === 201) {
        toast.success(mode === "create" ? "Thêm màu thành công" : "Cập nhật màu thành công");
        onRefresh();
        onClose();
      }
    } catch (error: any) {
      console.error("Color save error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Palette size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {mode === "create" ? "Thêm Màu Mới" : "Chỉnh Sửa Màu"}
              </h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Thông tin màu sắc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                Tên Màu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Ví dụ: Đỏ, Xanh Navy, Trắng..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-300 text-slate-700"
                autoFocus
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border-2 border-slate-100 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {mode === "create" ? "Lưu Màu Mới" : "Cập Nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
