import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
}

export function HeroBanner({
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonHref = "#",
  secondaryButtonHref = "#",
}: HeroBannerProps) {
  return (
    <section className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-500 bg-opacity-20 border border-green-400 rounded-full">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Ưu đãi hôm nay
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight text-balance">
            {title}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-300 mb-8 text-balance">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold w-full sm:w-auto"
            >
              <a href={primaryButtonHref}>{primaryButtonText}</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-2 border-gray-500 text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-base font-semibold w-full sm:w-auto bg-transparent"
            >
              <a href={secondaryButtonHref}>{secondaryButtonText}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
