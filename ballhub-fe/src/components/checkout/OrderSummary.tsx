import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Tag, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/cartApi'; // Import thư viện gọi API

export function OrderSummary({ cartData, isSubmitting, onOrder, baseUrl, appliedPromo, setAppliedPromo }: any) {
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const [promoInput, setPromoInput] = useState('');

  // 1. Fetch danh sách Voucher khi component được mount
  useEffect(() => {
    const fetchPromos = async () => {
      setLoadingPromos(true);
      try {
        const res = await api.get('/promotions/vouchers/valid');
        setAvailablePromos(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách Voucher:", error);
      } finally {
        setLoadingPromos(false);
      }
    };
    fetchPromos();
  }, []);

  // 2. Logic tính toán tiền giảm giá dựa vào mã đang được áp dụng
  const subTotal = cartData.totalAmount || 0;
  let discountAmount = 0;

  if (appliedPromo) {
    if (subTotal >= appliedPromo.minOrderAmount) {
      if (appliedPromo.discountType === 'PERCENT') {
        discountAmount = (subTotal * appliedPromo.discountPercent) / 100;
        if (appliedPromo.maxDiscountAmount && discountAmount > appliedPromo.maxDiscountAmount) {
          discountAmount = appliedPromo.maxDiscountAmount;
        }
      } else if (appliedPromo.discountType === 'FIXED') {
        discountAmount = appliedPromo.maxDiscountAmount || appliedPromo.discountValue || 0;
      }
    } else {
      // Nếu tổng tiền không đủ điều kiện, gỡ bỏ mã
      setAppliedPromo(null);
      toast.error(`Đơn hàng cần đạt tối thiểu ${appliedPromo.minOrderAmount.toLocaleString()}đ để dùng mã này.`);
    }
  }

  const finalTotal = subTotal - discountAmount > 0 ? subTotal - discountAmount : 0;

  // 3. Xử lý khi người dùng ấn nút "Áp dụng" (Nhập tay)
  const handleApplyManualPromo = () => {
    if (!promoInput.trim()) return;
    
    // Tìm mã trong danh sách đã fetch
    const matchedPromo = availablePromos.find(
      p => p.promoCode.toUpperCase() === promoInput.trim().toUpperCase()
    );

    if (matchedPromo) {
      if (subTotal >= matchedPromo.minOrderAmount) {
        setAppliedPromo(matchedPromo);
        setPromoInput('');
        toast.success(`Áp dụng thành công mã ${matchedPromo.promoCode}`);
      } else {
        toast.error(`Đơn hàng cần tối thiểu ${matchedPromo.minOrderAmount.toLocaleString()}đ`);
      }
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  // 4. Xử lý khi người dùng chọn thẳng mã từ danh sách (Click)
  const handleSelectPromo = (promo: any) => {
    if (subTotal >= promo.minOrderAmount) {
      setAppliedPromo(promo);
      toast.success(`Áp dụng mã ${promo.promoCode}`);
    } else {
      toast.error(`Đơn tối thiểu ${promo.minOrderAmount.toLocaleString()}đ`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl sticky top-24">
      <h3 className="text-lg font-bold mb-6">Đơn hàng của bạn <span className="text-gray-400 font-medium">({cartData.items.length})</span></h3>
      
      {/* DANH SÁCH SẢN PHẨM TRONG GIỎ */}
      <div className="max-h-[250px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
        {cartData.items.map((item: any) => (
          <div key={item.cartItemId} className="flex gap-4">
            <div className="w-16 h-16 relative bg-gray-50 rounded-xl overflow-hidden border flex-shrink-0">
              <Image src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${baseUrl}${item.imageUrl}`} alt="img" fill className="object-contain p-1" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate">{item.productName}</h4>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Size {item.sizeName} | SL: {item.quantity}</p>
              <p className="text-sm font-bold text-green-600 mt-1">{item.subtotal.toLocaleString()}đ</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- KHU VỰC VOUCHER & MÃ GIẢM GIÁ --- */}
      <div className="border-t border-gray-50 pt-6 mb-6">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Tag size={16} className="text-green-600" /> Mã giảm giá
        </h4>
        
        {/* Input nhập mã tay */}
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Nhập mã khuyến mãi" 
            className="flex-1 border border-gray-200 rounded-xl px-4 text-sm uppercase focus:outline-none focus:border-green-500"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
          />
          <Button 
            onClick={handleApplyManualPromo} 
            variant="outline" 
            className="rounded-xl border-green-600 text-green-600 hover:bg-green-50"
          >
            Áp dụng
          </Button>
        </div>

        {/* Mã đang áp dụng */}
        {appliedPromo && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase">{appliedPromo.promoCode}</p>
              <p className="text-[10px] text-green-600">Đã giảm {discountAmount.toLocaleString()}đ</p>
            </div>
            <button onClick={() => setAppliedPromo(null)} className="text-gray-400 hover:text-red-500">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Danh sách mã có thể chọn */}
        {!appliedPromo && availablePromos.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Mã có sẵn</p>
            <div className="max-h-[120px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {availablePromos.map(promo => {
                const isEligible = subTotal >= promo.minOrderAmount;
                return (
                  <div 
                    key={promo.promotionId} 
                    onClick={() => isEligible && handleSelectPromo(promo)}
                    className={`flex justify-between items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      isEligible 
                        ? 'border-gray-200 hover:border-green-500 hover:bg-green-50/50' 
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isEligible ? 'text-gray-900' : 'text-gray-400'}`}>
                        {promo.promoCode} <span className="font-normal text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded ml-1">-{promo.discountPercent}%</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Đơn từ {(promo.minOrderAmount).toLocaleString()}đ</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* -------------------------------------- */}

      {/* TÍNH TOÁN TỔNG TIỀN */}
      <div className="space-y-3 border-t border-gray-50 pt-6 mb-8">
        <div className="flex justify-between text-sm text-gray-500"><span>Tạm tính</span><span className="font-bold text-gray-900">{subTotal.toLocaleString()}đ</span></div>
        <div className="flex justify-between text-sm text-gray-500"><span>Phí vận chuyển</span><span className="text-green-600 font-bold">Miễn phí</span></div>
        
        {/* Hiển thị dòng Giảm giá nếu có */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá Voucher</span>
            <span className="font-bold">- {discountAmount.toLocaleString()}đ</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <span className="font-bold text-gray-900">Tổng cộng</span>
          <span className="text-2xl font-black text-green-600">{finalTotal.toLocaleString()}đ</span>
        </div>
      </div>

      <Button onClick={onOrder} disabled={isSubmitting} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-100">
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Đặt hàng ngay"}
      </Button>
    </div>
  );
}