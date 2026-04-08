"use client";

export type ThermalReceiptLine = {
  productName: string;
  colorName?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
};

export type ThermalReceiptData = {
  orderId: number;
  customerName: string;
  displayDate: string;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethodId: number;
  /** Chỉ dùng khi POS VNPAY chưa xác nhận — hiện Phiếu tạm tính */
  isVnpayPending?: boolean;
  lines: ThermalReceiptLine[];
};

export function formatThermalPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function mapOrderDetailToThermal(detail: any): ThermalReceiptData | null {
  if (!detail?.orderId) return null;
  const lines: ThermalReceiptLine[] = (detail.items || []).map((item: any) => ({
    productName: item.productName || "Sản phẩm",
    colorName: item.colorName,
    sizeName: item.sizeName,
    quantity: item.quantity ?? 0,
    unitPrice: Number(item.finalPrice ?? item.originalPrice ?? 0),
  }));
  return {
    orderId: detail.orderId,
    customerName: detail.userFullName || "Khách lẻ",
    displayDate: detail.orderDate
      ? new Date(detail.orderDate).toLocaleString("vi-VN")
      : new Date().toLocaleString("vi-VN"),
    subTotal: Number(detail.subTotal ?? 0),
    discountAmount: Number(detail.discountAmount ?? 0),
    shippingFee: Number(detail.shippingFee ?? 0),
    total: Number(detail.totalAmount ?? 0),
    paymentMethodId: detail.paymentMethodId ?? 1,
    isVnpayPending:
      detail.paymentMethodId === 2 && detail.vnpayPaid !== true,
    lines,
  };
}

/** Style in — `targetId` khớp `id` của khối hóa đơn (chỉ ký tự hợp lệ cho id HTML) */
export function ThermalReceiptPrintStyles({ targetId }: { targetId: string }) {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #${targetId} {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          max-width: 80mm;
          margin: 0;
          padding: 10px 15px;
          color: #000;
          font-family: 'Courier New', Courier, monospace;
        }
        #${targetId} * { visibility: visible; }
        @page { margin: 0; }
      }
    `}</style>
  );
}

type ThermalReceiptBodyProps = {
  id: string;
  data: ThermalReceiptData;
  className?: string;
};

export function ThermalReceiptBody({ id, data, className = "" }: ThermalReceiptBodyProps) {
  const isProvisional = data.paymentMethodId === 2 && data.isVnpayPending;
  const docTitle = isProvisional ? "Phiếu Tạm Tính" : "Hóa Đơn Bán Hàng";

  return (
    <div id={id} className={`bg-white text-black ${className}`}>
      <div className="text-center mb-4">
        <h1 className="font-black text-2xl uppercase mb-1">BALLHUB SPORT</h1>
        <p className="text-sm font-bold">Hotline: 0886.301.661</p>
        <p className="text-xs">Đ/c: 58 Trúc Khê, Đống Đa, Hà Nội</p>
      </div>
      <div className="border-b-2 border-dashed border-black mb-3" />
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg uppercase">{docTitle}</h2>
      </div>
      <div className="text-sm space-y-1 mb-3">
        <div className="flex justify-between">
          <span>Mã HĐ:</span>
          <span className="font-bold">#{data.orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Ngày:</span>
          <span>{data.displayDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân:</span>
          <span>Admin</span>
        </div>
        <div className="flex justify-between">
          <span>Khách hàng:</span>
          <span className="font-bold truncate max-w-[120px] text-right">{data.customerName}</span>
        </div>
      </div>
      <div className="border-b-2 border-dashed border-black mb-3" />
      <table className="w-full text-sm mb-3">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1 font-bold w-[50%]">SẢN PHẨM</th>
            <th className="py-1 font-bold text-center w-[20%]">SL</th>
            <th className="py-1 font-bold text-right w-[30%]">TỔNG</th>
          </tr>
        </thead>
        <tbody>
          {data.lines.map((item, idx) => (
            <tr key={idx} className="border-b border-dotted border-gray-400">
              <td className="py-2 pr-1">
                <div className="font-bold leading-tight mb-1">{item.productName}</div>
                <div className="text-xs text-gray-700">
                  Màu: {item.colorName || "—"} | Sz: {item.sizeName || "—"}
                </div>
                <div className="text-xs text-gray-700">{formatThermalPrice(item.unitPrice)}</div>
              </td>
              <td className="py-2 text-center align-top font-bold text-base">{item.quantity}</td>
              <td className="py-2 text-right align-top font-bold">
                {formatThermalPrice(item.unitPrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-b-2 border-dashed border-black mb-3" />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span>Tổng tiền hàng:</span>
          <span className="font-bold">{formatThermalPrice(data.subTotal)}</span>
        </div>
        {data.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Giảm giá:</span>
            <span className="font-bold">- {formatThermalPrice(data.discountAmount)}</span>
          </div>
        )}
        {data.shippingFee > 0 && (
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span className="font-bold">{formatThermalPrice(data.shippingFee)}</span>
          </div>
        )}
        <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-black">
          <span className="font-black text-base uppercase">Cần thanh toán:</span>
          <span className="font-black text-xl">{formatThermalPrice(data.total)}</span>
        </div>
      </div>
      <div className="mt-3 text-right text-xs italic font-bold">
        {data.paymentMethodId === 2
          ? isProvisional
            ? "(Đơn hàng chờ thanh toán VNPAY)"
            : "(Đã thanh toán bằng VNPAY)"
          : "(Thanh toán COD / Tiền mặt)"}
      </div>
      <div className="border-b-2 border-dashed border-black my-4" />
      <div className="text-center text-sm font-bold">
        <p>CẢM ƠN VÀ HẸN GẶP LẠI!</p>
        <p className="text-xs font-normal mt-2 italic px-2">
          (Hỗ trợ đổi Size trong 3 ngày nếu còn nguyên tem mác và hóa đơn)
        </p>
      </div>
    </div>
  );
}

/** Gom từ state giỏ POS (PosView) */
export function mapPosCartToThermal(order: any): ThermalReceiptData | null {
  if (!order?.items?.length) return null;
  const lines: ThermalReceiptLine[] = order.items.map((item: any) => ({
    productName: item.productName,
    colorName: item.colorName,
    sizeName: item.sizeName,
    quantity: item.quantity,
    unitPrice: item.discountPrice ?? item.price ?? 0,
  }));
  const subTotal = order.subTotal ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const shippingFee = order.shippingFee ?? 0;
  const total = order.finalTotal ?? Math.max(0, subTotal - discountAmount) + shippingFee;
  return {
    orderId: typeof order.id === "number" ? order.id : parseInt(String(order.id).replace(/\D/g, ""), 10) || 0,
    customerName: order.customerName || "Khách lẻ",
    displayDate: order.displayDate || new Date().toLocaleString("vi-VN"),
    subTotal,
    discountAmount,
    shippingFee,
    total,
    paymentMethodId: order.paymentMethodId ?? 1,
    isVnpayPending: order.paymentMethodId === 2 && !order.isVnpaySuccess,
    lines,
  };
}
