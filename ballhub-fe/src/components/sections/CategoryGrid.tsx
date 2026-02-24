import Link from "next/link";
import type { Category } from "@/data/categories";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const isTwoItems = categories.length === 2;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`
            grid gap-4 md:gap-6
            ${isTwoItems ? "grid-cols-2 max-w-3xl mx-auto" : "grid-cols-2 md:grid-cols-4"}
          `}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              // 👇 Thay đổi ở đây: Lấy trực tiếp href từ data truyền vào
              // Nếu Typescript báo lỗi chưa có category.href, bạn nhớ thêm `href: string;` vào interface Category trong file categories.ts nhé!
              href={category.href || `/products?categories=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <div className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-10 text-center transition-colors duration-300 cursor-pointer border border-gray-100 shadow-sm hover:shadow-md">
                {/* Icon */}
                <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>

                {/* Label */}
                <p className="text-base md:text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
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