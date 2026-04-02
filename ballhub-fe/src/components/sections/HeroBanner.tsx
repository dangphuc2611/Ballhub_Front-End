import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

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
    <section className="relative w-full h-[500px] md:h-[600px] bg-[#0A192F] overflow-hidden">
      {/* Dynamic Glowing Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-green-500/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-bounce" />
            <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider">
              Ưu đãi hôm nay
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            {title.split('–')[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              {title.split('–')[1]}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl font-medium">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 px-8 py-6 rounded-2xl text-lg font-bold w-full sm:w-auto shadow-lg shadow-green-500/30 transition-all hover:scale-105"
            >
              <a href={primaryButtonHref} className="flex items-center gap-2">
                {primaryButtonText} <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-2 border-white/20 text-white hover:bg-white hover:text-slate-900 px-8 py-6 rounded-2xl text-lg font-bold w-full sm:w-auto bg-white/5 backdrop-blur-sm transition-all hover:scale-105"
            >
              <a href={secondaryButtonHref}>{secondaryButtonText}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}