import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function TermsPage() {
  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 md:py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center">
          Điều khoản dịch vụ
        </h1>
        
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-100 space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Quy định chung</h2>
            <p>
              Khi truy cập và mua sắm tại hệ thống website của BallHub, quý khách mặc nhiên đồng ý với các điều khoản và điều kiện được nêu tại đây. Chúng tôi có quyền thay đổi, chỉnh sửa các điều khoản này vào bất kỳ lúc nào mà không cần báo trước.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Trách nhiệm của khách hàng</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cung cấp thông tin giao hàng (Tên, SĐT, Địa chỉ) chính xác tuyệt đối để tránh thất lạc đơn hàng.</li>
              <li>Tuyệt đối không sử dụng các chương trình, công cụ can thiệp vào hệ thống hoặc làm thay đổi cấu trúc dữ liệu của BallHub (đặc biệt là hệ thống Voucher/Flash Sale).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. Giá cả và thông tin sản phẩm</h2>
            <p>
              Giá sản phẩm niêm yết trên website là giá bán cuối cùng (chưa bao gồm phí vận chuyển nếu có). Trong một số trường hợp lỗi hệ thống khiến giá bị sai lệch nghiêm trọng, BallHub có quyền từ chối hoặc hủy đơn hàng và sẽ thông báo lại cho quý khách.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}