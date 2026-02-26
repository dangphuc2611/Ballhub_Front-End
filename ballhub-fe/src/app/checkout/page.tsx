'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import api from '@/lib/cartApi';

import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentMethods } from '@/components/checkout/PaymentMethods';
import { OrderSummary } from '@/components/checkout/OrderSummary';

const BASE_URL = "http://localhost:8080";

export default function CheckoutPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
    const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', addressId: 1, paymentMethodId: 1, note: '' });

    const [appliedPromo, setAppliedPromo] = useState<any>(null);

    // STATE: Quản lý hiển thị Popup Mã QR
    const [qrModal, setQrModal] = useState<{show: boolean, url: string}>({show: false, url: ''});

    useEffect(() => {
        api.get("/cart").then(res => {
            if (res.data.data.items.length === 0) router.push('/shoppingcart');
            else { setCartData(res.data.data); setLoading(false); }
        }).catch(() => toast.error("Lỗi tải giỏ hàng"));
    }, [router]);

    // Hàm gọi API tạo đơn hàng thực sự (Được gọi khi chọn COD hoặc sau khi xác nhận đã quét QR)
    const submitOrderToBackend = async () => {
        setIsSubmitting(true);
        try {
            const payload = { 
                addressId: formData.addressId, 
                paymentMethodId: formData.paymentMethodId, 
                note: formData.note,
                promoCode: appliedPromo ? appliedPromo.promoCode : null 
            };
            
            const res = await api.post("/orders", payload);
            const responseData = res.data.data;
            const orderId = responseData.order ? responseData.order.orderId : responseData.orderId;

            toast.success("Đặt hàng thành công!");
            router.push(`/order-success/${orderId}`);
            
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Đặt hàng thất bại");
            setIsSubmitting(false);
        } finally {
            setQrModal({ show: false, url: '' }); // Đảm bảo đóng modal
        }
    };

    // Hàm xử lý khi người dùng bấm nút "Đặt hàng"
    const handleOrder = async () => {
        if (!formData.fullName || !formData.phone) return toast.error("Thiếu thông tin nhận hàng");

        // Nếu phương thức thanh toán là Chuyển khoản (ID = 2)
        if (formData.paymentMethodId === 2) {
            // Tự tạo URL mã VietQR ở Frontend.
            const total = cartData.totalAmount;
            const qrUrl = `https://img.vietqr.io/image/MB-0886301661-compact2.png?amount=${total}&addInfo=Thanh toan don hang&accountName=NGO GIA HIEN`;
            
            setQrModal({ show: true, url: qrUrl });
            return; // Dừng lại ở đây, KHÔNG gọi API tạo đơn
        }

        // Nếu là phương thức khác (VD: COD), gọi API tạo đơn luôn
        submitOrderToBackend();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

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
                            onSelect={(id: number) => setFormData({...formData, paymentMethodId: id})} 
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
                        />
                    </div>
                </div>
            </main>
            <Footer />

            {/* ================= MODAL QUÉT MÃ QR ================= */}
            {qrModal.show && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900">Quét mã để thanh toán</h3>
                        
                        {/* HIỂN THỊ MÃ QR */}
                        <div className="bg-white p-2 rounded-2xl border-2 border-dashed border-gray-200">
                            <img src={qrModal.url} alt="Payment QR" className="w-full aspect-square object-contain rounded-xl" />
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>Sử dụng App Ngân hàng hoặc ZaloPay để quét mã.</p>
                        </div>

                        {/* NÚT HÀNH ĐỘNG */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            {/* Nút xác nhận thanh toán -> Gọi API tạo đơn */}
                            <button 
                                onClick={submitOrderToBackend}
                                disabled={isSubmitting}
                                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Tôi đã thanh toán"}
                            </button>
                            
                            {/* Nút Đóng -> Chỉ ẩn Modal, KHÔNG TẠO ĐƠN */}
                            <button 
                                onClick={() => setQrModal({show: false, url: ''})}
                                disabled={isSubmitting}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl h-10 font-medium transition-colors"
                            >
                                Đóng, tôi chưa thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}