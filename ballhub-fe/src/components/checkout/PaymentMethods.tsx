import { CreditCard, Info } from 'lucide-react';

export function PaymentMethods({ selectedMethod, onSelect }: any) {
  const options = [
    { id: 1, title: 'Tiền mặt khi nhận hàng (COD)', desc: 'Thanh toán khi nhận hàng.', icon: <CreditCard size={20} /> },
    { id: 2, title: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản qua App hoặc ATM.', icon: <Info size={20} /> },
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
          </div>
        ))}
      </div>
    </section>
  );
}