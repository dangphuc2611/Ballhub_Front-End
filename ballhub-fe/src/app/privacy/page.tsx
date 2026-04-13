import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center">
          Chính sách bảo mật
        </h1>
        
        {/* Khối nội dung chính */}
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100 space-y-6 text-slate-600 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Mục đích thu thập thông tin</h2>
            <p>
              BallHub thu thập thông tin cá nhân của khách hàng nhằm mục đích xử lý đơn hàng, 
              giao hàng, và cung cấp các dịch vụ hỗ trợ sau bán hàng tốt nhất. Chúng tôi cam kết 
              không sử dụng thông tin của bạn vào các mục đích không chính đáng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Phạm vi sử dụng thông tin</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Xác nhận và gửi thông tin về đơn hàng của bạn.</li>
              <li>Gửi các thông báo về các hoạt động trao đổi thông tin giữa người mua và BallHub.</li>
              <li>Liên lạc và giải quyết với người dùng trong những trường hợp đặc biệt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Thời gian lưu trữ</h2>
            <p>
              Dữ liệu cá nhân của khách hàng sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ, 
              hoặc tự khách hàng đăng nhập và thực hiện hủy bỏ.
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}