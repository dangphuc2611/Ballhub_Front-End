import Image from 'next/image';
import { Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrderSummary({ cartData, isSubmitting, onOrder, baseUrl }: any) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl sticky top-24">
      <h3 className="text-lg font-bold mb-6">Đơn hàng của bạn <span className="text-gray-400 font-medium">({cartData.items.length})</span></h3>
      
      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
        {cartData.items.map((item: any) => (
          <div key={item.cartItemId} className="flex gap-4">
            <div className="w-16 h-16 relative bg-gray-50 rounded-xl overflow-hidden border flex-shrink-0">
              <Image src={item.imageUrl.startsWith('http') ? item.imageUrl : `${baseUrl}${item.imageUrl}`} alt="img" fill className="object-contain p-1" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate">{item.productName}</h4>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Size {item.sizeName} | SL: {item.quantity}</p>
              <p className="text-sm font-bold text-green-600 mt-1">{item.subtotal.toLocaleString()}đ</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-gray-50 pt-6 mb-8">
        <div className="flex justify-between text-sm text-gray-500"><span>Tạm tính</span><span className="font-bold text-gray-900">{cartData.totalAmount.toLocaleString()}đ</span></div>
        <div className="flex justify-between text-sm text-gray-500"><span>Phí vận chuyển</span><span className="text-green-600 font-bold">Miễn phí</span></div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <span className="font-bold text-gray-900">Tổng cộng</span>
          <span className="text-2xl font-black text-green-600">{cartData.totalAmount.toLocaleString()}đ</span>
        </div>
      </div>

      <Button onClick={onOrder} disabled={isSubmitting} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-100">
        {isSubmitting ? <Loader2 className="animate-spin" /> : "Đặt hàng ngay"}
      </Button>
    </div>
  );
}