"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Loader2, Printer, Banknote, Mail, Phone, MapPin, User, Package, History } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type OrderDetailModalProps = {
  orderId: number;
  onClose: () => void;
  onRefresh: () => void;
};

const STATUS_OPTIONS = [
  { id: 1, name: "PENDING", label: "Chờ xác nhận" },
  { id: 2, name: "CONFIRMED", label: "Đã xác nhận" },
  { id: 3, name: "SHIPPING", label: "Đang giao hàng" },
  { id: 4, name: "DELIVERED", label: "Đã giao hàng" },
  { id: 5, name: "CANCELLED", label: "Đã hủy" },
  { id: 6, name: "RETURNED", label: "Trả hàng/Hoàn tiền" },
];

const getStatusLabel = (statusName: string) => {
  const status = STATUS_OPTIONS.find((s) => s.name === statusName);
  return status ? status.label : statusName;
};

export const OrderDetailModal = ({ orderId, onClose, onRefresh }: OrderDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; } | null>(null);

  const [selectedStatusId, setSelectedStatusId] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ==========================================
  // ✅ LOGIC XỬ LÝ DỮ LIỆU THÔNG MINH
  // ==========================================
  
  let finalCusName = orderDetail?.userFullName || "Khách lẻ";
  let finalCusPhone = orderDetail?.userPhone || "---";
  let extractedCashFromNote: number | null = null;

  if (orderDetail?.statusHistory) {
    const posNote = orderDetail.statusHistory.find((h: any) => h.note?.includes("POS"));
    if (posNote) {
      const raw = posNote.note;
      const nameParts = raw.split("|");
      // Móc tên & SĐT từ chuỗi Note: POS|Tên|SĐT
      if (nameParts.length >= 2 && !nameParts[1].includes("POS")) finalCusName = nameParts[1];
      if (nameParts.length >= 3 && nameParts[2] !== "Trống") finalCusPhone = nameParts[2];
      // Móc tiền nếu lỡ dính trong Note (đơn cũ)
      const cashMatch = raw.match(/CASH:(\d+)/);
      if (cashMatch) extractedCashFromNote = Number(cashMatch[1]);
    }
  }

  // Ưu tiên cột Database mới, nếu bằng 0 hoặc null thì mới lấy từ Note
  const customerCash = orderDetail?.customerCash > 0 ? orderDetail.customerCash : (extractedCashFromNote || 0);
  const changeAmount = orderDetail?.changeAmount > 0 ? orderDetail.changeAmount : (customerCash > 0 ? customerCash - (orderDetail?.totalAmount || 0) : 0);
  const displayAddress = orderDetail?.deliveryAddress || "Nhận tại cửa hàng (POS)";

  // Xóa sạch các chuỗi kỹ thuật khi hiển thị ở mục Lịch sử
  const cleanHistoryNote = (rawNote: string) => {
    if (!rawNote) return "";
    if (rawNote.includes("POS") || rawNote.includes("CASH:")) {
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
        if (currentStatus) setSelectedStatusId(currentStatus.id);
      } catch (error: any) {
        setMessage({ type: "error", text: "Không thể tải chi tiết đơn hàng" });
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  const executeSubmit = async () => {
    setSubmitting(true); setMessage(null); setConfirmOpen(false);
    try {
      const token = localStorage.getItem("refreshToken");
      await axios.put(
        `http://localhost:8080/api/orders/admin/${orderId}/status?statusId=${selectedStatusId}&note=${encodeURIComponent(note)}`,
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Cập nhật trạng thái thành công!" });
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderDetail(res.data.data ?? res.data);
      setNote(""); onRefresh();
      setTimeout(() => { onClose(); }, 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: "Cập nhật trạng thái thất bại" });
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
          
          {/* HEADER MODAL */}
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng #{orderDetail?.orderId}</h2>
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
            {message && (
              <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 shadow-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                {message.type === "success" ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                <p className="text-sm font-semibold">{message.text}</p>
              </div>
            )}

            {orderDetail && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CỘT TRÁI: THÔNG TIN KHÁCH & SẢN PHẨM */}
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
                              <p className="text-xs text-slate-500 mt-1 font-medium">Màu: {item.colorName} • Size: {item.sizeName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800 text-sm">{formatPrice(item.finalPrice)}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">x {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* BOX: TỔNG TIỀN */}
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

                      {/* ✅ BOX TIỀN KHÁCH ĐƯA / TIỀN THỪA (TỰ ĐỘNG LẤY TỪ GHI CHÚ NẾU DB TRỐNG) */}
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

                {/* CỘT PHẢI: TRẠNG THÁI & LỊCH SỬ */}
                <div className="space-y-6">
                  
                  {/* BOX: CẬP NHẬT TRẠNG THÁI */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wider relative z-10">Cập nhật trạng thái</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="space-y-4 relative z-10">
                      <div>
                        <span className="block text-slate-400 text-[10px] mb-1.5 font-bold uppercase tracking-widest">Trạng thái hiện tại</span>
                        <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-black shadow-sm border border-slate-200">
                          {getStatusLabel(orderDetail.statusName)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Đổi trạng thái thành:</label>
                        <select value={selectedStatusId} onChange={(e) => setSelectedStatusId(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold text-slate-700">
                          {STATUS_OPTIONS.map((st) => <option key={st.id} value={st.id}>{st.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Ghi chú (Tùy chọn)</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập lý do thay đổi..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 resize-none shadow-inner" />
                      </div>
                      <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-200 disabled:opacity-50">
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
                      {orderDetail.statusHistory?.map((h: any, index: number) => (
                        <div key={h.historyId} className="relative pl-6">
                          <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${index === 0 ? "bg-emerald-500" : "bg-slate-300"}`}></div>
                          <p className="font-bold text-slate-700 text-[13px]">{getStatusLabel(h.statusName)}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{new Date(h.changedAt).toLocaleString("vi-VN")}</p>
                          {h.note && (
                             <div className="mt-2.5 bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 italic font-medium border border-slate-100 shadow-sm">
                                {cleanHistoryNote(h.note)}
                             </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ HÓA ĐƠN IN: CĂN GIỮA, CHUẨN KÍCH THƯỚC 80MM */}
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
            {orderDetail.deliveryAddress && (
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
            <p className="text-[10px] font-normal mt-2 italic px-2">(Hỗ trợ đổi Size trong 3 ngày nếu còn nguyên hóa đơn)</p>
          </div>
        </div>
      )}

      <ConfirmModal open={confirmOpen} title="Cập nhật trạng thái?" description="Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này không?" variant="info" onClose={() => setConfirmOpen(false)} onConfirm={executeSubmit} />
    </>
  );
};