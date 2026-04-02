"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import api from "@/lib/cartApi";

import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentMethods } from "@/components/checkout/PaymentMethods";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConfirmModal } from "@/components/common/ConfirmModal";

const BASE_URL = "http://localhost:8080";

// ==========================================
// CẤU HÌNH API GIAO HÀNG NHANH (GHN)
// ==========================================
const GHN_TOKEN = "dd94ceb1-2e67-11f1-b97a-a2781b0fd428"; 
const SHOP_DISTRICT_ID = 3440; 

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressId: null,
    addressText: "",
    paymentMethodId: 1, 
    note: "",
  });

  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [qrModal, setQrModal] = useState<{
    show: boolean;
    url: string;
    orderId: number | null;
  }>({
    show: false,
    url: "",
    orderId: null,
  });
  
  const [shippingFee, setShippingFee] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Lưu trữ dữ liệu tỉnh/quận từ GHN để đối chiếu chuỗi địa chỉ
  const [ghnProvinces, setGhnProvinces] = useState<any[]>([]);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const data = response.data.data;
      setCartData(data);
      if (!data.items || data.items.length === 0) {
        toast.error("Giỏ hàng đang trống");
        router.push("/shoppingcart");
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      toast.error("Không thể tải thông tin giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách Tỉnh từ GHN khi load trang
  useEffect(() => {
    fetchCart();
    fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { "token": GHN_TOKEN }
    })
    .then(res => res.json())
    .then(data => { if (data.code === 200) setGhnProvinces(data.data || []); })
    .catch(err => console.error("Lỗi API GHN:", err));
  }, []);

  // ==========================================
  // HÀM TÍNH PHÍ SHIP BẰNG GHN API TỪ CHUỖI ĐỊA CHỈ
  // ==========================================
  const calculateShippingFee = async (addressStr: string, totalAmount: number) => {
    if (!addressStr || addressStr.trim() === "") return 0;
    if (totalAmount >= 1000000) return 0; // Freeship đơn > 1 Triệu

    try {
      // 1. Bóc tách chuỗi địa chỉ thành mảng (VD: ["Số 10", "Láng Hạ", "Đống Đa", "Hà Nội"])
      const parts = addressStr.split(",").map(s => s.trim().toLowerCase());
      if (parts.length < 3) return 30000; // Trả về phí mặc định nếu địa chỉ quá ngắn không rõ ràng

      const provName = parts[parts.length - 1]; // Phần tử cuối thường là Tỉnh
      const distName = parts[parts.length - 2]; // Phần tử kế cuối thường là Quận
      const wardName = parts[parts.length - 3]; // Phần tử kế nữa thường là Xã

      // 2. Tìm ID Tỉnh từ GHN
      const matchedProv = ghnProvinces.find(p => provName.includes(p.ProvinceName.toLowerCase()) || p.ProvinceName.toLowerCase().includes(provName));
      if (!matchedProv) return 35000; // Mặc định nếu không khớp

      // 3. Tìm ID Quận Huyện từ GHN (Gọi API lấy danh sách quận thuộc tỉnh đó)
      const distRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${matchedProv.ProvinceID}`, { headers: { "token": GHN_TOKEN } });
      const distData = await distRes.json();
      if (distData.code !== 200) return 35000;

      // Tìm tên quận khớp (Có thể chứa từ khóa "quận", "huyện", "thị xã")
      let matchedDist = distData.data.find((d: any) => {
         const dName = d.DistrictName.toLowerCase();
         return distName.includes(dName) || dName.includes(distName.replace(/(quận|huyện|thị xã|thành phố)\s+/g, ''));
      });
      
      if (!matchedDist) return 35000;

      // 4. Tìm Mã Xã/Phường từ GHN (Để tính ship chuẩn nhất)
      const wardRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${matchedDist.DistrictID}`, { headers: { "token": GHN_TOKEN } });
      const wardData = await wardRes.json();
      let matchedWardCode = "";
      
      if (wardData.code === 200) {
          const matchedWard = wardData.data.find((w: any) => {
             const wName = w.WardName.toLowerCase();
             return wardName.includes(wName) || wName.includes(wardName.replace(/(phường|xã|thị trấn)\s+/g, ''));
          });
          if (matchedWard) matchedWardCode = matchedWard.WardCode;
      }

      // 5. Gọi API tính phí GHN
      const feeRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", {
        method: "POST",
        headers: { "token": GHN_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          service_type_id: 2, 
          from_district_id: SHOP_DISTRICT_ID, 
          to_district_id: matchedDist.DistrictID, 
          to_ward_code: matchedWardCode, 
          weight: 500 
        })
      });
      
      const feeResult = await feeRes.json();
      if (feeResult.code === 200) {
         return feeResult.data.total;
      }
      return 35000; // Trả về mặc định nếu API GHN lỗi
      
    } catch (error) {
      console.error("Lỗi tính phí GHN:", error);
      return 30000; // Phí mặc định an toàn
    }
  };

  // Lắng nghe sự thay đổi của Địa chỉ để đi tính lại tiền ship
  useEffect(() => {
    const updateFee = async () => {
       if (cartData.totalAmount > 0) {
         const fee = await calculateShippingFee(formData.addressText, cartData.totalAmount);
         setShippingFee(fee);
       }
    };
    updateFee();
  }, [formData.addressText, cartData.totalAmount, ghnProvinces]);

  const discount = appliedPromo?.discountAmount || 
                   appliedPromo?.discountValue || 
                   appliedPromo?.maxDiscountAmount ||
                   0;
                   
  const finalTotal = Math.max(0, cartData.totalAmount - discount + shippingFee);

  const handleOrder = () => {
    if (!formData.fullName || !formData.phone) return toast.error("Thiếu thông tin nhận hàng");
    if (!formData.addressId || !formData.addressText) return toast.error("Vui lòng chọn địa chỉ giao hàng");
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    setShowConfirmModal(false);
    if (formData.paymentMethodId === 2) {
      const qrUrl = `https://img.vietqr.io/image/MB-0886301661-compact2.png?amount=${finalTotal}&addInfo=Thanh toan don hang&accountName=NGO GIA HIEN`;
      setQrModal({ show: true, url: qrUrl, orderId: null });
      return;
    }
    submitOrderToBackend();
  };

  const submitOrderToBackend = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        addressId: formData.addressId,
        paymentMethodId: formData.paymentMethodId,
        note: formData.note,
        promoCode: appliedPromo ? appliedPromo.promoCode : null,
        shippingFee: shippingFee,
      };

      const res = await api.post("/orders", payload);
      toast.success("Đặt hàng thành công!");
      
      const resData = res.data;
      let createdOrderId = null;
      
      if (typeof resData?.data === 'number' || typeof resData?.data === 'string') {
        createdOrderId = resData.data;
      } 
      else if (resData?.data?.order?.orderId) createdOrderId = resData.data.order.orderId;
      else if (resData?.data?.order?.id) createdOrderId = resData.data.order.id;
      else if (resData?.data?.orderId) createdOrderId = resData.data.orderId;
      else if (resData?.data?.id) createdOrderId = resData.data.id;
      else if (resData?.orderId) createdOrderId = resData.orderId;
      else if (resData?.id) createdOrderId = resData.id;

      if (createdOrderId) {
        setQrModal({ show: false, url: "", orderId: null });
        router.push(`/order-success/${createdOrderId}`); 
      } else {
        toast.error("Tạo đơn thành công nhưng không lấy được mã đơn!");
        router.push("/profile/orders");
      }

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen flex flex-col relative">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <span>Giỏ hàng</span> <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">Thanh toán</span> <ChevronRight size={14} />
          <span>Hoàn tất</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <ShippingForm formData={formData} setFormData={setFormData} />
            <PaymentMethods
              selectedMethod={formData.paymentMethodId}
              onSelect={(id: number) => setFormData({ ...formData, paymentMethodId: id })}
            />
          </div>
          <div className="lg:col-span-5">
            <OrderSummary
              cartData={cartData}
              isSubmitting={isSubmitting}
              onOrder={handleOrder}
              baseUrl={BASE_URL}
              appliedPromo={appliedPromo}
              setAppliedPromo={setAppliedPromo}
              shippingFee={shippingFee}
            />
          </div>
        </div>
      </main>
      <Footer />

      {qrModal.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900">Quét mã để thanh toán</h3>
            <div className="bg-white p-2 rounded-2xl border-2 border-dashed border-gray-200">
              <img src={qrModal.url} alt="Payment QR" className="w-full aspect-square object-contain rounded-xl" />
            </div>
            <div className="text-sm text-gray-500">
              <p>Sử dụng App Ngân hàng hoặc ZaloPay để quét mã.</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={submitOrderToBackend}
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Tôi đã thanh toán"}
              </button>
              <button
                onClick={() => setQrModal({ show: false, url: "", orderId: null })}
                disabled={isSubmitting}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl h-10 font-medium transition-colors"
              >
                Đóng, tôi chưa thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirmModal}
        title="Xác nhận đơn hàng?"
        description={
          <div className="space-y-4 text-left">
            <p className="text-gray-500 text-sm leading-relaxed">
              Bạn có chắc chắn muốn đặt đơn hàng này tới địa chỉ <span className="font-bold text-gray-800">{formData.addressText}</span> không?
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Người nhận:</span>
                <span className="font-bold text-slate-700">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thanh toán:</span>
                <span className="font-bold text-slate-700">{formData.paymentMethodId === 1 ? "Tiền mặt (COD)" : "Chuyển khoản QR"}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {finalTotal.toLocaleString()}đ
                </span>
              </div>
            </div>
          </div>
        }
        variant="success"
        confirmLabel="Đúng, Đặt ngay"
        cancelLabel="Kiểm tra lại"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOrder}
      />
    </div>
  );
}