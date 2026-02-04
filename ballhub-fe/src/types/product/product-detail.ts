import { ProductContentBlock } from './product-content';

export interface Variant {
  variantId: number;
  sizeId: number;
  sizeName: string;
  colorId: number;
  colorName: string;
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