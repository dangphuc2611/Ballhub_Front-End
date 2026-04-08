"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
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

// ✅ HÀM DỊCH TỰ ĐỘNG TỪ TIẾNG ANH SANG TIẾNG VIỆT
const getStatusLabel = (statusName: string) => {
  const status = STATUS_OPTIONS.find((s) => s.name === statusName);
  return status ? status.label : statusName;
};

export const OrderDetailModal = ({ orderId, onClose, onRefresh }: OrderDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [selectedStatusId, setSelectedStatusId] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [posCodPaid, setPosCodPaid] = useState(false);
  const [posCodDelivered, setPosCodDelivered] = useState(false);
  const [savingCodFlags, setSavingCodFlags] = useState(false);
  const [posVnpayDelivered, setPosVnpayDelivered] = useState(false);
  const [savingVnpayDel, setSavingVnpayDel] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data.data ?? res.data;
        setOrderDetail(data);

        const currentStatus = STATUS_OPTIONS.find((s) => s.name === data.statusName);
        if (currentStatus) {
          setSelectedStatusId(currentStatus.id);
        }
        setPosCodPaid(!!data.posCodPaid);
        setPosCodDelivered(!!data.posCodDelivered);
        setPosVnpayDelivered(!!data.posVnpayDelivered);
      } catch (error: any) {
        console.error("Fetch order detail error:", error);
        setMessage({
          type: "error",
          text: "Không thể tải chi tiết đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const executeSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    setConfirmOpen(false);

    try {
      const token = localStorage.getItem("refreshToken");
      await axios.put(
        `http://localhost:8080/api/orders/admin/${orderId}/status?statusId=${selectedStatusId}&note=${encodeURIComponent(note)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        text: "Cập nhật trạng thái thành công!",
      });

      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrderDetail(res.data.data ?? res.data);
      setNote("");

      onRefresh();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Cập nhật trạng thái thất bại";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const isPosCodOrder =
    orderDetail?.isPosOrder === true && orderDetail?.paymentMethodId === 1;

  const posCodLocked =
    orderDetail?.posCodPaid === true && orderDetail?.posCodDelivered === true;

  const isPosVnpayOrder =
    orderDetail?.isPosOrder === true && orderDetail?.paymentMethodId === 2;

  const posVnpayDeliveredLocked = orderDetail?.posVnpayDelivered === true;

  const handleSaveVnpayDelivered = async () => {
    setSavingVnpayDel(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("refreshToken");
      await axios.put(
        `http://localhost:8080/api/orders/admin/${orderId}/pos-vnpay-delivered`,
        {},
        {
          params: { delivered: posVnpayDelivered },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data ?? res.data;
      setOrderDetail(data);
      setPosVnpayDelivered(!!data.posVnpayDelivered);
      setMessage({ type: "success", text: "Đã cập nhật giao hàng (POS VNPAY)." });
      onRefresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Cập nhật thất bại";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSavingVnpayDel(false);
    }
  };

  const handleSaveCodFlags = async () => {
    setSavingCodFlags(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("refreshToken");
      await axios.put(
        `http://localhost:8080/api/orders/admin/${orderId}/pos-cod-flags`,
        {},
        {
          params: { codPaid: posCodPaid, codDelivered: posCodDelivered },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data ?? res.data;
      setOrderDetail(data);
      setPosCodPaid(!!data.posCodPaid);
      setPosCodDelivered(!!data.posCodDelivered);
      setMessage({ type: "success", text: "Đã cập nhật thu COD / giao hàng." });
      onRefresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Cập nhật thất bại";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setSavingCodFlags(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chi tiết đơn hàng #{orderDetail?.orderId}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Ngày đặt: {orderDetail?.orderDate ? new Date(orderDetail.orderDate).toLocaleString("vi-VN") : "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
          {message && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl mb-6 shadow-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} className="shrink-0" />
              ) : (
                <AlertCircle size={20} className="shrink-0" />
              )}
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          )}

          {orderDetail && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <span className="block text-slate-400 text-xs mb-1">Họ và tên</span>
                      <span className="font-semibold text-slate-700">{orderDetail.userFullName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs mb-1">Số điện thoại</span>
                      <span className="font-semibold text-slate-700">{orderDetail.userPhone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400 text-xs mb-1">Email</span>
                      <span className="font-semibold text-slate-700">{orderDetail.userEmail}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400 text-xs mb-1">Địa chỉ giao hàng</span>
                      <span className="font-semibold text-slate-700 leading-relaxed">
                        {orderDetail.deliveryAddress}
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
                            <Image
                              src={`http://localhost:8080${item.imageUrl}`}
                              width={50}
                              height={50}
                              alt={item.productName}
                              className="rounded-lg object-cover bg-slate-100 aspect-square"
                            />
                          ) : (
                            <div className="w-[50px] h-[50px] bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                              Không có ảnh
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{item.productName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.colorName} • Size {item.sizeName}
                            </p>
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
                    <div className="flex justify-between text-rose-500">
                      <span>Giảm giá {orderDetail.promoCode && `(${orderDetail.promoCode})`}</span>
                      <span>- {formatPrice(orderDetail.discountAmount)}</span>
                    </div>
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

                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider relative z-10">
                    Cập nhật trạng thái
                  </h3>

                  {isPosCodOrder && (
                    <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-3">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        POS — thu tiền COD và giao hàng
                      </p>
                      <p className="text-[11px] text-amber-800/90 leading-snug">
                        Đánh dấu khi đã thu tiền mặt và khi đã giao cho khách (tại quầy hoặc ship). Khi đủ cả
                        hai và bấm Lưu, đơn chuyển sang trạng thái Đã giao hàng và không thể bỏ tick sau đó.
                      </p>
                      {posCodLocked && (
                        <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 rounded-lg px-3 py-2">
                          Đã hoàn tất thu tiền và giao hàng — không thể chỉnh lại các ô bên dưới.
                        </p>
                      )}
                      <label
                        className={`flex items-center gap-2 text-sm font-medium text-slate-700 ${posCodLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          disabled={posCodLocked}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-60"
                          checked={posCodPaid}
                          onChange={(e) => setPosCodPaid(e.target.checked)}
                        />
                        Đã thu tiền (COD)
                      </label>
                      <label
                        className={`flex items-center gap-2 text-sm font-medium text-slate-700 ${posCodLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          disabled={posCodLocked}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-60"
                          checked={posCodDelivered}
                          onChange={(e) => setPosCodDelivered(e.target.checked)}
                        />
                        Đã giao hàng
                      </label>
                      <button
                        type="button"
                        onClick={handleSaveCodFlags}
                        disabled={savingCodFlags || posCodLocked}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingCodFlags ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {posCodLocked ? "Đã khóa" : "Lưu COD / giao hàng"}
                      </button>
                    </div>
                  )}

                  {isPosVnpayOrder && (
                    <div className="mb-5 p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-3">
                      <p className="text-xs font-bold text-sky-900 uppercase tracking-wide">
                        POS — VNPAY: thanh toán và giao hàng
                      </p>
                      <p className="text-[11px] text-sky-900/90 leading-snug">
                        Đã thanh toán chỉ bật khi cổng VNPAY trả mã thành công. Hủy thanh toán trên cổng sẽ
                        không bật. Khi đã trả tiền, tick{" "}
                        <span className="font-semibold">Đã giao hàng</span> sau khi đưa hàng cho khách.
                      </p>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-default opacity-90">
                        <input
                          type="checkbox"
                          disabled
                          className="rounded border-slate-300 text-sky-600 opacity-80"
                          checked={orderDetail?.vnpayPaid === true}
                        />
                        Đã thanh toán (VNPAY)
                      </label>
                      {!orderDetail?.vnpayPaid && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          Chưa ghi nhận thanh toán — hoàn tất trên trang VNPAY hoặc đơn sẽ ở trạng thái chờ.
                        </p>
                      )}
                      <label
                        className={`flex items-center gap-2 text-sm font-medium text-slate-700 ${orderDetail?.vnpayPaid && !posVnpayDeliveredLocked ? "cursor-pointer" : "cursor-not-allowed opacity-80"}`}
                      >
                        <input
                          type="checkbox"
                          disabled={!orderDetail?.vnpayPaid || posVnpayDeliveredLocked}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 disabled:opacity-60"
                          checked={posVnpayDelivered}
                          onChange={(e) => setPosVnpayDelivered(e.target.checked)}
                        />
                        Đã giao hàng
                      </label>
                      {posVnpayDeliveredLocked && (
                        <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-200 rounded-lg px-3 py-2">
                          Đã giao — không thể bỏ tick.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveVnpayDelivered}
                        disabled={savingVnpayDel || posVnpayDeliveredLocked || !orderDetail?.vnpayPaid}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingVnpayDel ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        {posVnpayDeliveredLocked ? "Đã khóa" : "Lưu giao hàng"}
                      </button>
                    </div>
                  )}

                  {!orderDetail?.isPosOrder && orderDetail?.paymentMethodId === 2 && (
                    <div className="mb-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                        Thanh toán VNPAY (đơn online)
                      </p>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-default">
                        <input
                          type="checkbox"
                          disabled
                          className="rounded border-slate-300"
                          checked={orderDetail?.vnpayPaid === true}
                        />
                        Đã thanh toán qua VNPAY
                      </label>
                      <p className="text-[11px] text-indigo-900/80">
                        Giao hàng theo trạng thái đơn bên dưới (Đang giao → Đã giao).
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                      <span className="block text-slate-400 text-xs mb-1 font-medium">Trạng thái hiện tại</span>
                      <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold shadow-inner">
                        {/* ✅ ĐÃ SỬA THÀNH TIẾNG VIỆT */}
                        {getStatusLabel(orderDetail.statusName)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Đổi trạng thái thành:</label>
                      <select
                        value={selectedStatusId}
                        onChange={(e) => setSelectedStatusId(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700"
                      >
                        {/* ✅ CHỈ HIỆN NHÃN TIẾNG VIỆT TRONG DROPDOWN */}
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Ghi chú (Tùy chọn)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Thêm lý do đổi trạng thái..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-slate-700 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                      Cập nhật trạng thái
                    </button>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Lịch sử đơn hàng</h3>
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                    {orderDetail.statusHistory?.map((h: any, index: number) => (
                      <div key={h.historyId} className="relative pl-6">
                        <div
                          className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                            index === 0 ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        ></div>
                        {/* ✅ ĐÃ SỬA THÀNH TIẾNG VIỆT */}
                        <p className="font-bold text-slate-700 text-sm">{getStatusLabel(h.statusName)}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          {new Date(h.changedAt).toLocaleString("vi-VN")}
                        </p>
                        {h.note && (
                          <div className="mt-2 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 italic">{h.note}</div>
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
      <ConfirmModal
        open={confirmOpen}
        title="Cập nhật trạng thái?"
        description="Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng này không?"
        variant="info"
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeSubmit}
      />
    </div>
  );
};