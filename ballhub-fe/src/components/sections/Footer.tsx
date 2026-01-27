import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <h3 className="text-lg font-bold">BallHub</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Chuyên cung cấp các mẫu áo bóng đá chính hãng, đồ dùng quần áo,
              giày và những đồ dùng tương tự khác tại Việt Nam.
            </p>
            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 rounded-lg hover:bg-green-500 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Thông tin BallHub */}
          <div>
            <h4 className="text-base font-bold mb-6">Thông tin BallHub</h4>
            <ul className="space-y-3">
              {[
                { label: "Về chúng tôi", href: "#" },
                { label: "Hỏi đáp thường gặp", href: "#" },
                { label: "Tuyển dụng", href: "#" },
                { label: "Tin tức bộng dá", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h4 className="text-base font-bold mb-6">Chính sách</h4>
            <ul className="space-y-3">
              {[
                { label: "Chính sách đổi trả", href: "#" },
                { label: "Chính sách bảo mật", href: "#" },
                { label: "Điều khoản dịch vụ", href: "#" },
                { label: "Hướng dẫn thanh toán", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-base font-bold mb-6">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <p className="font-semibold text-white mb-1">Địa chỉ</p>
                <p>123 Đường Số 1, Quận 1, TP Hồ Chí Minh</p>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Hotline</p>
                <p>1900-533-456</p>
              </li>
              <li>
                <p className="font-semibold text-white mb-1">Email</p>
                <a
                  href="mailto:support@ballhub.com"
                  className="hover:text-green-400 transition-colors"
                >
                  support@ballhub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} BallHub Vietnam. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
