import Link from "next/link";
import type { Category } from "@/data/categories";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const isTwoItems = categories.length === 2;

  return (
    <section className="py-16 md:py-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Danh Mục Nổi Bật</h2>
          <p className="text-gray-500 font-medium">Khám phá các bộ sưu tập hàng đầu tại BallHub</p>
        </div>

        <div
          className={`grid gap-6 md:gap-8 ${isTwoItems ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-2 md:grid-cols-4"}`}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href || `/products?categories=${encodeURIComponent(category.name)}`}
              className="group relative bg-white rounded-[2rem] p-8 text-center cursor-pointer border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle hover gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {/* Icon wrapper */}
                <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 group-hover:bg-white shadow-inner flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                  {category.icon}
                </div>

                {/* Label */}
                <p className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                  {category.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}