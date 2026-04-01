"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingCart, CreditCard, Printer, User, Trash2, Minus, Plus, CheckCircle2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { usePosStore } from "@/lib/usePosStore";
import { PosVariantModal } from "@/components/admin/PosVariantModal";

export const PosView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Destructure đầy đủ các hàm từ Store (có thêm Voucher)
  const { 
    orders, activeOrderId, addOrder, removeOrder, setActiveOrder, 
    updateItemQuantity, removeItemFromActiveOrder, updateActiveOrderDetails,
    setAvailableVouchers 
  } = usePosStore();

  // 1. Tìm hóa đơn đang mở
  const activeOrder = orders.find(o => o.id === activeOrderId);

  // 2. Tự động lấy danh sách Voucher từ API khi load trang
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/promotions?status=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
           // Giả sử API trả về content hoặc data trực tiếp
           setAvailableVouchers(result.data.content || result.data);
        }
      } catch (error) {
        console.error("Lỗi tải voucher:", error);
      }
    };
    fetchVouchers();
  }, [setAvailableVouchers]);

  // 3. Tính toán tiền nong (An toàn với Optional Chaining ?)
  const subTotal = activeOrder?.items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0) || 0;
  const discountAmount = activeOrder?.discountAmount || 0;
  const finalTotal = subTotal - discountAmount;
  const totalItems = activeOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  // FIX LỖI ĐỎ: Kiểm tra activeOrder trước khi truy cập items
  const handlePrint = () => {
    if (!activeOrder || activeOrder.items.length === 0) {
      toast.warning("Hóa đơn trống!");
      return;
    }
    window.print();
  };

  const handleCheckout = async () => {
    if (!activeOrder || activeOrder.items.length === 0) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("refreshToken");
      for (const item of activeOrder.items) {
        const addCartRes = await fetch(`http://localhost:8080/api/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity })
        });
        if (!addCartRes.ok) throw new Error("Không thể thêm sản phẩm vào giỏ hàng!");
      }

      const finalNote = activeOrder.customerName.trim() !== "" ? `POS - Khách: ${activeOrder.customerName}` : "Khách mua trực tiếp tại quầy";
      const orderPayload = {
        addressId: null,
        paymentMethodId: 1,
        note: finalNote,
        promoCode: activeOrder.appliedVoucher?.promoCode || null, // Gửi mã voucher lên nếu có
        shippingFee: 0,
        isPos: true
      };

      const orderRes = await fetch(`http://localhost:8080/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || "Lỗi khi chốt hóa đơn!");
      }

      window.print();
      toast.success("Thanh toán thành công!", { icon: <CheckCircle2 className="text-emerald-500" /> });
      removeOrder(activeOrder.id);
      window.dispatchEvent(new Event("cartUpdated"));
      
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi thanh toán!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pos-receipt, #pos-receipt * { visibility: visible; }
          #pos-receipt { position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 10px; }
        }
      `}</style>

      {/* MẪU IN HÓA ĐƠN NHIỆT */}
      {activeOrder && (
        <div id="pos-receipt" className="hidden print:block text-black font-mono text-sm">
          <div className="text-center mb-4">
            <h2 className="font-bold text-xl uppercase">BALLHUB SPORT</h2>
            <p className="text-xs">Mã HĐ: {activeOrder.id}</p>
            <p className="text-xs">Khách hàng: {activeOrder.customerName || "Khách lẻ"}</p>
            <div className="border-b border-dashed border-black my-2"></div>
          </div>
          <table className="w-full text-xs mb-2">
            <tbody>
              {activeOrder.items.map((item, idx) => (
                <tr key={idx} className="border-b border-dotted border-gray-400">
                  <td className="py-2">{item.productName}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatPrice((item.discountPrice || item.price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold pt-2 border-t border-black">
            <p>Tổng: {formatPrice(subTotal)}</p>
            {discountAmount > 0 && <p>Giảm giá: -{formatPrice(discountAmount)}</p>}
            <p className="text-lg">CẦN TRẢ: {formatPrice(finalTotal)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-80px)] print:hidden gap-4">
        
        {/* THANH TAB - GIỚI HẠN 5 ĐƠN */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {orders.map((order) => (
            <div key={order.id} onClick={() => setActiveOrder(order.id)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-t-xl cursor-pointer border-b-2 transition-all min-w-[140px] ${
                activeOrderId === order.id ? "bg-white border-emerald-500 text-emerald-700 shadow-sm font-bold" : "bg-slate-100 text-slate-500"
              }`}>
              <span className="whitespace-nowrap flex-1">Đơn hàng {order.id.replace('HD', '')}</span>
              <button onClick={(e) => { e.stopPropagation(); removeOrder(order.id); }} className="p-1 rounded-full hover:bg-red-100 hover:text-red-500">
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
          {/* Nút tạo đơn chỉ hiện khi < 5 */}
          {orders.length < 5 && (
            <button onClick={addOrder} className="flex items-center gap-1 px-4 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 shrink-0 ml-2">
              <Plus size={18} /> Tạo đơn mới
            </button>
          )}
        </div>

        {!activeOrder ? (
          <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-2xl shadow-sm border border-slate-200">
            <ShoppingCart size={48} className="text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chưa có đơn hàng nào</h2>
            <button onClick={addOrder} className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200">
              TẠO ĐƠN MỚI NGAY
            </button>
          </div>
        ) : (
          <div className="flex gap-4 flex-1 min-h-0">
            {/* CỘT TRÁI - GIỮ NGUYÊN CSS CỦA BẠN */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-lg text-slate-800">Chi tiết đơn hàng</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 shadow-sm shadow-emerald-200">
                  <Search size={18} /> Thêm sản phẩm
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                {activeOrder.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <ShoppingCart size={64} className="mb-4 opacity-20" />
                    <p>Chưa có sản phẩm nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-bold text-slate-500 border-b border-slate-200">
                      <div className="col-span-1">STT</div>
                      <div className="col-span-5">Sản phẩm</div>
                      <div className="col-span-2 text-center">Số lượng</div>
                      <div className="col-span-2 text-right">Đơn giá</div>
                      <div className="col-span-2 text-right">Thành tiền</div>
                    </div>
                    
                    {activeOrder.items.map((item, index) => (
                      <div key={item.variantId} className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group relative">
                        <div className="col-span-1 font-bold text-slate-400 text-center">{index + 1}</div>
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                            {item.imageUrl && <Image src={`http://localhost:8080${item.imageUrl}`} alt="" fill className="object-contain" unoptimized />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-700 leading-tight">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 uppercase mt-1">{item.sku} | {item.colorName} - {item.sizeName}</p>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                            <button onClick={() => updateItemQuantity(item.variantId, item.quantity - 1)} className="px-2 py-1.5 hover:bg-slate-200 text-slate-600"><Minus size={14} /></button>
                            <input type="number" className="w-10 text-center text-sm font-bold bg-transparent outline-none" value={item.quantity} readOnly />
                            <button onClick={() => updateItemQuantity(item.variantId, item.quantity + 1)} className="px-2 py-1.5 hover:bg-slate-200 text-slate-600"><Plus size={14} /></button>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="font-medium text-slate-600 text-sm">{formatPrice(item.discountPrice || item.price)}</p>
                        </div>
                        <div className="col-span-2 text-right pr-4">
                          <p className="font-bold text-emerald-600">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                        </div>
                        <button onClick={() => removeItemFromActiveOrder(item.variantId)} className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI - THANH TOÁN & VOUCHER */}
            <div className="w-[380px] shrink-0 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><User size={18} className="text-emerald-500"/> Khách hàng</h3>
                <input type="text" placeholder="Tên khách hàng" value={activeOrder.customerName} onChange={(e) => updateActiveOrderDetails({ customerName: e.target.value })} className="w-full text-sm font-medium text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 mb-3" />
                <input type="text" placeholder="Số điện thoại" value={activeOrder.customerPhone} onChange={(e) => updateActiveOrderDetails({ customerPhone: e.target.value })} className="w-full text-sm font-medium text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 uppercase text-xs tracking-wider">Thanh toán</h3>
                
                <div className="space-y-4 text-sm flex-1">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Tổng tiền hàng ({totalItems} món)</span>
                    <span className="text-slate-800">{formatPrice(subTotal)}</span>
                  </div>

                  {/* BOX VOUCHER TỰ ĐỘNG */}
                  {activeOrder.appliedVoucher && (
                    <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100 animate-in slide-in-from-right-2">
                       <div className="flex items-center gap-3">
                          <div className="bg-emerald-500 p-2 rounded-lg text-white"><Tag size={16} /></div>
                          <div>
                             <p className="text-[10px] font-bold text-emerald-600 uppercase">Ưu đãi nhất</p>
                             <p className="font-bold text-emerald-800">{activeOrder.appliedVoucher.promoCode}</p>
                          </div>
                       </div>
                       <span className="font-bold text-emerald-600">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-end py-4 border-t border-slate-100 mt-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-1">Cần thanh toán</span>
                    <span className="font-black text-3xl text-emerald-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button onClick={handlePrint} disabled={!activeOrder || activeOrder.items.length === 0}
                    className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 disabled:opacity-50">
                    <Printer size={20} /> <span className="text-[10px] uppercase">In tạm</span>
                  </button>
                  <button onClick={handleCheckout} disabled={!activeOrder || activeOrder.items.length === 0 || isProcessing}
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 disabled:opacity-50">
                    {isProcessing ? <span className="animate-spin">↻</span> : <CreditCard size={20} />} 
                    <span className="text-[10px] uppercase">Thanh toán</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PosVariantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};