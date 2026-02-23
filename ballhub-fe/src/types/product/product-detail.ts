import { ProductContentBlock } from './product-content';

export interface Variant {
  variantId: number;
  sizeId: number;
  sizeName: string;
  colorId: number;
  colorName: string;
  price?: number;          // Bổ sung: Giá gốc của biến thể
  discountPrice?: number;  // Bổ sung: Giá sale của biến thể
  finalPrice: number;
  stockQuantity: number;
}

export interface SizeOption {
  sizeId: number;
  sizeName: string;
  available: boolean;
}

export interface ColorOption {
  colorId: number;
  colorName: string;
  available: boolean;
}

export interface ProductDetail {
  productId: number;
  productName: string;
  description: string;
  brandName: string;
  categoryName: string;

  // --- BỔ SUNG TRƯỜNG FLASH SALE TỪ API ---
  minOriginalPrice?: number;
  maxOriginalPrice?: number;
  discountPercent?: number;

  minPrice: number;
  maxPrice: number;

  images: {
    imageUrl: string;
    isMain: boolean;
  }[];

  variants: Variant[];
  sizeOptions: SizeOption[];
  colorOptions: ColorOption[];

  /** ✅ LUÔN CÓ */
  contentBlock: ProductContentBlock;
}