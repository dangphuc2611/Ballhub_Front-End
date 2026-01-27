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

export async function getProducts() {
  const res = await axios.get(`${API_URL}/products`);
  return res.data.data.content as ApiProduct[];
}
