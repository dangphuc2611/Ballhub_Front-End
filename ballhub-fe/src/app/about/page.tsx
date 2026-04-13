import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ShieldCheck, Star, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 text-center">
          Về BallHub
        </h1>
        <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Đam mê bóng đá không chỉ nằm ở những phút giây trên sân cỏ, mà còn ở cách bạn thể hiện tình yêu với đội bóng của mình. Đó là lý do BallHub ra đời.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">100% Chính hãng</h3>
            <p className="text-sm text-slate-500">Cam kết mọi sản phẩm áo đấu, phụ kiện đều là hàng chính hãng từ các thương hiệu lớn.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Giao hàng tốc độ</h3>
            <p className="text-sm text-slate-500">Xử lý đơn hàng nhanh chóng. Cập nhật trạng thái liên tục tới tay khách hàng.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star size={24} />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Dịch vụ tận tâm</h3>
            <p className="text-sm text-slate-500">Hỗ trợ tư vấn size chuẩn xác. Luôn đặt trải nghiệm của người hâm mộ lên hàng đầu.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-slate-600 leading-relaxed">
          <p>
            Tọa lạc tại <strong>58 Trúc Khê, Đống Đa, Hà Nội</strong>, BallHub tự hào là điểm đến tin cậy của cộng đồng yêu bóng đá Việt Nam. Chúng tôi không chỉ bán áo đấu, chúng tôi trao gửi niềm tự hào và tinh thần thể thao cháy bỏng.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}