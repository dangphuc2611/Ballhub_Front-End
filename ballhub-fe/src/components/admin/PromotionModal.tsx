"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Zap, Loader2, Search, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND = "http://localhost:8080";
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

type PromotionModalProps = {
  mode: "create" | "edit";
  promotionData?: any;
  onClose: () => void;
  onSuccess: () => void;
};

const formatForInput = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export const PromotionModal = ({
  mode,
  promotionData,
  onClose,
  onSuccess,
}: PromotionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]); // Danh sách tất cả SP
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    promotionName: "",
    discountPercent: 10,
    startDate: "",
    endDate: "",
    status: true,
    description: "",
  });

  // 1. Lấy danh sách sản phẩm khi mở Modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy tất cả sản phẩm để chọn (Endpoint đã sửa ở Controller)
        const resProducts = await axios.get(`${BACKEND}/api/products/all-active`);
        setProducts(resProducts.data.data || []);

        // 2. Nếu là mode Edit, lấy thêm danh sách ID sản phẩm đã áp dụng
        if (mode === "edit" && promotionData) {
          setFormData({
            promotionName: promotionData.promotionName || "",
            discountPercent: promotionData.discountPercent || 10,
            startDate: formatForInput(promotionData.startDate),
            endDate: formatForInput(promotionData.endDate),
            status: promotionData.status ?? true,
            description: promotionData.description || "",
          });

          // Gọi API lấy danh sách ID sản phẩm của khuyến mãi này
          const resSelected = await axios.get(
            `${BACKEND}/api/promotions/${promotionData.promotionId}/products/ids`
          );
          setSelectedProductIds(resSelected.data.data || []);
        }
      } catch (error) {
        console.error("Lỗi load dữ liệu:", error);
        toast.error("Không thể tải dữ liệu sản phẩm");
      }
    };

    fetchData();
  }, [mode, promotionData]);

  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm áp dụng");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const payload = {
        ...formData,
        discountType: "PERCENT",
        productIds: selectedProductIds, // Gửi list ID về cho Java
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (mode === "create") {
        await axios.post(`${BACKEND}/api/promotions/admin`, payload, config);
        toast.success("Tạo chương trình thành công!");
      } else {
        await axios.put(
          `${BACKEND}/api/promotions/admin/${promotionData.promotionId}`,
          payload,
          config
        );
        toast.success("Cập nhật thành công!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi thao tác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-100">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
              <Zap size={20} className="fill-orange-500" />
            </div>
            <h2 className="font-black text-slate-800 text-xl">
              {mode === "create" ? "Thiết lập Flash Sale" : "Chỉnh sửa khuyến mãi"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-8">
          <form
            id="promo-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Cột trái: Thông tin chung */}
            <div className="space-y-5">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                1. Thông tin cơ bản
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  Tên chương trình *
                </label>
                <input
                  type="text"
                  placeholder="VD: Flash Sale Cuối Tuần"
                  value={formData.promotionName}
                  onChange={(e) =>
                    setFormData({ ...formData, promotionName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none transition-all font-medium text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none font-bold text-orange-500"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.checked })
                      }
                      className="w-5 h-5 accent-orange-500 cursor-pointer"
                      id="st"
                    />
                    <label
                      htmlFor="st"
                      className="text-xs font-bold text-slate-600 cursor-pointer select-none"
                    >
                      Kích hoạt
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: Chọn sản phẩm */}
            <div className="space-y-5 flex flex-col h-full">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  2. Chọn sản phẩm ({selectedProductIds.length})
                </h3>
                {selectedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex-1 border border-slate-100 rounded-[24px] bg-slate-50/50 overflow-y-auto max-h-[320px] divide-y divide-white shadow-inner">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div
                      key={p.productId}
                      onClick={() => toggleProduct(p.productId)}
                      className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-all ${
                        selectedProductIds.includes(p.productId)
                          ? "bg-orange-50/80"
                          : "hover:bg-white"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {p.productName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium italic">
                          Giá từ: {p.price?.toLocaleString() || 0}đ
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedProductIds.includes(p.productId)
                            ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        {selectedProductIds.includes(p.productId) && (
                          <Check size={12} strokeWidth={4} />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 text-xs font-medium">
                    Không tìm thấy sản phẩm nào
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
          >
            HỦY BỎ
          </button>
          <button
            type="submit"
            form="promo-form"
            disabled={loading}
            className="flex-[2] flex justify-center items-center gap-2 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            XÁC NHẬN LƯU THAY ĐỔI
          </button>
        </div>
      </div>
    </div>
  );
};