"use client";

import { useEffect, useState } from "react";
import { Printer, Loader2, FileText } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  ThermalReceiptBody,
  ThermalReceiptPrintStyles,
  mapOrderDetailToThermal,
  type ThermalReceiptData,
} from "@/components/admin/ThermalReceipt";

const RECEIPT_PRINT_ID = "admin-invoice-receipt";

export function InvoiceView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [receiptData, setReceiptData] = useState<ThermalReceiptData | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(
          `http://localhost:8080/api/orders/admin/all?page=${page}&size=15`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        const payload = result?.data ?? result;
        setOrders(payload?.content ?? []);
        setTotalPages(payload?.totalPages ?? 1);
      } catch {
        toast.error("Không tải được danh sách đơn");
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, [page]);

  const loadDetail = async (orderId: number) => {
    setSelectedId(orderId);
    setLoadingDetail(true);
    setReceiptData(null);
    try {
      const token = localStorage.getItem("refreshToken");
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detail = res.data.data ?? res.data;
      const mapped = mapOrderDetailToThermal(detail);
      setReceiptData(mapped);
      if (!mapped) toast.error("Không đọc được chi tiết đơn");
    } catch {
      toast.error("Không tải chi tiết đơn");
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <>
      <ThermalReceiptPrintStyles targetId={RECEIPT_PRINT_ID} />

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-emerald-600" size={22} />
            <h3 className="font-bold text-lg text-slate-800">Danh sách đơn — in hóa đơn</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Chọn đơn để xem phiếu in trong khung bên phải, rồi bấm In.
          </p>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {orders.length === 0 ? (
                <p className="p-6 text-center text-slate-400 text-sm">Chưa có đơn</p>
              ) : (
                orders.map((o) => (
                  <button
                    key={o.orderId}
                    type="button"
                    onClick={() => loadDetail(o.orderId)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 ${
                      selectedId === o.orderId ? "bg-emerald-50 border-l-4 border-emerald-500" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-emerald-600">HD{o.orderId}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {o.statusName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {o.userFullName || "Khách"}
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {formatMoney(o.totalAmount)}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs text-slate-500 py-1.5">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="bg-slate-100/80 p-6 rounded-2xl border border-slate-200 min-h-[420px]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-slate-800">Xem trước hóa đơn (khổ nhiệt 80mm)</h3>
              <button
                type="button"
                disabled={!receiptData}
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-40 print:hidden"
              >
                <Printer size={18} /> In hóa đơn
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-inner border border-slate-200 p-4 overflow-auto max-h-[calc(100vh-240px)] flex justify-center print:shadow-none print:border-0">
              {loadingDetail ? (
                <div className="flex flex-1 items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
              ) : receiptData ? (
                <ThermalReceiptBody
                  id={RECEIPT_PRINT_ID}
                  data={receiptData}
                  className="w-full max-w-[80mm] mx-auto border border-dashed border-slate-200 p-3 rounded-lg print:border-0"
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400 text-sm text-center px-6">
                  <FileText size={40} className="mb-3 opacity-40" />
                  Chọn một đơn bên trái để hiển thị hóa đơn tại đây.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
