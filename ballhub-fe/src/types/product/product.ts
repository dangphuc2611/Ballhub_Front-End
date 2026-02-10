export interface Product {
  id: string; // ✅ đổi sang string
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
}