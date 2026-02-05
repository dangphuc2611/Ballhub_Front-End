'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { ProductCard } from './ProductCard';
import type { Product } from '@/types/product';

interface Props {
  products: Product[];
  featured?: boolean;
}

export default function ProductSlider({ products, featured }: Props) {
  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      spaceBetween={16}
      slidesPerView={4}
      loop
      navigation
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      breakpoints={{
        0: { slidesPerView: 2 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} className="h-auto">
          <ProductCard
            product={product}
            variant={featured ? 'featured' : 'default'}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}