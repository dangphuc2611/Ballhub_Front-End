"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Plus, Minus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePosStore, PosCartItem } from "@/lib/usePosStore"; // Nhớ sửa lại đường dẫn nếu cần

interface PosVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosVariantModal = ({ isOpen, onClose }: PosVariantModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [variants, setVariants] = useState<PosCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addItemToActiveOrder = usePosStore((state) => state.addItemToActiveOrder);

  // State cho popup chọn số lượng
  const [selectedVariant, setSelectedVariant] = useState<PosCartItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVariants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("refreshToken");
        // Gọi API POS mà chúng ta vừa tạo
        const res = await fetch(`http://localhost:8080/api/admin/stats/pos/variants?keyword=${keyword}&page=0&size=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) setVariants(result.data.content);
      } catch (error) {
        toast.error("Lỗi tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchVariants();
    }, 500); // Debounce chống spam API khi gõ phím

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, isOpen]);

  const handleConfirmAdd = () => {
    if (!selectedVariant) return;
    if (quantity > selectedVariant.stockQuantity) {
      toast.error("Vượt quá số lượng tồn kho!");
      return;
    }
    addItemToActiveOrder(selectedVariant, quantity);
    toast.success("Đã thêm vào đơn hàng");
    setSelectedVariant(null);
    setQuantity(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[900px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Tìm kiếm sản phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-slate-200 focus-within:border-emerald-500 transition-colors shadow-sm">
            <Search className="text-slate-400 mr-2" size={20} />
            <input
              type="text"
              placeholder="Nhập tên sản phẩm hoặc mã SKU..."
              className="bg-transparent border-none outline-none flex-1 text-slate-700 font-medium"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Đang tìm kiếm...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                  <th className="pb-3 font-semibold">Ảnh</th>
                  <th className="pb-3 font-semibold">Tên & Phân loại</th>
                  <th className="pb-3 font-semibold">Mã (SKU)</th>
                  <th className="pb-3 font-semibold">Tồn kho</th>
                  <th className="pb-3 font-semibold text-right">Giá</th>
                  <th className="pb-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.variantId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div className="w-12 h-12 relative bg-white border border-slate-100 rounded-lg overflow-hidden">
                        {v.imageUrl ? (
                          <Image src={`http://localhost:8080${v.imageUrl}`} alt={v.productName} fill className="object-contain" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-slate-100"></div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-slate-700 text-sm">{v.productName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md mr-1">{v.colorName}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">Size {v.sizeName}</span>
                      </p>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{v.sku}</td>
                    <td className="py-3 text-sm font-medium text-emerald-600">{v.stockQuantity}</td>
                    <td className="py-3 text-right font-bold text-slate-700">
                      {v.discountPrice ? (
                        <>
                          <span className="text-red-500 block">{v.discountPrice.toLocaleString("vi-VN")}đ</span>
                          <span className="line-through text-slate-400 text-xs">{v.price.toLocaleString("vi-VN")}đ</span>
                        </>
                      ) : (
                        <span>{v.price.toLocaleString("vi-VN")}đ</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors border border-emerald-200 hover:border-emerald-500"
                      >
                        CHỌN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Popup Nhập Số Lượng */}
        {selectedVariant && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-96 text-center animate-in zoom-in-95 duration-200">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{selectedVariant.productName}</h3>
              <p className="text-slate-500 text-sm mb-4">{selectedVariant.colorName} - Size {selectedVariant.sizeName}</p>
              
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl mb-6">
                <span className="text-sm font-semibold text-slate-600">Số lượng:</span>
                <div className="flex items-center bg-white rounded-lg border border-slate-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-slate-100 rounded-l-lg transition-colors text-slate-600"><Minus size={16} /></button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))} className="p-2 hover:bg-slate-100 rounded-r-lg transition-colors text-slate-600"><Plus size={16} /></button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedVariant(null)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">HỦY</button>
                <button onClick={handleConfirmAdd} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">XÁC NHẬN</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};