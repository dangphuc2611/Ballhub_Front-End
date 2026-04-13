"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Loader2, Printer, Banknote, Mail, Phone, MapPin, User, Package, History, Barcode } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { toast } from "sonner"; 

type OrderDetailModalProps = {
  orderId: number;
  onClose: () => void;
  onRefresh: () => void;
};

// 🚀 ĐÃ CẬP NHẬT ID CHUẨN KHỚP 100% VỚI DATABASE
const STATUS_OPTIONS = [
  { id: 1, name: "PENDING", label: "Chờ xác nhận" },
  { id: 2, name: "CONFIRMED", label: "Đã xác nhận" },
  { id: 3, name: "SHIPPING", label: "Đang giao hàng" },
  { id: 4, name: "DELIVERED", label: "Đã giao hàng" },
  { id: 5, name: "COMPLETED", label: "Hoàn thành" },
  { id: 6, name: "FAILED", label: "Giao thất bại / Khiếu nại" },
  { id: 7, name: "CANCELLED", label: "Đã hủy" },
];

const getStatusLabel = (statusName: string) => {
  const status = STATUS_OPTIONS.find((s) => s.name === statusName);
  return status ? status.label : statusName;
};

export const OrderDetailModal = ({ orderId, onClose, onRefresh }: OrderDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  
  const [currentStatusId, setCurrentStatusId] = useState<number>(1);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPosOrder = orderDetail?.isPos === true;

  let finalCusName = orderDetail?.userFullName || "Khách lẻ";
  let finalCusPhone = orderDetail?.userPhone || (isPosOrder ? "Mua tại quầy" : "---");
  let displayAddress = orderDetail?.deliveryAddress || (isPosOrder ? "Nhận tại cửa hàng (POS)" : "---");
  let extractedCashFromNote = 0;

  if (orderDetail?.statusHistory) {
    const posNote = orderDetail.statusHistory.find((h: any) => h.note?.includes("POS") || h.note?.includes("CASH:"));
    if (posNote) {
      const raw = posNote.note;
      const parts = raw.split("|");
      if (finalCusName === "Khách lẻ" && parts.length >= 2 && !parts[1].includes("POS")) finalCusName = parts[1];
      if ((finalCusPhone === "---" || finalCusPhone === "Mua tại quầy") && parts.length >= 3 && parts[2] !== "Trống") finalCusPhone = parts[2];
      if ((displayAddress === "---" || displayAddress === "Nhận tại cửa hàng (POS)") && parts.length >= 4 && !parts[3].includes("POS")) displayAddress = parts[3];
      
      const cashMatch = raw.match(/CASH:(\d+)/);
      if (cashMatch) extractedCashFromNote = Number(cashMatch[1]);
    }
  }

  const customerCash = orderDetail?.customerCash > 0 ? orderDetail.customerCash : extractedCashFromNote;
  const changeAmount = orderDetail?.changeAmount > 0 ? orderDetail.changeAmount : (customerCash > 0 ? customerCash - (orderDetail?.totalAmount || 0) : 0);

  const cleanHistoryNote = (rawNote: string) => {
    if (!rawNote) return "";
    if (rawNote.startsWith("POS|") || rawNote.startsWith("POS_CUSTOMER|") || rawNote.includes("CASH:")) {
      return "Thanh toán thành công tại quầy (POS)";
    }
    return rawNote;
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data ?? res.data;
        setOrderDetail(data);

        const currentStatus = STATUS_OPTIONS.find((s) => s.name === data.statusName);
        if (currentStatus) {
          setCurrentStatusId(currentStatus.id);
          setSelectedStatusId(currentStatus.id);
        }
      } catch (error: any) {
        toast.error("Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  // 🚀 LOGIC DROPDOWN ĐÃ ĐƯỢC CẬP NHẬT THEO SỐ ID MỚI
  const getAvailableStatuses = () => {
    return STATUS_OPTIONS.filter((st) => {
      if (st.id === currentStatusId) return true;
      
      if (currentStatusId === 1) return st.id === 2 || st.id === 7; // Chờ -> Xác nhận HOẶC Hủy (7)
      if (currentStatusId === 2) return st.id === 3 || st.id === 7; // Xác nhận -> Đang giao HOẶC Hủy (7)
      if (currentStatusId === 3) return st.id === 4 || st.id === 6; // Đang giao -> Đã giao HOẶC Thất bại (6)
      if (currentStatusId === 4) return st.id === 5 || st.id === 6; // Đã giao -> Hoàn thành (5) HOẶC Thất bại (6)
      
      // Đã Hoàn thành (5), Thất bại (6), Hủy (7) là trạm cuối, khóa!
      return false; 
    });
  };

  const isTerminalState = [5, 6, 7].includes(currentStatusId);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatusId === currentStatusId) {
      toast.warning("Bạn chưa thay đổi trạng thái nào!");
      return;
    }

    if (isTerminalState) {
      toast.error("Đơn hàng đã ở trạng thái chốt, không thể thay đổi!");
      return;
    }

    // Bắt buộc nhập ghi chú nếu Hủy (7) hoặc Thất bại (6)
    if ((selectedStatusId === 7 || selectedStatusId === 6) && note.trim() === "") {
      toast.error("Vui lòng nhập Ghi chú (Lý do) khi Hủy hoặc Giao thất bại!");
      return;
    }

    setConfirmOpen(true);
  };

  const executeSubmit = async () => {
    setSubmitting(true); setConfirmOpen(false);
    try {
      const token = localStorage.getItem("refreshToken");
      await axios.put(
        `http://localhost:8080/api/orders/admin/${orderId}/status?statusId=${selectedStatusId}&note=${encodeURIComponent(note)}`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cập nhật trạng thái thành công!");
      
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data ?? res.data;
      setOrderDetail(newData);
      
      const newStatus = STATUS_OPTIONS.find((s) => s.name === newData.statusName);
      if (newStatus) {
        setCurrentStatusId(newStatus.id);
        setSelectedStatusId(newStatus.id);
      }
      setNote(""); 
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-order-receipt { 
            visibility: visible; position: absolute; left: 50%; top: 20px; transform: translateX(-50%); 
            width: 80mm; margin: 0; padding: 10px 15px; color: #000; font-family: 'Courier New', Courier, monospace; font-size: 12px;
          }
          #admin-order-receipt * { visibility: visible; }
          @page { margin: 0; padding: 0; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200 print:hidden">
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
          
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng #{orderDetail?.orderId}</h2>
                {isPosOrder ? (
                  <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">Tại quầy</span>
                ) : (
                  <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">Online</span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Ngày đặt: {orderDetail?.orderDate ? new Date(orderDetail.orderDate).toLocaleString("vi-VN") : "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm">
                <Printer size={16} /> In hóa đơn
              </button>
              <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
            {orderDetail && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 space-y-6">
                  {/* BOX: KHÁCH HÀNG */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                       <User size={18} className="text-emerald-500" />
                       <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin khách hàng</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <span className="block text-slate-400 text-xs mb-1 font-medium">Họ và tên</span>
                        <span className="font-bold text-slate-700">{finalCusName}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs mb-1 font-medium">Số điện thoại</span>
                        <span className="font-bold text-slate-700">{finalCusPhone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 text-xs mb-1 font-medium flex items-center gap-1">
                          <Mail size={12}/> Email
                        </span>
                        <span className="font-semibold text-slate-700">{orderDetail.userEmail || "---"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 text-xs mb-1 font-medium flex items-center gap-1">
                          <MapPin size={12}/> Địa chỉ giao hàng
                        </span>
                        <span className="font-semibold text-slate-700 leading-relaxed">{displayAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOX: SẢN PHẨM */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                       <Package size={18} className="text-emerald-500" />
                       <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sản phẩm đơn hàng</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {orderDetail.items?.map((item: any) => (
                        <div key={item.orderItemId} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {item.imageUrl ? (
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                                 <Image src={`http://localhost:8080${item.imageUrl}`} fill className="object-cover" alt={item.productName} unoptimized />
                              </div>
                            ) : (
                              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No Image</div>
                            )}
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{item.productName}</p>
                              
                              <p className="text-xs text-slate-500 mt-1 flex items-center flex-wrap gap-1">
                                <span>Màu: <span className="font-medium text-slate-700">{item.colorName}</span></span>
                                <span>•</span>
                                <span>Size: <span className="font-medium text-slate-700">{item.sizeName}</span></span>
                                {item.sku && item.sku !== "N/A" && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                                      <Barcode size={10} /> {item.sku}
                                    </span>
                                  </>
                                )}
                              </p>
                              
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 text-sm">{formatPrice(item.finalPrice)}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm space-y-2.5">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Tạm tính</span>
                        <span className="text-slate-700 font-bold">{formatPrice(orderDetail.subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Phí vận chuyển</span>
                        <span className="text-slate-700 font-bold">{formatPrice(orderDetail.shippingFee)}</span>
                      </div>
                      {orderDetail.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-500 font-bold">
                          <span>Giảm giá {orderDetail.promoCode && `(${orderDetail.promoCode})`}</span>
                          <span>- {formatPrice(orderDetail.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-2">
                        <span className="font-black text-slate-800 text-base uppercase">Tổng cộng</span>
                        <span className="text-emerald-600 font-black text-2xl tracking-tight">{formatPrice(orderDetail.totalAmount)}</span>
                      </div>

                      {customerCash > 0 && (
                        <div className="mt-6 p-5 bg-emerald-50 rounded-[20px] border border-emerald-100 shadow-inner animate-in slide-in-from-bottom-2 duration-300">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-emerald-700">
                               <div className="p-1.5 bg-emerald-500 text-white rounded-lg"><Banknote size={16}/></div>
                               <span className="font-bold text-xs uppercase tracking-wider">Khách đã đưa</span>
                            </div>
                            <span className="text-emerald-800 font-black text-xl">{formatPrice(customerCash)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-emerald-200/40">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Tiền thừa trả khách</span>
                            <span className="font-black text-emerald-600 text-xl">{formatPrice(changeAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* BOX: CẬP NHẬT TRẠNG THÁI */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wider relative z-10">Cập nhật trạng thái</h3>
                    
                    <form onSubmit={handlePreSubmit} className="space-y-4 relative z-10">
                      <div>
                        <span className="block text-slate-400 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Trạng thái hiện tại</span>
                        <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-black shadow-sm border border-slate-200">
                          {getStatusLabel(orderDetail.statusName)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Đổi trạng thái thành:</label>
                        
                        <select 
                          value={selectedStatusId} 
                          onChange={(e) => setSelectedStatusId(Number(e.target.value))} 
                          disabled={isTerminalState} // 🚀 Khóa form nếu là Trạm cuối
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold text-slate-700 disabled:opacity-50"
                        >
                          {getAvailableStatuses().map((st) => (
                            <option 
                              key={st.id} 
                              value={st.id} 
                              disabled={st.id === currentStatusId} 
                            >
                              {st.label}
                            </option>
                          ))}
                        </select>

                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex justify-between">
                          Ghi chú { (selectedStatusId === 7 || selectedStatusId === 6) && <span className="text-red-500">* Bắt buộc</span> }
                        </label>
                        <textarea 
                          value={note} 
                          onChange={(e) => setNote(e.target.value)} 
                          placeholder={(selectedStatusId === 7 || selectedStatusId === 6) ? "Bắt buộc nhập lý do..." : "Nhập lý do thay đổi (Tùy chọn)..."} 
                          rows={3} 
                          disabled={isTerminalState}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 resize-none shadow-inner disabled:opacity-50" 
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={submitting || isTerminalState} 
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />} Cập nhật ngay
                      </button>
                    </form>
                  </div>

                  {/* BOX: LỊCH SỬ ĐƠN HÀNG */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                       <History size={18} className="text-emerald-500" />
                       <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lịch sử đơn hàng</h3>
                    </div>
                    <div className="relative border-l-2 border-slate-100 ml-2.5 space-y-6">
                      {orderDetail.statusHistory?.map((h: any, index: number) => {
                         const cleanedNote = cleanHistoryNote(h.note);
                         return (
                          <div key={h.historyId} className="relative pl-6">
                            <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${index === 0 ? "bg-emerald-500" : "bg-slate-300"}`}></div>
                            <p className="font-bold text-slate-700 text-[13px]">{getStatusLabel(h.statusName)}</p>
                            <p className="text-[11px] text-slate-400 font-bold mt-0.5">{new Date(h.changedAt).toLocaleString("vi-VN")}</p>
                            {cleanedNote && (
                              <div className="mt-2.5 bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 italic font-medium border border-slate-100 shadow-sm">
                                  {cleanedNote}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HÓA ĐƠN IN */}
      {orderDetail && (
        <div id="admin-order-receipt" className="hidden print:block bg-white text-black">
          <div className="text-center mb-4">
            <h1 className="font-black text-2xl uppercase mb-1">BALLHUB SPORT</h1>
            <p className="text-[12px] font-bold">Hotline: 0886.301.661</p>
            <p className="text-[10px]">Đ/c: 58 Trúc Khê, Đống Đa, Hà Nội</p>
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg uppercase">Hóa Đơn Bán Hàng</h2>
          </div>
          <div className="text-[12px] space-y-1 mb-3">
            <div className="flex justify-between"><span>Mã HĐ:</span><span className="font-bold">#{orderDetail.orderId}</span></div>
            <div className="flex justify-between"><span>Ngày in:</span><span>{new Date().toLocaleString("vi-VN")}</span></div>
            <div className="flex justify-between"><span>Thu ngân:</span><span>Admin</span></div>
            <div className="flex justify-between"><span>Khách hàng:</span><span className="font-bold">{finalCusName}</span></div>
            <div className="flex justify-between"><span>SĐT:</span><span className="font-bold">{finalCusPhone}</span></div>
            {(displayAddress !== "Nhận tại cửa hàng (POS)" && displayAddress !== "---") && (
              <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-gray-400">
                <span className="shrink-0 mr-2">Giao tới:</span>
                <span className="font-bold text-right text-[11px]">{displayAddress}</span>
              </div>
            )}
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <table className="w-full text-[11px] mb-3">
            <thead><tr className="border-b border-black text-left font-bold"><th className="py-1 w-[55%]">SẢN PHẨM</th><th className="py-1 text-center">SL</th><th className="py-1 text-right">TỔNG</th></tr></thead>
            <tbody>
              {orderDetail.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-dotted border-gray-400">
                  <td className="py-2 pr-1">
                    <div className="font-bold leading-tight">{item.productName}</div>
                    <div className="text-[9px] text-gray-700">Sz: {item.sizeName} | {item.colorName}</div>
                  </td>
                  <td className="py-2 text-center align-top font-bold">{item.quantity}</td>
                  <td className="py-2 text-right align-top font-bold">{formatPrice(item.finalPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between"><span>Tổng tiền hàng:</span><span className="font-bold">{formatPrice(orderDetail.subTotal)}</span></div>
            {orderDetail.discountAmount > 0 && <div className="flex justify-between"><span>Giảm giá:</span><span className="font-bold">- {formatPrice(orderDetail.discountAmount)}</span></div>}
            <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-black">
              <span className="font-black text-sm uppercase">Cần thanh toán:</span>
              <span className="font-black text-lg">{formatPrice(orderDetail.totalAmount)}</span>
            </div>
            
            {customerCash > 0 && (
              <>
                <div className="flex justify-between mt-2 pt-2 border-t border-dotted border-black"><span>Tiền khách đưa:</span><span className="font-bold">{formatPrice(customerCash)}</span></div>
                <div className="flex justify-between mt-1"><span>Tiền thừa trả khách:</span><span className="font-bold">{formatPrice(changeAmount)}</span></div>
              </>
            )}
          </div>
          <div className="border-b-2 border-dashed border-black my-4"></div>
          <div className="text-center text-[12px] font-bold">
            <p>CẢM ƠN VÀ HẸN GẶP LẠI!</p>
          </div>
        </div>
      )}

      <ConfirmModal 
        open={confirmOpen} 
        title="Xác nhận thay đổi?" 
        description={`Bạn chắc chắn muốn chuyển đơn hàng sang trạng thái: ${getStatusLabel(STATUS_OPTIONS.find(s => s.id === selectedStatusId)?.name || "")}?`} 
        variant="info" 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeSubmit} 
      />
    </>
  );
};