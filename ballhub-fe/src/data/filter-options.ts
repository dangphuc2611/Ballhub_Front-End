// Mock data cho filter options
// TODO: Thay bằng API call khi có backend

export interface FilterOption {
  id: string;
  label: string;
}

export const categories: FilterOption[] = [
  { id: "club", label: "Áo Câu Lạc Bộ" },
  { id: "national", label: "Áo Đội Tuyển" },
  { id: "accessory", label: "Phụ kiện bóng đá" },
];

export const sizes: FilterOption[] = [
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
  { id: "XXL", label: "XXL" },
];

export const teams: FilterOption[] = [
  { id: "manchester-city", label: "Manchester City" },
  { id: "real-madrid", label: "Real Madrid" },
  { id: "arsenal", label: "Arsenal" },
  { id: "liverpool", label: "Liverpool" },
  { id: "vietnam", label: "Việt Nam" },
];

export const sortOptions = [
  { id: "newest", label: "Mới nhất" },
  { id: "price-asc", label: "Giá tăng dần" },
  { id: "price-desc", label: "Giá giảm dần" },
];

export const priceRange = {
  min: 500000,
  max: 1500000,
};
