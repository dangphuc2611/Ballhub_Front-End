// Mock category data - TODO: Replace with API calls
export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Quần Áo CLB",
    icon: "🏆",
    slug: "quan-ao-clb",
  },
  {
    id: "cat-2",
    name: "Quần Áo Đội Tuyển",
    icon: "🚩",
    slug: "quan-ao-doi-tuyen",
  },
];

export interface MenuItem {
  label: string;
  href: string;
}

export const menuItems: MenuItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Khuyến mãi", href: "/promotions" },
  { label: "Liên hệ", href: "/contact" },
];

