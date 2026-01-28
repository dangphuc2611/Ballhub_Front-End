import axios from "axios";

const API_URL = "http://localhost:8080/api";

export interface ApiProduct {
  productId: number;
  productName: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  mainImage: string;
  minPrice: number;
  maxPrice: number;
  status: boolean;
  createdAt: string;
}

/* =======================
   GET ALL PRODUCTS
======================= */
export async function getProducts(page = 0, size = 12) {
  const res = await axios.get(`${API_URL}/products`, {
    params: { page, size },
  });

  return res.data.data.content as ApiProduct[];
}

/* =======================
   FILTER PRODUCTS
======================= */

export interface ProductFilterParams {
  categories?: string[];
  teams?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export async function filterProducts(params: ProductFilterParams) {
  const res = await axios.get(`${API_URL}/products/filter`, {
    params: {
      categories: params.categories,
      teams: params.teams,
      sizes: params.sizes,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      page: params.page ?? 0,
      size: params.size ?? 12,
    },
    paramsSerializer: {
      indexes: null, 
      // để axios gửi dạng: categories=A&categories=B
    },
  });

  return res.data.data.content as ApiProduct[];
}
