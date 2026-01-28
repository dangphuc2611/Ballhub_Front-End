import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  badge: string;
  title: string;
  description: string;
  discount: string;
  buttonText: string;
  buttonHref?: string;
  backgroundColor?: string;
}

export function PromoBanner({
  badge,
  title,
  description,
  discount,
  buttonText,
  buttonHref = "#",
  backgroundColor = "bg-gradient-to-r from-blue-600 to-blue-700",
}: PromoBannerProps) {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`${backgroundColor} rounded-2xl p-8 md:p-12 text-white`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Content */}
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white bg-opacity-20 rounded-full">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black">
                  {badge}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-balance leading-tight">
                {title}
              </h2>

              {/* Discount Highlight */}
              <p className="text-lg md:text-xl font-semibold mb-2 text-blue-100">
                Giảm ngày {discount} cho tất cả sản phẩm mùa giải trước. Dùng bộ
                lọc
              </p>

              {/* Description */}
              <p className="text-sm md:text-base text-blue-100 opacity-90">
                {description}
              </p>
            </div>

            {/* Button */}
            <div className="flex-shrink-0">
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold text-base"
              >
                <a href={buttonHref}>{buttonText}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}