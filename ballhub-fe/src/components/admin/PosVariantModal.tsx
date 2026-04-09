"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Plus, Minus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePosStore, PosCartItem } from "@/lib/usePosStore";

interface PosVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosVariantModal = ({ isOpen, onClose }: PosVariantModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [variants, setVariants] = useState<PosCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addItemToActiveOrder = usePosStore(
    (state) => state.addItemToActiveOrder,
  );

  // State cho popup chọn số lượng
  const [selectedVariant, setSelectedVariant] = useState<PosCartItem | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number | string>(1);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVariants = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("refreshToken");
        // Gọi API POS mà chúng ta vừa tạo
        const res = await fetch(
          `http://localhost:8080/api/admin/stats/pos/variants?keyword=${keyword}&page=0&size=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
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

    // Đảm bảo quantity là số hợp lệ
    const finalQuantity =
      typeof quantity === "string" ? parseInt(quantity) || 1 : quantity;

    if (finalQuantity < 1) {
      toast.warning("Số lượng phải lớn hơn 0");
      return;
    }

    if (finalQuantity > selectedVariant.stockQuantity) {
      toast.error(
        `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm trong kho!`,
      );
      return;
    }

    // 🚀 SỬA TẠI ĐÂY: Mapping tường minh dữ liệu trước khi đẩy vào giỏ hàng
    const cartItemData = {
      variantId: selectedVariant.variantId,
      productId: selectedVariant.productId,
      productName: selectedVariant.productName,
      sku: selectedVariant.sku,
      colorName: selectedVariant.colorName,
      sizeName: selectedVariant.sizeName,
      imageUrl: selectedVariant.imageUrl, // Hoặc productImage tùy API của bạn
      price: selectedVariant.price, // Giá gốc
      // BẮT BUỘC có dòng này để lấy giá đã giảm (hoặc fallback về giá gốc nếu ko có sale)
      discountPrice: selectedVariant.discountPrice || selectedVariant.price,
      stockQuantity: selectedVariant.stockQuantity,
      quantity: finalQuantity,
    };

    addItemToActiveOrder(cartItemData, finalQuantity); // Đẩy object đã mapping

    toast.success("Đã thêm vào đơn hàng");
    setSelectedVariant(null);
    setQuantity(1);
  };

  // Xử lý khi nhập tay số lượng vào ô input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedVariant) return;

    const val = e.target.value;

    // Cho phép xóa rỗng để gõ số mới
    if (val === "") {
      setQuantity("");
      return;
    }

    const num = parseInt(val);
    if (isNaN(num)) return;

    if (num > selectedVariant.stockQuantity) {
      toast.warning(
        `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm trong kho!`,
      );
      setQuantity(selectedVariant.stockQuantity);
    } else {
      setQuantity(num);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-[900px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Search className="text-emerald-500" /> Tìm kiếm sản phẩm
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-3.5 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-sm">
            <Search className="text-slate-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Nhập tên sản phẩm hoặc mã SKU..."
              className="bg-transparent border-none outline-none flex-1 text-slate-700 font-bold"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 text-slate-400 animate-pulse">
              <Search size={48} className="mb-4 opacity-20" />
              <span className="font-bold tracking-widest uppercase text-sm">
                Đang tìm kiếm...
              </span>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-black">Ảnh</th>
                  <th className="px-4 py-3 font-black">Sản phẩm</th>
                  <th className="px-4 py-3 font-black">SKU</th>
                  <th className="px-4 py-3 font-black text-center">Tồn kho</th>
                  <th className="px-4 py-3 font-black text-right">Giá bán</th>
                  <th className="px-4 py-3 font-black text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr
                    key={v.variantId}
                    className="border-b border-slate-100 hover:bg-white transition-all group"
                  >
                    <td className="px-4 py-3">
                      <div className="w-14 h-14 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                        {v.imageUrl ? (
                          <Image
                            src={`http://localhost:8080${v.imageUrl}`}
                            alt={v.productName}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 text-sm leading-snug">
                        {v.productName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        <span className="bg-slate-100 px-2 py-1 rounded-md mr-1 border">
                          {v.colorName}
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded-md border">
                          Size {v.sizeName}
                        </span>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">
                      {v.sku}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-600 font-black text-xs px-2 py-1 rounded-lg border border-emerald-100">
                        {v.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      {/* SỬA TẠI ĐÂY: Thêm điều kiện kiểm tra giá giảm phải nhỏ hơn giá gốc */}
                      {v.discountPrice && v.discountPrice < v.price ? (
                        <>
                          <span className="text-emerald-600 block text-sm">
                            {v.discountPrice.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="line-through text-slate-400 text-[10px]">
                            {v.price.toLocaleString("vi-VN")}đ
                          </span>
                        </>
                      ) : (
                        <span className="text-emerald-600 block text-sm">
                          {v.price.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        disabled={v.stockQuantity === 0}
                        className="bg-slate-800 text-white hover:bg-black font-bold py-2 px-5 rounded-xl text-xs transition-all disabled:opacity-30 disabled:hover:bg-slate-800 shadow-md"
                      >
                        {v.stockQuantity === 0 ? "HẾT HÀNG" : "CHỌN"}
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 w-[400px] text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 relative mx-auto mb-4 bg-slate-50 rounded-2xl border border-slate-100">
                {selectedVariant.imageUrl && (
                  <Image
                    src={`http://localhost:8080${selectedVariant.imageUrl}`}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>

              <h3 className="font-black text-lg text-slate-800 mb-1">
                {selectedVariant.productName}
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5">
                {selectedVariant.colorName} - Size {selectedVariant.sizeName}
              </p>

              <div className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Nhập số lượng
                </span>
                <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          (typeof quantity === "number" ? quantity : 1) - 1,
                        ),
                      )
                    }
                    className="w-10 h-10 flex justify-center items-center hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                  >
                    <Minus size={18} />
                  </button>

                  {/* ✅ Ô NHẬP ĐÃ ĐƯỢC MỞ KHÓA CHO GÕ TAY */}
                  <input
                    type="number"
                    className="w-16 text-center font-black text-xl bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={() => {
                      // Ép kiểu sang số an toàn để TypeScript không báo lỗi
                      const num =
                        typeof quantity === "string"
                          ? parseInt(quantity)
                          : quantity;
                      if (isNaN(num) || num < 1) setQuantity(1);
                    }}
                    autoFocus
                  />

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          selectedVariant.stockQuantity,
                          (typeof quantity === "number" ? quantity : 1) + 1,
                        ),
                      )
                    }
                    className="w-10 h-10 flex justify-center items-center hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-2">
                  Kho còn: {selectedVariant.stockQuantity} SP
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedVariant(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  HỦY
                </button>
                <button
                  onClick={handleConfirmAdd}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex justify-center items-center gap-2"
                >
                  <CheckCircle2 size={18} /> XÁC NHẬN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
