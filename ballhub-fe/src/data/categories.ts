// Mock category data - TODO: Replace with API calls
export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  href: string; // Đảm bảo đã khai báo href
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Áo CLB",
    icon: "👕",
    slug: "ao-clb",
    href: "/products?categories=Áo CLB", 
  },
  {
    id: "cat-2",
    name: "Quần CLB",
    icon: "🩳",
    slug: "quan-clb",
    href: "/products?categories=Quần CLB", 
  },
  {
    id: "cat-3",
    name: "Áo ĐTQG",
    icon: "⚽", 
    slug: "ao-dtqg",
    href: "/products?categories=Áo ĐTQG",
  },
  {
    id: "cat-4",
    name: "Quần ĐTQG",
    icon: "🏃",
    slug: "quan-dtqg",
    href: "/products?categories=Quần ĐTQG",
  }
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