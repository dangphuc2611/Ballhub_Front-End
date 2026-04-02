import { CreditCard, Wallet } from 'lucide-react';

export function PaymentMethods({ selectedMethod, onSelect }: any) {
  const options = [
    { 
      id: 1, 
      title: 'Thanh toán khi nhận hàng (COD)', 
      desc: 'Thanh toán bằng tiền mặt khi shipper giao hàng tới.', 
      icon: <Wallet size={20} /> 
    },
    { 
      id: 2, 
      title: 'Thanh toán ngay (VNPAY)', 
      desc: 'Thanh toán an toàn qua thẻ ATM nội địa, thẻ quốc tế hoặc ví điện tử VNPAY.', 
      icon: <CreditCard size={20} /> 
    },
  ];

  return (
    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">2</div>
        <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
      </div>
      <div className="space-y-3">
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${selectedMethod === opt.id ? 'border-green-500 bg-green-50/30' : 'border-gray-50 hover:border-gray-200'}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${selectedMethod === opt.id ? 'border-green-500' : 'border-gray-300'}`}>
              {selectedMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={selectedMethod === opt.id ? 'text-green-600' : 'text-gray-400'}>{opt.icon}</span>
                <h4 className="font-bold text-sm">{opt.title}</h4>
              </div>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
            
            {/* Hiển thị logo VNPAY nếu chọn id = 2 */}
            {opt.id === 2 && (
              <div className="flex-shrink-0">
                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/oxqsmxnx302l1685987341181.png" alt="VNPAY" className="h-6 object-contain grayscale opacity-60 transition-all" style={selectedMethod === opt.id ? { filter: 'none', opacity: 1 } : {}} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}