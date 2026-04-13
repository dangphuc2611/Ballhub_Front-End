import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Hàng của BallHub có phải chính hãng không?",
      a: "100% sản phẩm tại BallHub đều là hàng chính hãng, có đầy đủ tem mác và hóa đơn chứng từ từ nhà sản xuất."
    },
    {
      q: "Tôi có được kiểm tra hàng trước khi thanh toán không?",
      a: "Khách hàng hoàn toàn được phép đồng kiểm sản phẩm với Shipper trước khi thanh toán. Quý khách vui lòng kiểm tra kỹ tình trạng, số lượng và size áo ngay lúc nhận hàng."
    },
    {
      q: "Làm sao để chọn đúng size áo?",
      a: "Bạn có thể tham khảo bảng quy đổi size ở trang chi tiết sản phẩm. Nếu vẫn phân vân, hãy gọi ngay Hotline để nhân viên tư vấn size chuẩn xác nhất cho form người của bạn nhé."
    },
    {
      q: "Thời gian giao hàng là bao lâu?",
      a: "Nội thành Hà Nội từ 1-2 ngày. Các tỉnh thành khác từ 3-5 ngày làm việc tùy thuộc vào đơn vị vận chuyển."
    }
  ];

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-16 w-full">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">
            Hỏi đáp thường gặp (FAQ)
          </h1>
          <p className="text-slate-500 mt-3">Những thắc mắc phổ biến nhất của khách hàng BallHub</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Q: {faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}