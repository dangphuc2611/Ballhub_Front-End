import { getImageUrl } from "@/config/env";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  badge?: string;
}

export function mapApiProduct(p: any): Product {
  return {
    id: String(p.productId),
    name: p.productName,
    price: p.minPrice,
    image: getImageUrl(p.mainImage),
    category: p.categoryName,
    isNew: true, // tạm
    badge: "MỚI", // tạm
  };
}