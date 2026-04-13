"use client";

import { useState } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ArrowRight, Calendar, Tag as TagIcon } from "lucide-react";

const newsData = [
  {
    id: 1,
    title: "Lộ diện mẫu áo sân nhà mùa giải 24/25 của các CLB lớn",
    date: "13/04/2026",
    desc: "Cùng BallHub điểm qua những thiết kế áo đấu mới nhất đến từ Barcelona, Real Madrid và Arsenal cho mùa giải tới. Những thay đổi đột phá về chất liệu và họa tiết in chìm.",
    tag: "ÁO ĐẤU MỚI",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop", // Thay bằng link ảnh thật của bạn
  },
  {
    id: 2,
    title: "Hướng dẫn phân biệt áo bóng đá chính hãng và hàng Fake",
    date: "10/04/2026",
    desc: "Đừng để tiền mất tật mang! Bỏ túi ngay 3 mẹo kiểm tra tem tag, chất vải Dri-FIT và các đường chỉ thêu logo từ chuyên gia BallHub.",
    tag: "CẨM NANG",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Chương trình Flash Sale Giải cứu Mùa hè giảm tới 30%",
    date: "01/04/2026",
    desc: "Săn ngay những mẫu áo ĐTQG cực hot với mức giá chưa từng có. Áp dụng cho toàn bộ các mẫu áo Euro và Copa America tại hệ thống BallHub.",
    tag: "KHUYẾN MÃI",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
  }
];

export default function NewsPage() {
  const [filter, setFilter] = useState("TẤT CẢ");
  const tags = ["TẤT CẢ", "ÁO ĐẤU MỚI", "CẨM NANG", "KHUYẾN MÃI"];

  const filteredNews = filter === "TẤT CẢ" 
    ? newsData 
    : newsData.filter(item => item.tag === filter);

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 md:py-16 w-full">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">
            Tin tức & Sự kiện
          </h1>
          <p className="text-slate-500 max-w-2xl">
            Cập nhật những xu hướng áo đấu mới nhất, kiến thức bóng đá và các chương trình ưu đãi độc quyền tại BallHub.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all border-2 ${
                filter === tag
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((news) => (
            <article 
              key={news.id} 
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 shadow-sm">
                    {news.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {news.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <TagIcon size={12} />
                    BallHub Editor
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                  {news.title}
                </h2>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                  {news.desc}
                </p>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    XEM CHI TIẾT
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium">Hiện chưa có bài viết nào trong mục này.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}