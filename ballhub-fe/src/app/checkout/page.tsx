'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import api from '@/lib/cartApi';

// Import các thành phần vừa tách
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

    useEffect(() => {
        api.get("/cart").then(res => {
            if (res.data.data.items.length === 0) router.push('/shoppingcart');
            else { setCartData(res.data.data); setLoading(false); }
        }).catch(() => toast.error("Lỗi tải giỏ hàng"));
    }, []);

    const handleOrder = async () => {
        if (!formData.fullName || !formData.phone) return toast.error("Thiếu thông tin nhận hàng");
        setIsSubmitting(true);
        try {
            const payload = { addressId: formData.addressId, paymentMethodId: formData.paymentMethodId, note: formData.note };
            const res = await api.post("/orders", payload);
            toast.success("Đặt hàng thành công!");
            router.push(`/order-success/${res.data.data.orderId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Đặt hàng thất bại");
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-green-600" size={40} /></div>;

    return (
        <div className="bg-[#F8F9FA] min-h-screen flex flex-col">
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
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}