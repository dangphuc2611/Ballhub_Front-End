"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Loader2, Printer } from "lucide-react";
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
  // ✅ LOGIC MÓC DỮ LIỆU "CHUẨN" TỪ GHI CHÚ VÀ ĐỊA CHỈ
  // ==========================================
  let savedCustomerCash: number | null = null;
  let displayAddress = orderDetail?.deliveryAddress || "Nhận tại cửa hàng (POS)";
  
  // Mặc định lấy từ Backend (nếu là đơn Online thì nó đúng)
  let finalCusName = orderDetail?.fullName || orderDetail?.userFullName || "Khách lẻ";
  let finalCusPhone = orderDetail?.phone || orderDetail?.userPhone || "---";

  // 1. Móc tiền khách đưa ra khỏi địa chỉ
  if (displayAddress.includes("[CASH:")) {
    const match = displayAddress.match(/\[CASH:(\d+)\]/);
    if (match && match[1]) {
      savedCustomerCash = Number(match[1]);
    }
    displayAddress = displayAddress.replace(/\s*-\s*\[CASH:\d+\]/, "");
  }

  // 2. Móc Tên và SĐT thật từ Note ra (Chống Backend tự nhận Admin làm khách)
  if (orderDetail?.note?.includes("POS_CUSTOMER|")) {
    const parts = orderDetail.note.split("|");
    if (parts.length >= 3) {
      finalCusName = parts[1];
      finalCusPhone = parts[2] === "Trống" ? "---" : parts[2];
    }
  }

  // Hàm dọn dẹp để chữ POS_CUSTOMER không hiện ra giao diện Lịch sử đơn hàng
  const cleanHistoryNote = (rawNote: string) => {
    if (!rawNote) return "";
    let cleaned = rawNote.replace(/POS_CUSTOMER\|[^|]+\|[^|]+(\|)?/g, "");
    cleaned = cleaned.replace(/\[CASH:\d+\]/g, "");
    return cleaned.trim();
  };

  const changeAmount = savedCustomerCash !== null ? savedCustomerCash - (orderDetail?.totalAmount || 0) : 0;

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
          setSelectedStatusId(currentStatus.id);
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setConfirmOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-order-receipt { 
            visibility: visible; 
            position: absolute; 
            left: 50%; 
            top: 20px; 
            transform: translateX(-50%); 
            width: 80mm; 
            margin: 0; 
            padding: 10px 15px; 
            color: #000; 
            font-family: 'Courier New', Courier, monospace; 
            font-size: 12px;
          }
          #admin-order-receipt * { visibility: visible; }
          @page { margin: 0; padding: 0; }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200 print:hidden">
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng #{orderDetail?.orderId}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Ngày đặt: {orderDetail?.orderDate ? new Date(orderDetail.orderDate).toLocaleString("vi-VN") : "N/A"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all text-sm shadow-sm">
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
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Họ và tên</span>
                        {/* ✅ HIỂN THỊ TÊN CHUẨN */}
                        <span className="font-semibold text-slate-700">{finalCusName}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs mb-1">Số điện thoại</span>
                        {/* ✅ HIỂN THỊ SĐT CHUẨN */}
                        <span className="font-semibold text-slate-700">{finalCusPhone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-400 text-xs mb-1">Địa chỉ giao hàng</span>
                        <span className="font-semibold text-slate-700 leading-relaxed">
                          {displayAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Sản phẩm</h3>
                    <div className="divide-y divide-slate-50">
                      {orderDetail.items?.map((item: any) => (
                        <div key={item.orderItemId} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {item.imageUrl ? (
                              <Image src={`http://localhost:8080${item.imageUrl}`} width={50} height={50} alt={item.productName} className="rounded-lg object-cover bg-slate-100 aspect-square" />
                            ) : (
                              <div className="w-[50px] h-[50px] bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">Không ảnh</div>
                            )}
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{item.productName}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.colorName} • Size {item.sizeName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-700 text-sm">{formatPrice(item.finalPrice)}</p>
                            <p className="text-xs text-slate-400 font-medium">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Tạm tính</span>
                        <span>{formatPrice(orderDetail.subTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Phí giao hàng</span>
                        <span>{formatPrice(orderDetail.shippingFee)}</span>
                      </div>
                      {orderDetail.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-500">
                          <span>Giảm giá {orderDetail.promoCode && `(${orderDetail.promoCode})`}</span>
                          <span>- {formatPrice(orderDetail.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-800 mt-2 pt-2 border-t border-slate-100 text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-emerald-600">{formatPrice(orderDetail.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider relative z-10">Cập nhật trạng thái</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                      <div>
                        <span className="block text-slate-400 text-xs mb-1 font-medium">Trạng thái hiện tại</span>
                        <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold shadow-inner">
                          {getStatusLabel(orderDetail.statusName)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Đổi trạng thái thành:</label>
                        <select value={selectedStatusId} onChange={(e) => setSelectedStatusId(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700">
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st.id} value={st.id}>{st.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Ghi chú (Tùy chọn)</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thêm lý do đổi trạng thái..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 resize-none" />
                      </div>
                      <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />} Cập nhật trạng thái
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Lịch sử đơn hàng</h3>
                    <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                      {orderDetail.statusHistory?.map((h: any, index: number) => {
                        const noteToDisplay = cleanHistoryNote(h.note);
                        return (
                          <div key={h.historyId} className="relative pl-6">
                            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${index === 0 ? "bg-emerald-500" : "bg-slate-300"}`}></div>
                            <p className="font-bold text-slate-700 text-sm">{getStatusLabel(h.statusName)}</p>
                            <p className="text-xs text-slate-400 font-medium">{new Date(h.changedAt).toLocaleString("vi-VN")}</p>
                            {noteToDisplay && (
                              <div className="mt-2 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 italic">{noteToDisplay}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ HÓA ĐƠN IN ĐÃ ĐƯỢC CHỈNH TÊN KHÁCH CHUẨN */}
      {orderDetail && (
        <div id="admin-order-receipt" className="hidden print:block bg-white text-black">
          <div className="text-center mb-4">
            <h1 className="font-black text-2xl uppercase mb-1">BALLHUB SPORT</h1>
            <p className="text-sm font-bold">Hotline: 0886.301.661</p>
            <p className="text-xs">Đ/c: 58 Trúc Khê, Đống Đa, Hà Nội</p>
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg uppercase">Hóa Đơn Bán Hàng</h2>
          </div>
          <div className="text-sm space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Mã HĐ:</span>
              <span className="font-bold">#{orderDetail.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày in:</span>
              <span>{new Date().toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>Admin</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span className="font-bold truncate max-w-[120px] text-right">
                {/* IN TÊN CHUẨN */}
                {finalCusName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SĐT:</span>
              <span className="font-bold">{finalCusPhone}</span>
            </div>
            {displayAddress && (
              <div className="flex justify-between mt-1 pt-1 border-t border-dotted border-gray-300">
                <span className="shrink-0 mr-2">Giao tới:</span>
                <span className="font-bold text-right text-xs">{displayAddress}</span>
              </div>
            )}
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1 font-bold w-[55%]">SẢN PHẨM</th>
                <th className="py-1 font-bold text-center w-[15%]">SL</th>
                <th className="py-1 font-bold text-right w-[30%]">TỔNG</th>
              </tr>
            </thead>
            <tbody>
              {orderDetail.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-dotted border-gray-400">
                  <td className="py-2 pr-1">
                    <div className="font-bold leading-tight mb-1">{item.productName}</div>
                    <div className="text-[10px] text-gray-700">Màu: {item.colorName} | Sz: {item.sizeName}</div>
                    <div className="text-[10px] text-gray-700">{formatPrice(item.finalPrice)}</div>
                  </td>
                  <td className="py-2 text-center align-top font-bold text-sm">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right align-top font-bold text-sm">
                    {formatPrice(item.finalPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold">{formatPrice(orderDetail.subTotal)}</span>
            </div>
            {orderDetail.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span className="font-bold">- {formatPrice(orderDetail.discountAmount)}</span>
              </div>
            )}
            {orderDetail.shippingFee > 0 && (
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-bold">{formatPrice(orderDetail.shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-black">
              <span className="font-black text-base uppercase">CẦN THANH TOÁN:</span>
              <span className="font-black text-xl">{formatPrice(orderDetail.totalAmount)}</span>
            </div>
            
            {savedCustomerCash !== null && (
              <>
                <div className="flex justify-between mt-1 text-sm">
                  <span>Tiền khách đưa:</span>
                  <span className="font-bold">{formatPrice(savedCustomerCash)}</span>
                </div>
                <div className="flex justify-between mt-1 text-sm">
                  <span>Tiền thừa trả khách:</span>
                  <span className="font-bold">{formatPrice(changeAmount)}</span>
                </div>
              </>
            )}
          </div>
          <div className="border-b-2 border-dashed border-black my-4"></div>
          <div className="text-center text-sm font-bold">
            <p>CẢM ƠN VÀ HẸN GẶP LẠI!</p>
            <p className="text-xs font-normal mt-2 italic px-2">
              (Hỗ trợ đổi Size trong 3 ngày nếu còn nguyên tem mác và hóa đơn)
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Cập nhật trạng thái?"
        description="Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này không?"
        variant="info"
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeSubmit}
      />
    </>
  );
};