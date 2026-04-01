"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingCart, CreditCard, Printer, User, Trash2, Minus, Plus, CheckCircle2, X, Tag, MapPin } from "lucide-react";
import { toast } from "sonner";
import { usePosStore, PosVoucher } from "@/lib/usePosStore"; 
import { PosVariantModal } from "@/components/admin/PosVariantModal";
import { PosCustomerModal } from "@/components/admin/PosCustomerModal";
import { PosAddressModal } from "@/components/admin/PosAddressModal";

export const PosView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const { 
    orders, activeOrderId, addOrder, removeOrder, setActiveOrder, 
    updateItemQuantity, removeItemFromActiveOrder, updateActiveOrderDetails,
    setAvailableVouchers, availableVouchers 
  } = usePosStore();

  const activeOrder = orders.find(o => o.id === activeOrderId);

  // ==========================================
  // STATE & LOGIC CHO CHỌN ĐỊA CHỈ (PROVINCE API)
  // ==========================================
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProv, setSelectedProv] = useState("");
  const [selectedDist, setSelectedDist] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [street, setStreet] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  
  // Trạng thái kiểm soát việc hiện form gõ hay hiện text tĩnh
  const [isTypingNewAddress, setIsTypingNewAddress] = useState(true);

  // 1. Tải danh sách 63 Tỉnh Thành từ Open API VN
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi API Tỉnh thành:", err));
  }, []);

  // 2. Tự động ghép chuỗi địa chỉ khi thu ngân chọn Dropdown
  useEffect(() => {
    if (!activeOrder?.isDelivery || !isTypingNewAddress) return;
    
    const pName = provinces.find(p => p.code == selectedProv)?.name || "";
    const dName = districts.find(d => d.code == selectedDist)?.name || "";
    const wName = wards.find(w => w.code == selectedWard)?.name || "";

    const fullAddr = [street, wName, dName, pName].filter(Boolean).join(", ");
    updateActiveOrderDetails({ deliveryAddress: fullAddr });
  }, [selectedProv, selectedDist, selectedWard, street, isTypingNewAddress]);

  // 3. HÀM GIẢ LẬP TÍNH PHÍ SHIP (CHỜ TÍCH HỢP GHN)
  const simulateShippingCalculation = (provCode: string) => {
    if (!provCode) {
      updateActiveOrderDetails({ shippingFee: 0 });
      return;
    }

    // ✅ ĐÃ SỬA: Tách ra biến riêng và thêm "|| 0" để TypeScript không báo lỗi undefined
    const currentOrder = usePosStore.getState().orders.find(o => o.id === activeOrderId);
    const currentSubTotal = currentOrder?.items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0) || 0;

    // Dù chọn tỉnh nào, cứ trên 1tr là 0 đồng
    if (currentSubTotal >= 1000000) {
       updateActiveOrderDetails({ shippingFee: 0 });
       return;
    }

    // Demo: Nội thành HN (mã 1) hoặc HCM (mã 79) giá 20k, tỉnh khác 35k
    const fee = (provCode === "1" || provCode === "79") ? 20000 : 35000;
    updateActiveOrderDetails({ shippingFee: fee });
  };

  // ==========================================
  // VOUCHER & TÍNH TOÁN TIỀN
  // ==========================================
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/promotions/active`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success && result.data) setAvailableVouchers(result.data.content || result.data);
      } catch (error) { console.error("Lỗi voucher:", error); }
    };
    fetchVouchers();
  }, [setAvailableVouchers]);

  // TÍNH TOÁN TIỀN TẠM TÍNH
  const subTotal = activeOrder?.items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0) || 0;
  
  // KIỂM TRA ĐIỀU KIỆN FREESHIP (> 1 TRIỆU)
  const isFreeshipEligible = subTotal >= 1000000;

  // LOGIC TỰ ĐỘNG FREESHIP KHI ĐƠN > 1 TRIỆU
  useEffect(() => {
    if (!activeOrder || !activeOrder.isDelivery) return;

    if (isFreeshipEligible && activeOrder.shippingFee !== 0) {
       // Nếu đủ đk mà phí ship đang > 0 thì ép về 0
       updateActiveOrderDetails({ shippingFee: 0 });
       toast.success("Đơn hàng trên 1 triệu đã tự động được MIỄN PHÍ VẬN CHUYỂN!", { icon: "🎉" });
    } else if (!isFreeshipEligible && activeOrder.shippingFee === 0 && selectedProv) {
       // Nếu xóa bớt đồ làm đơn rớt xuống dưới 1 Triệu -> Tính lại tiền ship
       simulateShippingCalculation(selectedProv);
    }
  }, [subTotal, activeOrder?.isDelivery, isFreeshipEligible]);

  const discountAmount = activeOrder?.discountAmount || 0;
  const shippingFee = activeOrder?.isDelivery ? (activeOrder?.shippingFee || 0) : 0;
  const finalTotal = Math.max(0, subTotal - discountAmount) + shippingFee;
  const totalItems = activeOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const handleApplyVoucherInput = () => {
    if (!promoInput.trim()) { toast.warning("Vui lòng nhập mã khuyến mãi!"); return; }
    const voucher = availableVouchers.find(v => v.promoCode.toUpperCase() === promoInput.toUpperCase());
    if (!voucher) { toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn!"); return; }
    handleSelectVoucher(voucher);
  };

  const handleSelectVoucher = (voucher: PosVoucher) => {
    if (subTotal < voucher.minOrderAmount) { toast.error(`Đơn hàng chưa đủ ${formatPrice(voucher.minOrderAmount)} để dùng mã này!`); return; }
    updateActiveOrderDetails({ appliedVoucher: voucher });
    usePosStore.getState().calculateBestVoucher(); 
    toast.success(`Đã áp dụng mã ${voucher.promoCode} thành công!`);
    setPromoInput(""); 
  };

  const handlePrint = () => {
    if (!activeOrder || activeOrder.items.length === 0) { toast.warning("Hóa đơn trống!"); return; }
    window.print();
  };

  const handleCheckout = async () => {
    if (!activeOrder || activeOrder.items.length === 0) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("refreshToken");

      // 1. GỌI API THÊM VÀO GIỎ HÀNG
      for (const item of activeOrder.items) {
        const res = await fetch(`http://localhost:8080/api/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity })
        });
        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.message || `Lỗi thêm giỏ hàng (Mã ${res.status})`);
        }
      }

      // 2. CHUẨN BỊ GHI CHÚ BẰNG ĐỊA CHỈ GÕ TAY
      const customerName = activeOrder.customerName.trim() !== "" ? activeOrder.customerName : "Khách lẻ";
      const customerPhone = activeOrder.customerPhone.trim() !== "" ? activeOrder.customerPhone : "Trống";
      
      // Nhồi địa chỉ giao hàng vào Note để Backend lưu lại
      let finalNote = `POS_CUSTOMER|${customerName}|${customerPhone}`;
      if (activeOrder.isDelivery && activeOrder.deliveryAddress) {
          finalNote += `|Giao đến: ${activeOrder.deliveryAddress}`;
          if (deliveryNote) finalNote += ` - Ghi chú: ${deliveryNote}`;
      }

      // 3. GỌI API TẠO ĐƠN HÀNG (ĐÃ BƠM ID KHÁCH HÀNG & ĐỊA CHỈ GÕ TAY)
      const orderPayload = {
        addressId: activeOrder.addressId || null,
        customerId: activeOrder.customerId || null, // ✅ Khách có tài khoản thì điền vào đây
        paymentMethodId: 1,
        note: finalNote,
        promoCode: activeOrder.appliedVoucher?.promoCode || null,
        shippingFee: shippingFee,
        isPos: true, 
        fullName: customerName,
        phone: customerPhone === "Trống" ? "" : customerPhone,
        deliveryAddress: activeOrder.deliveryAddress // ✅ Gửi địa chỉ gõ tay lên
      };

      const orderRes = await fetch(`http://localhost:8080/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
         const errData = await orderRes.json();
         throw new Error(errData.message || `Lỗi tạo đơn hàng (Mã ${orderRes.status})`);
      }

      window.print();
      toast.success("Thanh toán thành công!", { icon: <CheckCircle2 className="text-emerald-500" /> });
      removeOrder(activeOrder.id);
      window.dispatchEvent(new Event("cartUpdated"));
      
    } catch (error: any) {
      toast.error(error.message); 
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
            {shippingFee > 0 && <p>Phí ship: {formatPrice(shippingFee)}</p>}
            <p className="text-lg mt-1">CẦN TRẢ: {formatPrice(finalTotal)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-80px)] print:hidden gap-4">
        
        {/* THANH TAB ĐƠN HÀNG */}
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
            
            {/* CỘT TRÁI - CHI TIẾT SẢN PHẨM */}
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
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                            <button onClick={() => updateItemQuantity(item.variantId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600"><Minus size={14}/></button>
                            <input 
                              type="number" 
                              className="w-12 text-center font-black bg-transparent outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                              value={item.quantity} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateItemQuantity(item.variantId, isNaN(val) ? 1 : val);
                              }}
                            />
                            <button onClick={() => updateItemQuantity(item.variantId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-600"><Plus size={14}/></button>
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

            {/* CỘT PHẢI - KHÁCH HÀNG & THANH TOÁN */}
            <div className="w-[420px] shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-2 pr-1">
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-700 flex items-center gap-2"><User size={18} className="text-emerald-500"/> Khách hàng</h3>
                   <button 
                      onClick={() => setIsCustomerModalOpen(true)} 
                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-emerald-100"
                   >
                      <Search size={12}/> CHỌN KHÁCH
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div>
                      <label className="text-[10px] text-slate-500 font-bold mb-1 block">Họ và tên</label>
                      <input type="text" placeholder="Khách lẻ" value={activeOrder.customerName} onChange={(e) => updateActiveOrderDetails({ customerName: e.target.value })} className="w-full text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                   </div>
                   <div>
                      <label className="text-[10px] text-slate-500 font-bold mb-1 block">Số điện thoại</label>
                      <input type="text" placeholder="Trống" value={activeOrder.customerPhone} onChange={(e) => updateActiveOrderDetails({ customerPhone: e.target.value })} className="w-full text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                   </div>
                </div>

                {/* TOGGLE GIAO HÀNG */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <span className="text-sm font-bold text-slate-600">Giao hàng tận nơi</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={activeOrder.isDelivery} onChange={(e) => updateActiveOrderDetails({ isDelivery: e.target.checked, shippingFee: 0, addressId: null, deliveryAddress: '' })} />
                     <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                   </label>
                </div>

                {/* FORM NHẬP ĐỊA CHỈ */}
                {activeOrder.isDelivery && (
                   <div className="mt-4 animate-in fade-in slide-in-from-top-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200/60">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Chi tiết nhận hàng</span>
                         <button 
                            onClick={() => {
                               if (!activeOrder.customerId) { toast.warning("Vui lòng CHỌN KHÁCH HÀNG trước!"); return; }
                               setIsAddressModalOpen(true);
                               setIsTypingNewAddress(false);
                            }}
                            className="text-[10px] bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1.5 rounded font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1 shadow-sm"
                         >
                            <MapPin size={12}/> SỔ ĐỊA CHỈ
                         </button>
                      </div>

                      {!isTypingNewAddress && activeOrder.deliveryAddress ? (
                          <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm relative mb-3">
                              <p className="text-xs text-slate-700 leading-relaxed font-medium">{activeOrder.deliveryAddress}</p>
                              <button onClick={() => setIsTypingNewAddress(true)} className="text-[10px] text-blue-500 mt-2 underline font-medium">Nhập địa chỉ mới</button>
                          </div>
                      ) : (
                          <div className="space-y-3 mb-4">
                              <div className="grid grid-cols-1 gap-2">
                                 <select className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                                    value={selectedProv}
                                    onChange={(e) => {
                                       const code = e.target.value;
                                       setSelectedProv(code);
                                       const p = provinces.find(x => x.code == code);
                                       setDistricts(p ? p.districts : []);
                                       setSelectedDist(""); setWards([]); setSelectedWard("");
                                       simulateShippingCalculation(code);
                                    }}
                                 >
                                   <option value="">Tỉnh/thành phố...</option>
                                   {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                 </select>

                                 <div className="grid grid-cols-2 gap-2">
                                    <select className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                                       value={selectedDist}
                                       disabled={!selectedProv}
                                       onChange={(e) => {
                                          const code = e.target.value;
                                          setSelectedDist(code);
                                          const d = districts.find(x => x.code == code);
                                          setWards(d ? d.wards : []);
                                          setSelectedWard("");
                                       }}
                                    >
                                      <option value="">Quận/huyện...</option>
                                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                    </select>
                                    
                                    <select className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                                       value={selectedWard}
                                       disabled={!selectedDist}
                                       onChange={(e) => setSelectedWard(e.target.value)}
                                    >
                                      <option value="">Xã/phường...</option>
                                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                    </select>
                                 </div>
                              </div>

                              <input type="text" placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" className="w-full text-xs font-medium text-slate-700 bg-white px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500" value={street} onChange={(e) => setStreet(e.target.value)} />
                              <input type="text" placeholder="Ghi chú giao hàng (Không bắt buộc)" className="w-full text-xs font-medium text-slate-700 bg-white px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500" value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} />
                          </div>
                      )}

                      {/* ✅ KHUNG CHỈNH SỬA PHÍ SHIP ĐÃ FIX (CÓ HIỆU ỨNG FREESHIP) */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500">Phí giao hàng:</span>
                            {isFreeshipEligible && (
                               <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded mt-1 w-fit animate-in zoom-in">
                                  Đơn {'>'} 1Tr (Freeship)
                               </span>
                            )}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <input 
                               type="number" 
                               disabled={isFreeshipEligible} 
                               className={`w-24 bg-white border px-3 py-1.5 rounded-lg text-sm font-black outline-none text-right shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all
                                  ${isFreeshipEligible ? 'border-emerald-500 text-emerald-500 bg-emerald-50/50 cursor-not-allowed' : 'border-slate-200 focus:border-emerald-500 text-emerald-600'}`} 
                               value={isFreeshipEligible ? 0 : shippingFee} 
                               onChange={(e) => updateActiveOrderDetails({ shippingFee: parseInt(e.target.value) || 0 })} 
                            />
                            <span className="text-xs font-bold text-slate-400">VNĐ</span>
                         </div>
                      </div>
                   </div>
                )}
              </div>

              {/* KHU VỰC TÍNH TIỀN */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-3 uppercase text-xs tracking-wider">Thanh toán</h3>
                
                <div className="space-y-4 text-sm flex-1">
                  
                  {/* ====== VOUCHER ====== */}
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-2 flex flex-col">
                    <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1"><Tag size={14}/> Mã giảm giá</p>
                    <div className="flex gap-2 mb-3">
                      <input type="text" placeholder="Nhập mã..." className="flex-1 border border-slate-200 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-emerald-500 transition-all uppercase" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucherInput()}/>
                      <button onClick={handleApplyVoucherInput} className="bg-slate-800 text-white px-4 rounded-lg font-bold hover:bg-slate-700 transition-all">Áp dụng</button>
                    </div>

                    {availableVouchers.length > 0 && (
                      <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pt-2 border-t border-slate-200">
                        {availableVouchers.map(v => {
                          const isEligible = subTotal >= v.minOrderAmount;
                          return (
                            <div key={v.promotionId} onClick={() => isEligible && handleSelectVoucher(v)} className={`p-2 border rounded-lg flex justify-between items-center transition-all ${isEligible ? 'bg-white border-emerald-200 hover:border-emerald-500 cursor-pointer shadow-sm' : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'}`}>
                              <div>
                                <p className={`text-xs font-bold ${isEligible ? 'text-emerald-700' : 'text-slate-500'}`}>{v.promoCode}</p>
                                <p className="text-[10px] text-slate-500">Đơn từ {formatPrice(v.minOrderAmount)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs font-bold ${isEligible ? 'text-emerald-600' : 'text-slate-500'}`}>-{v.discountPercent}%</p>
                                {v.maxDiscountAmount && <p className="text-[9px] text-slate-400">Tối đa {formatPrice(v.maxDiscountAmount)}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeOrder.appliedVoucher && (
                      <div className="mt-3 flex items-center justify-between bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-emerald-800">{activeOrder.appliedVoucher.promoCode}</p>
                            <p className="text-[10px] text-emerald-600">Đã giảm {formatPrice(discountAmount)}</p>
                          </div>
                        </div>
                        <button onClick={() => { updateActiveOrderDetails({ appliedVoucher: null, discountAmount: 0 }); toast.success("Đã gỡ mã giảm giá"); }} className="text-slate-400 hover:text-red-500 p-1"><X size={16}/></button>
                      </div>
                    )}
                  </div>

                  {/* BẢNG TÍNH TIỀN */}
                  <div className="flex justify-between text-slate-500 font-medium px-1">
                    <span>Tổng tiền hàng ({totalItems} món)</span>
                    <span className="text-slate-800 font-bold">{formatPrice(subTotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                     <div className="flex justify-between text-emerald-600 font-bold px-1">
                        <span>Giảm giá voucher</span>
                        <span>-{formatPrice(discountAmount)}</span>
                     </div>
                  )}

                  {activeOrder.isDelivery && (
                     <div className="flex justify-between text-orange-600 font-bold px-1 animate-in fade-in">
                        <span>Phí vận chuyển</span>
                        <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                     </div>
                  )}

                  <div className="flex justify-between items-end py-4 border-t border-slate-100 mt-2 px-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-1">Cần thanh toán</span>
                    <span className="font-black text-3xl text-emerald-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
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
      <PosCustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} />
      
      <PosAddressModal 
         isOpen={isAddressModalOpen} 
         onClose={() => setIsAddressModalOpen(false)} 
         customerId={activeOrder?.customerId || null} 
         onSelectSuccess={() => setIsTypingNewAddress(false)} 
      />
    </>
  );
};