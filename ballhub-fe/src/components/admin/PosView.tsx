"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  CreditCard,
  Printer,
  User,
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  X,
  Tag,
  MapPin,
  Wallet,
  XCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
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

  const [checkoutSuccessData, setCheckoutSuccessData] = useState<any>(null);

  // QUẢN LÝ TIỀN KHÁCH ĐƯA
  const [customerCash, setCustomerCash] = useState<number | "">("");

  const {
    orders,
    activeOrderId,
    addOrder,
    removeOrder,
    setActiveOrder,
    updateItemQuantity,
    removeItemFromActiveOrder,
    updateActiveOrderDetails,
    setAvailableVouchers,
    availableVouchers,
  } = usePosStore();

  const activeOrder = orders.find((o) => o.id === activeOrderId);

  // ==========================================
  // CẤU HÌNH API GIAO HÀNG NHANH (GHN)
  // ==========================================
  const GHN_TOKEN = "dd94ceb1-2e67-11f1-b97a-a2781b0fd428";
  const SHOP_DISTRICT_ID = 3440;

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProv, setSelectedProv] = useState<number | "">("");
  const [selectedDist, setSelectedDist] = useState<number | "">("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [street, setStreet] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [isTypingNewAddress, setIsTypingNewAddress] = useState(true);

  useEffect(() => {
    fetch(
      "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {
        headers: { token: GHN_TOKEN },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) setProvinces(data.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!activeOrder?.isDelivery || !isTypingNewAddress) return;
    const pName =
      provinces.find((p) => p.ProvinceID === selectedProv)?.ProvinceName || "";
    const dName =
      districts.find((d) => d.DistrictID === selectedDist)?.DistrictName || "";
    const wName =
      wards.find((w) => w.WardCode === selectedWard)?.WardName || "";
    const fullAddr = [street, wName, dName, pName].filter(Boolean).join(", ");
    updateActiveOrderDetails({ deliveryAddress: fullAddr });
  }, [selectedProv, selectedDist, selectedWard, street, isTypingNewAddress]);

  const calculateGHNShippingFee = async (distId: number, wardCode: string) => {
    if (!distId || !wardCode) return;
    const currentOrder = usePosStore
      .getState()
      .orders.find((o) => o.id === activeOrderId);
    const currentSubTotal =
      currentOrder?.items.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      ) || 0;
    if (currentSubTotal >= 1000000) {
      updateActiveOrderDetails({ shippingFee: 0 });
      return;
    }

    try {
      const response = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          method: "POST",
          headers: { token: GHN_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({
            service_type_id: 2,
            from_district_id: SHOP_DISTRICT_ID,
            to_district_id: distId,
            to_ward_code: wardCode,
            weight: 500,
          }),
        }
      );
      const result = await response.json();
      if (result.code === 200)
        updateActiveOrderDetails({ shippingFee: result.data.total });
      else toast.error("GHN không hỗ trợ tính phí khu vực này!");
    } catch (error) {
      console.error("Lỗi tính phí GHN", error);
    }
  };

  const calculateShippingFeeFromString = async (
    addressStr: string,
    totalAmount: number
  ) => {
    if (!addressStr || addressStr.trim() === "") return 0;
    if (totalAmount >= 1000000) return 0;

    try {
      const parts = addressStr.split(",").map((s) => s.trim().toLowerCase());
      if (parts.length < 3) return 30000;

      const provName = parts[parts.length - 1];
      const distName = parts[parts.length - 2];
      const wardName = parts[parts.length - 3];

      const matchedProv = provinces.find(
        (p) =>
          provName.includes(p.ProvinceName.toLowerCase()) ||
          p.ProvinceName.toLowerCase().includes(provName)
      );
      if (!matchedProv) return 30000;

      const distRes = await fetch(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${matchedProv.ProvinceID}`,
        { headers: { token: GHN_TOKEN } }
      );
      const distData = await distRes.json();
      if (distData.code !== 200) return 30000;

      let matchedDist = distData.data.find((d: any) => {
        const dName = d.DistrictName.toLowerCase();
        return (
          distName.includes(dName) ||
          dName.includes(
            distName.replace(/(quận|huyện|thị xã|thành phố)\s+/g, "")
          )
        );
      });
      if (!matchedDist) return 30000;

      const wardRes = await fetch(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${matchedDist.DistrictID}`,
        { headers: { token: GHN_TOKEN } }
      );
      const wardData = await wardRes.json();
      let matchedWardCode = "";
      if (wardData.code === 200) {
        const matchedWard = wardData.data.find((w: any) => {
          const wName = w.WardName.toLowerCase();
          return (
            wardName.includes(wName) ||
            wName.includes(wardName.replace(/(phường|xã|thị trấn)\s+/g, ""))
          );
        });
        if (matchedWard) matchedWardCode = matchedWard.WardCode;
      }

      const feeRes = await fetch(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          method: "POST",
          headers: { token: GHN_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({
            service_type_id: 2,
            from_district_id: SHOP_DISTRICT_ID,
            to_district_id: matchedDist.DistrictID,
            to_ward_code: matchedWardCode,
            weight: 500,
          }),
        }
      );

      const feeResult = await feeRes.json();
      if (feeResult.code === 200) return feeResult.data.total;
      return 30000;
    } catch (error) {
      console.error("Lỗi bóc tách chuỗi GHN:", error);
      return 30000;
    }
  };

  useEffect(() => {
    if (
      !activeOrder ||
      !activeOrder.isDelivery ||
      isTypingNewAddress ||
      !activeOrder.deliveryAddress
    )
      return;

    const updateFeeFromBook = async () => {
      const currentSubTotal = activeOrder.items.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      );
      if (currentSubTotal >= 1000000) {
        updateActiveOrderDetails({ shippingFee: 0 });
        return;
      }
      const fee = await calculateShippingFeeFromString(
        activeOrder.deliveryAddress,
        currentSubTotal
      );
      updateActiveOrderDetails({ shippingFee: fee });
    };
    updateFeeFromBook();
  }, [activeOrder?.deliveryAddress, isTypingNewAddress, provinces]);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem("refreshToken");
        const res = await fetch(`http://localhost:8080/api/promotions/active`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.success && result.data)
          setAvailableVouchers(result.data.content || result.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchVouchers();
  }, [setAvailableVouchers]);

  const subTotal =
    activeOrder?.items.reduce(
      (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
      0
    ) || 0;
  const isFreeshipEligible = subTotal >= 1000000;

  useEffect(() => {
    if (!activeOrder || !activeOrder.isDelivery) return;
    if (isFreeshipEligible && activeOrder.shippingFee !== 0) {
      updateActiveOrderDetails({ shippingFee: 0 });
      toast.success("Đơn hàng trên 1 triệu đã được MIỄN PHÍ VẬN CHUYỂN!", {
        icon: "🎉",
      });
    } else if (
      !isFreeshipEligible &&
      activeOrder.shippingFee === 0 &&
      selectedDist &&
      selectedWard &&
      isTypingNewAddress
    ) {
      calculateGHNShippingFee(Number(selectedDist), selectedWard);
    }
  }, [subTotal, activeOrder?.isDelivery, isFreeshipEligible]);

  const calculateDiscount = (voucher: any, currentSubTotal: number) => {
    if (!voucher || currentSubTotal < voucher.minOrderAmount) return 0;
    let discount = 0;
    if (voucher.discountPercent) {
      discount = (currentSubTotal * voucher.discountPercent) / 100;
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    } else {
      discount = voucher.maxDiscountAmount || 0;
    }
    return Math.floor(discount);
  };

  useEffect(() => {
    if (activeOrder?.appliedVoucher && subTotal < activeOrder.appliedVoucher.minOrderAmount) {
      updateActiveOrderDetails({ appliedVoucher: null, discountAmount: 0 });
      toast.error(`Mã ${activeOrder.appliedVoucher.promoCode} đã bị gỡ do đơn không đủ điều kiện!`);
    }
  }, [subTotal, activeOrder?.appliedVoucher]);

  const discountAmount = activeOrder?.appliedVoucher ? calculateDiscount(activeOrder.appliedVoucher, subTotal) : 0;
  const shippingFee = activeOrder?.isDelivery ? activeOrder?.shippingFee || 0 : 0;
  const finalTotal = Math.max(0, subTotal - discountAmount) + shippingFee;
  const totalItems = activeOrder?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  // TÍNH TIỀN THỪA
  const changeAmount = (customerCash as number) - finalTotal;

  useEffect(() => {
    setCustomerCash("");
  }, [activeOrderId, activeOrder?.paymentMethodId]);

  const handleApplyVoucherInput = () => {
    if (!promoInput.trim()) {
      toast.warning("Vui lòng nhập mã khuyến mãi!");
      return;
    }
    const voucher = availableVouchers.find(
      (v) => v.promoCode.toUpperCase() === promoInput.toUpperCase()
    );
    if (!voucher) {
      toast.error("Mã giảm giá không hợp lệ!");
      return;
    }
    if (subTotal < voucher.minOrderAmount) {
      toast.error(`Đơn hàng chưa đủ ${formatPrice(voucher.minOrderAmount)}`);
      return;
    }
    updateActiveOrderDetails({ appliedVoucher: voucher, discountAmount: calculateDiscount(voucher, subTotal) });
    toast.success(`Đã áp dụng mã ${voucher.promoCode}`);
    setPromoInput("");
  };

  const handleSelectVoucher = (voucher: PosVoucher) => {
    if (subTotal < voucher.minOrderAmount) {
      toast.error(`Đơn hàng chưa đủ ${formatPrice(voucher.minOrderAmount)}`);
      return;
    }
    updateActiveOrderDetails({ appliedVoucher: voucher, discountAmount: calculateDiscount(voucher, subTotal) });
    toast.success(`Đã áp dụng mã ${voucher.promoCode}`);
  };

  const handleClearCustomer = () => {
    updateActiveOrderDetails({
      customerId: null,
      customerName: "",
      customerPhone: "",
      addressId: null,
      deliveryAddress: "",
      shippingFee: 0,
    });
    setIsTypingNewAddress(true);
    setSelectedProv("");
    setSelectedDist("");
    setSelectedWard("");
    setStreet("");
    toast.success("Đã chuyển về Khách lẻ");
  };

  const handleCheckout = async () => {
    if (!activeOrder || activeOrder.items.length === 0) return;
    if (
      activeOrder.isDelivery &&
      (!activeOrder.deliveryAddress ||
        activeOrder.deliveryAddress.trim() === "")
    ) {
      toast.warning("Vui lòng cung cấp địa chỉ giao hàng!");
      return;
    }

    const selectedMethod = activeOrder.paymentMethodId || 1;

    // CHẶN THANH TOÁN NẾU LÀ TIỀN MẶT VÀ KHÁCH ĐƯA THIẾU TIỀN
    if (selectedMethod === 1) {
      if (customerCash === "" || customerCash < finalTotal) {
        toast.error("Số tiền khách đưa không đủ để thanh toán!");
        return;
      }
    }

    let vnpayTab: Window | null = null;
    if (selectedMethod === 2) {
      vnpayTab = window.open("about:blank", "_blank");
      if (vnpayTab) {
        vnpayTab.document.write(
          "<h2 style='font-family:sans-serif; text-align:center; margin-top:100px; color:#333;'>Đang kết nối đến cổng thanh toán VNPAY... Vui lòng chờ vài giây.</h2>"
        );
        vnpayTab.document.close();
      } else {
        toast.warning("Trình duyệt đã chặn Pop-up. Nút mở VNPAY thủ công sẽ xuất hiện trên màn hình.");
      }
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("refreshToken");

      for (const item of activeOrder.items) {
        const res = await fetch(`http://localhost:8080/api/cart/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            variantId: item.variantId,
            quantity: item.quantity,
          }),
        });
        if (!res.ok) throw new Error("Lỗi cập nhật giỏ hàng");
      }

      const customerName =
        (activeOrder.customerName || "").trim() !== ""
          ? activeOrder.customerName
          : "Khách lẻ";
      const customerPhone =
        (activeOrder.customerPhone || "").trim() !== ""
          ? activeOrder.customerPhone
          : "Trống";
      let finalNote = `POS_CUSTOMER|${customerName}|${customerPhone}`;
      if (activeOrder.isDelivery && activeOrder.deliveryAddress) {
        finalNote += `|Giao đến: ${activeOrder.deliveryAddress}`;
        if (deliveryNote) finalNote += ` - Ghi chú: ${deliveryNote}`;
      }

      // ✅ NHÉT TIỀN KHÁCH ĐƯA VÀO GHI CHÚ ĐỂ LƯU VÀO DATABASE
      if (selectedMethod === 1 && customerCash !== "") {
        finalNote += `|CASH:${customerCash}`;
      }

      const orderPayload = {
        addressId: activeOrder.addressId || null,
        customerId: activeOrder.customerId || null,
        paymentMethodId: activeOrder.paymentMethodId || 1, 
        note: finalNote,
        promoCode: activeOrder.appliedVoucher?.promoCode || null,
        shippingFee: shippingFee,
        isPos: true,
        fullName: customerName,
        phone: customerPhone === "Trống" ? "" : customerPhone,
        deliveryAddress: activeOrder.deliveryAddress,
      };

      const orderRes = await fetch(`http://localhost:8080/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const resData = await orderRes.json();
      
      if (!orderRes.ok || resData.success === false) {
        if (vnpayTab) vnpayTab.close();
        throw new Error(resData.message || "Lỗi tạo đơn hàng. Vui lòng kiểm tra lại Backend!");
      }

      const realOrderId = 
        resData?.data?.order?.orderId || 
        resData?.data?.orderId || 
        resData?.data?.id || 
        resData?.data?.order?.id || 
        resData?.orderId || 
        resData?.id;
      
      if (!realOrderId) {
        console.error("Dữ liệu trả về từ Backend không có ID:", resData);
        if (vnpayTab) vnpayTab.close();
        throw new Error("Không lấy được mã đơn hàng từ hệ thống. Hủy tiến trình!");
      }

      const finalOrderId = realOrderId; 
      let finalVnpayUrl = "";

      if (selectedMethod === 2) {
        if (realOrderId) {
          toast.success("Đang tạo link thanh toán VNPAY...");
          try {
            const vnpayRes = await fetch(
              `http://localhost:8080/api/payment/create-vnpay?amount=${Math.floor(finalTotal)}&orderId=${realOrderId}&isPos=true`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const vnpayData = await vnpayRes.json();
            if (vnpayData && vnpayData.data) {
              finalVnpayUrl = vnpayData.data;
              if (vnpayTab) vnpayTab.location.href = finalVnpayUrl;
            } else {
              if (vnpayTab) vnpayTab.close();
              toast.error("Không thể lấy link VNPAY từ Server");
            }
          } catch (error) {
            if (vnpayTab) vnpayTab.close();
            toast.error("Lỗi khi gọi API VNPAY");
          }
        } else {
          if (vnpayTab) vnpayTab.close();
          toast.error("Không lấy được mã đơn hàng từ Server để gọi VNPAY!");
        }
      }

      // ✅ ĐÃ CẬP NHẬT: LƯU TIỀN KHÁCH ĐƯA VÀ TIỀN THỪA ĐỂ HIỆN LÊN POPUP/HÓA ĐƠN
      setCheckoutSuccessData({
        ...activeOrder,
        id: finalOrderId, 
        subTotal,
        discountAmount,
        shippingFee,
        finalTotal,
        isVnpaySuccess: false, 
        vnpayUrl: finalVnpayUrl,
        displayDate: new Date().toLocaleString("vi-VN"),
        customerCash: selectedMethod === 1 ? Number(customerCash) : finalTotal,
        changeAmount: selectedMethod === 1 ? changeAmount : 0,
      });

      const currentOrdersCount = usePosStore.getState().orders.length;
      removeOrder(activeOrder.id);
      if (currentOrdersCount <= 1) addOrder();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error: any) {
      if (vnpayTab) vnpayTab.close();
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (checkoutSuccessData && checkoutSuccessData.paymentMethodId === 2 && !checkoutSuccessData.isVnpaySuccess) {
      if (String(checkoutSuccessData.id).includes("HD")) {
          console.warn("Chặn Polling vì ID không hợp lệ: " + checkoutSuccessData.id);
          return;
      }

      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("refreshToken");
          const res = await fetch(`http://localhost:8080/api/orders/${checkoutSuccessData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          
          const status = result?.data?.statusName || result?.statusName;
          
          if (status && status !== "PENDING") {
            setCheckoutSuccessData((prev: any) => ({ ...prev, isVnpaySuccess: true }));
            toast.success("✅ VNPAY đã báo nhận tiền thành công!");
            clearInterval(interval);
          }
        } catch (err) {
        }
      }, 3000); 
    }

    return () => clearInterval(interval);
  }, [checkoutSuccessData]);

  const receiptOrder = checkoutSuccessData || activeOrder;
  const isWaitingVnpay = checkoutSuccessData?.paymentMethodId === 2 && !checkoutSuccessData?.isVnpaySuccess;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #pos-receipt { 
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
          #pos-receipt * { visibility: visible; }
          @page { margin: 0; }
        }
      `}</style>

      {/* POPUP THANH TOÁN THÀNH CÔNG */}
      {checkoutSuccessData && (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center print:hidden">
          <div className="bg-white rounded-3xl w-[420px] p-8 flex flex-col items-center shadow-2xl animate-in zoom-in duration-200">
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${isWaitingVnpay ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              {isWaitingVnpay ? (
                <Loader2 size={40} className="text-blue-500 animate-spin" />
              ) : (
                <CheckCircle2 size={40} className="text-emerald-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-1 text-center">
              {isWaitingVnpay ? "Đang chờ thanh toán..." : "Thanh toán thành công!"}
            </h2>
            
            <div className="text-slate-500 text-sm mb-6 text-center w-full">
              Mã đơn hàng:{" "}
              <span className="font-bold text-slate-700">
                #{String(checkoutSuccessData.id).replace("HD", "")}
              </span>
              {isWaitingVnpay && (
                <>
                  <span className="block text-[11px] mt-1.5 text-blue-600 font-medium">
                    Khách hàng đang quét mã QR trên thiết bị...
                  </span>
                  {checkoutSuccessData.vnpayUrl && (
                    <button
                      onClick={() => window.open(checkoutSuccessData.vnpayUrl, "_blank")}
                      className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1.5 mx-auto transition-all"
                    >
                      <CreditCard size={14} /> Mở trang VNPAY (Thủ công)
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="w-full bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-700">
                  {checkoutSuccessData.customerName || "Khách lẻ"}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Hình thức:</span>
                <span className="font-bold text-slate-700">
                  {checkoutSuccessData.isDelivery ? "Giao hàng" : "Lấy tại quầy"}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Thanh toán:</span>
                <span className={`font-bold ${isWaitingVnpay ? "text-blue-600" : "text-slate-700"}`}>
                  {checkoutSuccessData.paymentMethodId === 2 
                    ? (isWaitingVnpay ? "VNPAY (Chờ xử lý)" : "VNPAY (Đã trả)") 
                    : "Tiền mặt"}
                </span>
              </div>
              
              {/* ✅ HIỂN THỊ CHI TIẾT TIỀN THỪA TRONG POPUP */}
              <div className="flex justify-between text-sm pt-3 border-t border-slate-200 mt-2">
                <span className="text-slate-500 font-bold">Cần thanh toán:</span>
                <span className="font-black text-emerald-600 text-lg">
                  {formatPrice(checkoutSuccessData.finalTotal)}
                </span>
              </div>
              {(checkoutSuccessData.paymentMethodId || 1) === 1 && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500 font-medium">Khách đưa:</span>
                    <span className="font-bold text-slate-700">
                      {formatPrice(checkoutSuccessData.customerCash)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-500 font-medium">Tiền thừa trả khách:</span>
                    <span className="font-bold text-rose-500">
                      {formatPrice(checkoutSuccessData.changeAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
              >
                <Printer size={18} /> {isWaitingVnpay ? "In tạm tính" : "In hóa đơn"}
              </button>

              <button
                onClick={() => {
                  if (isWaitingVnpay) {
                    setCheckoutSuccessData((prev: any) => ({ ...prev, isVnpaySuccess: true }));
                    toast.success("Đã xác nhận thanh toán thủ công!");
                  } else {
                    setCheckoutSuccessData(null);
                  }
                }}
                className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200"
              >
                {isWaitingVnpay ? "Đã nhận tiền" : "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HÓA ĐƠN IN */}
      {receiptOrder && (
        <div id="pos-receipt" className="hidden print:block bg-white text-black">
          <div className="text-center mb-4">
            <h1 className="font-black text-2xl uppercase mb-1">BALLHUB SPORT</h1>
            <p className="text-sm font-bold">Hotline: 0886.301.661</p>
            <p className="text-xs">Đ/c: 58 Trúc Khê, Đống Đa, Hà Nội</p>
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg uppercase">
              {(receiptOrder.paymentMethodId || 1) === 2 && !receiptOrder.isVnpaySuccess 
                ? "Phiếu Tạm Tính" 
                : "Hóa Đơn Bán Hàng"}
            </h2>
          </div>
          <div className="text-sm space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Mã HĐ:</span>
              <span className="font-bold">#{String(receiptOrder.id).replace("HD", "")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày:</span>
              <span>{receiptOrder.displayDate || new Date().toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>Admin</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span className="font-bold truncate max-w-[120px] text-right">
                {receiptOrder.customerName || "Khách lẻ"}
              </span>
            </div>
          </div>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1 font-bold w-[50%]">SẢN PHẨM</th>
                <th className="py-1 font-bold text-center w-[20%]">SL</th>
                <th className="py-1 font-bold text-right w-[30%]">TỔNG</th>
              </tr>
            </thead>
            <tbody>
              {receiptOrder.items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-dotted border-gray-400">
                  <td className="py-2 pr-1">
                    <div className="font-bold leading-tight mb-1">{item.productName}</div>
                    <div className="text-xs text-gray-700">Màu: {item.colorName} | Sz: {item.sizeName}</div>
                    <div className="text-xs text-gray-700">{formatPrice(item.discountPrice || item.price)}</div>
                  </td>
                  <td className="py-2 text-center align-top font-bold text-base">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right align-top font-bold">
                    {formatPrice((item.discountPrice || item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-b-2 border-dashed border-black mb-3"></div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span className="font-bold">{formatPrice(receiptOrder.subTotal ?? subTotal)}</span>
            </div>
            {(receiptOrder.discountAmount ?? discountAmount) > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span className="font-bold">- {formatPrice(receiptOrder.discountAmount ?? discountAmount)}</span>
              </div>
            )}
            {(receiptOrder.shippingFee ?? shippingFee) > 0 && (
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-bold">{formatPrice(receiptOrder.shippingFee ?? shippingFee)}</span>
              </div>
            )}
            
            {/* ✅ HIỂN THỊ CHI TIẾT TIỀN THỪA TRONG HÓA ĐƠN IN */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-black">
              <span className="font-black text-base uppercase">Cần thanh toán:</span>
              <span className="font-black text-xl">{formatPrice(receiptOrder.finalTotal ?? finalTotal)}</span>
            </div>
            {(receiptOrder.paymentMethodId || 1) === 1 && receiptOrder.customerCash !== undefined && (
              <>
                <div className="flex justify-between mt-1">
                  <span>Tiền khách đưa:</span>
                  <span className="font-bold">{formatPrice(receiptOrder.customerCash)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Tiền thừa trả khách:</span>
                  <span className="font-bold">{formatPrice(receiptOrder.changeAmount)}</span>
                </div>
              </>
            )}

          </div>
          <div className="mt-3 text-right text-xs italic font-bold">
            {(receiptOrder.paymentMethodId || 1) === 2 
              ? (receiptOrder.isVnpaySuccess ? "(Đã thanh toán bằng VNPAY)" : "(Đơn hàng chờ thanh toán VNPAY)") 
              : "(Đã thanh toán bằng Tiền mặt)"}
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

      {/* GIAO DIỆN QUẢN LÝ ĐƠN HÀNG */}
      <div className="flex flex-col h-[calc(100vh-80px)] print:hidden gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setActiveOrder(order.id)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-t-xl cursor-pointer border-b-2 transition-all min-w-[140px] ${
                activeOrderId === order.id
                  ? "bg-white border-emerald-500 text-emerald-700 shadow-sm font-bold"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="whitespace-nowrap flex-1">
                Đơn hàng {String(order.id).replace("HD", "")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOrder(order.id);
                }}
                className="p-1 rounded-full hover:bg-red-100 hover:text-red-500"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
          {orders.length < 5 && (
            <button
              onClick={addOrder}
              className="flex items-center gap-1 px-4 py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 shrink-0 ml-2"
            >
              <Plus size={18} /> Tạo đơn mới
            </button>
          )}
        </div>

        {!activeOrder ? (
          <div className="flex flex-col items-center justify-center flex-1 bg-white rounded-2xl shadow-sm border border-slate-200">
            <ShoppingCart size={48} className="text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <button
              onClick={addOrder}
              className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-600"
            >
              TẠO ĐƠN MỚI
            </button>
          </div>
        ) : (
          <div className="flex gap-4 flex-1 min-h-0">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800">
                  Chi tiết đơn hàng
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600"
                >
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
                    {activeOrder.items.map((item, index) => (
                      <div
                        key={item.variantId}
                        className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group"
                      >
                        <div className="col-span-1 font-bold text-slate-400 text-center">
                          {index + 1}
                        </div>
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                            {item.imageUrl && (
                              <Image
                                src={`http://localhost:8080${item.imageUrl}`}
                                alt=""
                                fill
                                className="object-contain"
                                unoptimized
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-700 leading-tight">
                              {item.productName}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase mt-1">
                              {item.sku} | {item.colorName} - {item.sizeName}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1">
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  item.variantId,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 hover:bg-white rounded-lg transition-all text-slate-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-black text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 hover:bg-white rounded-lg transition-all text-slate-600"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="font-medium text-slate-600 text-sm">
                            {formatPrice(item.discountPrice || item.price)}
                          </p>
                        </div>
                        <div className="col-span-2 text-right pr-4">
                          <p className="font-bold text-emerald-600">
                            {formatPrice(
                              (item.discountPrice || item.price) * item.quantity
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            removeItemFromActiveOrder(item.variantId)
                          }
                          className="absolute right-2 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-[420px] shrink-0 flex flex-col gap-4 overflow-y-auto pb-2 pr-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <User size={18} className="text-emerald-500" /> Khách hàng
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeOrder.customerId && (
                      <button
                        onClick={handleClearCustomer}
                        className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-red-100"
                      >
                        <X size={12} /> BỎ CHỌN
                      </button>
                    )}
                    <button
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-emerald-100"
                    >
                      <Search size={12} />{" "}
                      {activeOrder.customerId ? "ĐỔI KHÁCH" : "CHỌN KHÁCH"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={activeOrder.customerName || ""}
                    onChange={(e) =>
                      updateActiveOrderDetails({ customerName: e.target.value })
                    }
                    className="w-full text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={activeOrder.customerPhone || ""}
                    onChange={(e) =>
                      updateActiveOrderDetails({
                        customerPhone: e.target.value,
                      })
                    }
                    className="w-full text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-600">
                    Giao hàng tận nơi
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!activeOrder.isDelivery}
                      onChange={(e) =>
                        updateActiveOrderDetails({
                          isDelivery: e.target.checked,
                          shippingFee: 0,
                          addressId: null,
                          deliveryAddress: "",
                        })
                      }
                    />
                    <div className="w-11 h-6 bg-emerald-50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-emerald-200"></div>
                  </label>
                </div>

                {activeOrder.isDelivery && (
                  <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        {isTypingNewAddress
                          ? "Nhập địa chỉ mới"
                          : "Địa chỉ có sẵn"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500">
                          Địa chỉ mới
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isTypingNewAddress}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setIsTypingNewAddress(isChecked);
                              if (isChecked) {
                                updateActiveOrderDetails({
                                  addressId: null,
                                  deliveryAddress: "",
                                  shippingFee: 0,
                                });
                                setSelectedProv("");
                                setSelectedDist("");
                                setSelectedWard("");
                                setStreet("");
                              } else {
                                updateActiveOrderDetails({ shippingFee: 0 });
                              }
                            }}
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>

                    {!isTypingNewAddress ? (
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm mb-3">
                        {activeOrder.addressId ? (
                          <>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                              {activeOrder.deliveryAddress}
                            </p>
                            <div className="mt-3 flex justify-between items-center border-t border-slate-100 pt-2">
                              <span className="text-[10px] text-slate-400">
                                Đã áp dụng từ sổ địa chỉ
                              </span>
                              <button
                                onClick={() => {
                                  if (!activeOrder.customerId) {
                                    toast.warning("Vui lòng chọn khách hàng!");
                                    return;
                                  }
                                  setIsAddressModalOpen(true);
                                }}
                                className="text-[10px] text-orange-600 font-bold hover:underline"
                              >
                                Đổi địa chỉ khác
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center py-2">
                            <p className="text-[11px] text-slate-400 mb-3 font-medium">
                              Chưa chọn địa chỉ từ sổ
                            </p>
                            <button
                              onClick={() => {
                                if (!activeOrder.customerId) {
                                  toast.warning("Vui lòng chọn khách hàng!");
                                  return;
                                }
                                setIsAddressModalOpen(true);
                              }}
                              className="text-[11px] bg-white text-orange-500 border border-orange-200 px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors hover:bg-orange-50 shadow-sm"
                            >
                              <MapPin size={14} /> CHỌN TỪ SỔ ĐỊA CHỈ
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        <select
                          className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                          value={selectedProv}
                          onChange={(e) => {
                            const provId = Number(e.target.value);
                            setSelectedProv(provId);
                            setSelectedDist("");
                            setWards([]);
                            setSelectedWard("");
                            updateActiveOrderDetails({ shippingFee: 0 });
                            fetch(
                              `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provId}`,
                              { headers: { token: GHN_TOKEN } }
                            )
                              .then((res) => res.json())
                              .then((data) => setDistricts(data.data || []));
                          }}
                        >
                          <option value="">Tỉnh/thành phố...</option>
                          {provinces.map((p) => (
                            <option key={p.ProvinceID} value={p.ProvinceID}>
                              {p.ProvinceName}
                            </option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none"
                            value={selectedDist}
                            disabled={!selectedProv}
                            onChange={(e) => {
                              const distId = Number(e.target.value);
                              setSelectedDist(distId);
                              setSelectedWard("");
                              updateActiveOrderDetails({ shippingFee: 0 });
                              fetch(
                                `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${distId}`,
                                { headers: { token: GHN_TOKEN } }
                              )
                                .then((res) => res.json())
                                .then((data) => setWards(data.data || []));
                            }}
                          >
                            <option value="">Quận/huyện...</option>
                            {districts.map((d) => (
                              <option key={d.DistrictID} value={d.DistrictID}>
                                {d.DistrictName}
                              </option>
                            ))}
                          </select>
                          <select
                            className="w-full text-xs font-medium text-slate-700 bg-white px-2 py-2.5 rounded-lg border border-slate-200 outline-none"
                            value={selectedWard}
                            disabled={!selectedDist}
                            onChange={(e) => {
                              const wardCode = e.target.value;
                              setSelectedWard(wardCode);
                              if (selectedDist) {
                                calculateGHNShippingFee(
                                  Number(selectedDist),
                                  wardCode
                                );
                              }
                            }}
                          >
                            <option value="">Xã/phường...</option>
                            {wards.map((w) => (
                              <option key={w.WardCode} value={w.WardCode}>
                                {w.WardName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Số nhà, tên đường..."
                          className="w-full text-xs font-medium bg-white px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-emerald-500"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">
                          Phí giao hàng:
                        </span>
                        {isFreeshipEligible && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded mt-1">
                            Freeship đơn {">"} 1Tr
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          disabled={isFreeshipEligible}
                          className={`w-24 bg-white border px-3 py-1.5 rounded-lg text-sm font-black text-right ${isFreeshipEligible ? "border-emerald-500 text-emerald-500 bg-emerald-50" : "border-slate-200 text-emerald-600"}`}
                          value={isFreeshipEligible ? 0 : shippingFee}
                          onChange={(e) =>
                            updateActiveOrderDetails({
                              shippingFee: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="text-xs font-bold text-slate-400">
                          VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-700 mb-4 border-b pb-3 uppercase text-xs">
                  Thanh toán
                </h3>
                <div className="space-y-4 text-sm flex-1">
                  {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-slate-600 mb-2">
                      Phương thức thanh toán
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          updateActiveOrderDetails({ paymentMethodId: 1 })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 ${!activeOrder.paymentMethodId || activeOrder.paymentMethodId === 1 ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200"}`}
                      >
                        <Wallet size={14} /> Tiền mặt
                      </button>
                      <button
                        onClick={() =>
                          updateActiveOrderDetails({ paymentMethodId: 2 })
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all flex items-center justify-center gap-1 ${activeOrder.paymentMethodId === 2 ? "bg-blue-100 border-blue-500 text-blue-700" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200"}`}
                      >
                        <CreditCard size={14} /> VNPAY
                      </button>
                    </div>
                  </div>

                  {/* VOUCHER UI MỚI (TAG THAY THẾ INPUT) */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Tag size={14} className="text-emerald-500" /> Mã giảm giá
                      </p>
                      {!activeOrder.appliedVoucher && availableVouchers.length > 0 && (
                        <span className="text-[10px] text-orange-500 font-medium flex items-center gap-1 animate-pulse">
                          <Sparkles size={12} /> Có mã cho bạn!
                        </span>
                      )}
                    </div>

                    {activeOrder.appliedVoucher ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 animate-in zoom-in-95 duration-200 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-emerald-600 text-white rounded-lg p-1.5 shadow-sm">
                            <Tag size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
                              {activeOrder.appliedVoucher.promoCode}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                              Đã giảm {formatPrice(discountAmount)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            updateActiveOrderDetails({
                              appliedVoucher: null,
                              discountAmount: 0,
                            });
                            setPromoInput("");
                          }}
                          className="text-emerald-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                          title="Gỡ bỏ mã này"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-200">
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Nhập mã..."
                            className="flex-1 border px-3 py-2 rounded-lg text-sm font-bold uppercase outline-none focus:border-emerald-500 focus:ring-2 ring-emerald-50 transition-all"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleApplyVoucherInput()}
                          />
                          <button
                            onClick={handleApplyVoucherInput}
                            className="bg-slate-800 text-white px-4 rounded-lg font-bold hover:bg-slate-700 transition-all"
                          >
                            Áp dụng
                          </button>
                        </div>

                        {availableVouchers.length > 0 && (
                          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pt-2 border-t border-slate-200">
                            {availableVouchers.map((v) => {
                              const isEligible = subTotal >= v.minOrderAmount;
                              return (
                                <div
                                  key={v.promotionId}
                                  onClick={() => isEligible && handleSelectVoucher(v)}
                                  className={`p-2 border rounded-lg flex justify-between items-center transition-all ${
                                    isEligible
                                      ? "bg-white border-emerald-200 hover:border-emerald-500 cursor-pointer shadow-sm hover:bg-emerald-50/50"
                                      : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                                  }`}
                                >
                                  <div>
                                    <p className={`text-xs font-bold flex items-center gap-1.5 ${isEligible ? "text-emerald-700" : "text-slate-500"}`}>
                                      {v.promoCode}
                                      {v.discountPercent && (
                                        <span className="font-bold text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                          -{v.discountPercent}%
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      Đơn từ {formatPrice(v.minOrderAmount)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs font-bold ${isEligible ? "text-emerald-600" : "text-slate-500"}`}>
                                      -{formatPrice(calculateDiscount(v, subTotal))}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-500 font-medium px-1">
                    <span>Tổng tiền hàng ({totalItems} món)</span>
                    <span className="text-slate-800 font-bold">
                      {formatPrice(subTotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold px-1">
                      <span>Giảm giá voucher</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {activeOrder.isDelivery && (
                    <div className="flex justify-between text-orange-600 font-bold px-1">
                      <span>Phí vận chuyển</span>
                      <span>
                        {shippingFee === 0
                          ? "Miễn phí"
                          : formatPrice(shippingFee)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-end py-4 border-t mt-2 px-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-1">
                      Cần thanh toán
                    </span>
                    <span className="font-black text-3xl text-emerald-600">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  {/* Ô NHẬP TIỀN KHÁCH ĐƯA (CHỈ HIỆN KHI CHỌN TIỀN MẶT) */}
                  {(!activeOrder.paymentMethodId || activeOrder.paymentMethodId === 1) && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-600">Khách đưa (VNĐ):</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={customerCash}
                          onChange={(e) => setCustomerCash(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-32 bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-sm font-black text-right outline-none focus:border-emerald-500"
                        />
                      </div>
                      
                      {customerCash !== "" && (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-xs font-bold text-slate-600">Tiền thừa trả khách:</span>
                          <span className={`font-black text-sm ${changeAmount < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                            {changeAmount < 0 ? `Thiếu ${formatPrice(Math.abs(changeAmount))}` : formatPrice(changeAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="mt-auto pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={
                      !activeOrder ||
                      activeOrder.items.length === 0 ||
                      isProcessing ||
                      // KHÓA NÚT NẾU TIỀN KHÁCH ĐƯA THIẾU
                      ((!activeOrder.paymentMethodId || activeOrder.paymentMethodId === 1) && (customerCash === "" || changeAmount < 0))
                    }
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 shadow-lg disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <CreditCard size={22} />
                    )}
                    <span className="uppercase tracking-wider text-sm">
                      {(!activeOrder.paymentMethodId || activeOrder.paymentMethodId === 1) && (customerCash === "" || changeAmount < 0) 
                        ? "YÊU CẦU NHẬP ĐỦ TIỀN" 
                        : "THANH TOÁN"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PosVariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <PosCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />
      <PosAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        customerId={activeOrder?.customerId || null}
        onSelectSuccess={() => setIsTypingNewAddress(false)}
      />
    </>
  );
};