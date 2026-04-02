"use client";

import { useEffect, useState } from "react";
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
    paymentMethodId: 1, // Mặc định là Tiền mặt (1)
    note: "",
  });

  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  
  const [shippingFee, setShippingFee] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  useEffect(() => {
    fetchCart();
    fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { "token": GHN_TOKEN }
    })
    .then(res => res.json())
    .then(data => { if (data.code === 200) setGhnProvinces(data.data || []); })
    .catch(err => console.error("Lỗi API GHN:", err));
  }, []);

  const calculateShippingFee = async (addressStr: string, totalAmount: number) => {
    if (!addressStr || addressStr.trim() === "") return 0;
    if (totalAmount >= 1000000) return 0;

    try {
      const parts = addressStr.split(",").map(s => s.trim().toLowerCase());
      if (parts.length < 3) return 30000;

      const provName = parts[parts.length - 1]; 
      const distName = parts[parts.length - 2]; 
      const wardName = parts[parts.length - 3]; 

      const matchedProv = ghnProvinces.find(p => provName.includes(p.ProvinceName.toLowerCase()) || p.ProvinceName.toLowerCase().includes(provName));
      if (!matchedProv) return 35000;

      const distRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${matchedProv.ProvinceID}`, { headers: { "token": GHN_TOKEN } });
      const distData = await distRes.json();
      if (distData.code !== 200) return 35000;

      let matchedDist = distData.data.find((d: any) => {
         const dName = d.DistrictName.toLowerCase();
         return distName.includes(dName) || dName.includes(distName.replace(/(quận|huyện|thị xã|thành phố)\s+/g, ''));
      });
      
      if (!matchedDist) return 35000;

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
      if (feeResult.code === 200) return feeResult.data.total;
      return 35000; 
      
    } catch (error) {
      console.error("Lỗi tính phí GHN:", error);
      return 30000; 
    }
  };

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
                   appliedPromo?.maxDiscountAmount || 0;
                   
  const finalTotal = Math.max(0, cartData.totalAmount - discount + shippingFee);

  const handleOrder = () => {
    if (!formData.fullName || !formData.phone) return toast.error("Thiếu thông tin nhận hàng");
    if (!formData.addressId || !formData.addressText) return toast.error("Vui lòng chọn địa chỉ giao hàng");
    setShowConfirmModal(true);
  };

  const confirmOrder = () => {
    setShowConfirmModal(false);
    // ✅ Gọi chung một hàm, mọi logic VNPAY sẽ xử lý ngầm bên trong
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

      // 1. GỌI API LƯU ĐƠN HÀNG VÀO DATABASE TRƯỚC
      const res = await api.post("/orders", payload);
      
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
        window.dispatchEvent(new Event("cartUpdated")); // Reset số lượng giỏ hàng trên Header
        
        // 2. KIỂM TRA PHƯƠNG THỨC THANH TOÁN
        if (formData.paymentMethodId === 2) {
            // NẾU LÀ VNPAY -> GỌI API TẠO LINK RỒI REDIRECT
            toast.success("Đang chuyển hướng sang VNPAY...");
            
            try {
                const vnpayRes = await api.get(`/payment/create-vnpay`, {
                    params: { amount: finalTotal, orderId: createdOrderId }
                });
                
                if (vnpayRes.data && vnpayRes.data.data) {
                    // "Đá" khách hàng sang trang thanh toán của VNPAY
                    window.location.href = vnpayRes.data.data;
                } else {
                    toast.error("Không thể tạo link thanh toán, vui lòng thử lại sau!");
                    router.push(`/profile/orders`);
                }
            } catch (err) {
                console.error("Lỗi tạo VNPAY link:", err);
                toast.error("Lỗi khi kết nối đến VNPAY!");
                router.push(`/profile/orders`);
            }
        } else {
            // NẾU LÀ TIỀN MẶT (COD) -> BAY THẲNG ĐẾN TRANG THÀNH CÔNG
            toast.success("Đặt hàng thành công!");
            router.push(`/order-success/${createdOrderId}`); 
        }

      } else {
        toast.error("Tạo đơn thành công nhưng không lấy được mã đơn!");
        router.push("/profile/orders");
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt hàng");
      setIsSubmitting(false); // Chỉ tắt loading khi bị lỗi (Để VNPAY kịp redirect)
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
                <span className="font-bold text-slate-700">{formData.paymentMethodId === 1 ? "Tiền mặt (COD)" : "Thanh toán ngay VNPAY"}</span>
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