// Mock data cho trang danh sách sản phẩm
// TODO: Thay bằng API call khi có backend

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  badge?: "new" | "discount" | "authentic" | "bestseller";
  badgeLabel?: string;
  category: "club" | "national" | "accessory";
  team: string;
  size: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Man Utd Sân Nhà 23/24",
    price: 1200000,
    originalPrice: 1500000,
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=600&fit=crop",
    rating: 4.5,
    badge: "discount",
    badgeLabel: "-20%",
    category: "club",
    team: "Manchester United",
    size: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "2",
    name: "Real Madrid Sân Nhà 23/24",
    price: 1300000,
    image:
      "https://images.unsplash.com/photo-1516591291840-3bedd07b6641?w=500&h=600&fit=crop",
    rating: 4.8,
    badge: "authentic",
    badgeLabel: "Chính hãng",
    category: "club",
    team: "Real Madrid",
    size: ["M", "L", "XL"],
  },
  {
    id: "3",
    name: "Arsenal Sân Khách 23/24",
    price: 1100000,
    originalPrice: 1400000,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    rating: 4.3,
    badge: "discount",
    badgeLabel: "-21%",
    category: "club",
    team: "Arsenal",
    size: ["S", "M", "L", "XL"],
  },
  {
    id: "4",
    name: "Liverpool Sân Nhà 24/25",
    price: 1350000,
    image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6be4?w=500&h=600&fit=crop",
    rating: 4.9,
    badge: "new",
    badgeLabel: "Mới",
    category: "club",
    team: "Liverpool",
    size: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "5",
    name: "Áo Đội Tuyển Việt Nam Sân Nhà",
    price: 850000,
    originalPrice: 1000000,
    image:
      "https://images.unsplash.com/photo-1565033566867-97a82d3b45b1?w=500&h=600&fit=crop",
    rating: 4.6,
    badge: "bestseller",
    badgeLabel: "Bán chạy",
    category: "national",
    team: "Việt Nam",
    size: ["M", "L", "XL"],
  },
  {
    id: "6",
    name: "Man City Sân Nhà 24/25",
    price: 1400000,
    image:
      "https://images.unsplash.com/photo-1535148566835-c8b3a1a58ce0?w=500&h=600&fit=crop",
    rating: 4.7,
    badge: "new",
    badgeLabel: "Mới",
    category: "club",
    team: "Manchester City",
    size: ["S", "M", "L", "XL"],
  },
  {
    id: "7",
    name: "Tottenham Sân Khách 23/24",
    price: 950000,
    originalPrice: 1200000,
    image:
      "https://images.unsplash.com/photo-1572365992253-3cb3e56dd362?w=500&h=600&fit=crop",
    rating: 4.4,
    badge: "discount",
    badgeLabel: "-21%",
    category: "club",
    team: "Tottenham",
    size: ["M", "L", "XL", "XXL"],
  },
  {
    id: "8",
    name: "Chelsea Sân Nhà 23/24",
    price: 1150000,
    image:
      "https://images.unsplash.com/photo-1456283474921-34b63d3d89e5?w=500&h=600&fit=crop",
    rating: 4.5,
    badge: "authentic",
    badgeLabel: "Chính hãng",
    category: "club",
    team: "Chelsea",
    size: ["S", "M", "L"],
  },
  {
    id: "9",
    name: "Barcelona Sân Khách 22/23",
    price: 900000,
    originalPrice: 1300000,
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=600&fit=crop",
    rating: 4.2,
    badge: "discount",
    badgeLabel: "-31%",
    category: "club",
    team: "Barcelona",
    size: ["S", "M", "L", "XL"],
  },
  {
    id: "10",
    name: "Juventus Sân Nhà 23/24",
    price: 1250000,
    image:
      "https://images.unsplash.com/photo-1531415074968-36d1d127a053?w=500&h=600&fit=crop",
    rating: 4.6,
    badge: "bestseller",
    badgeLabel: "Bán chạy",
    category: "club",
    team: "Juventus",
    size: ["M", "L", "XL", "XXL"],
  },
  {
    id: "11",
    name: "Bayern Munich Sân Nhà 24/25",
    price: 1380000,
    image:
      "https://images.unsplash.com/photo-1517466895681-56dae374c1d1?w=500&h=600&fit=crop",
    rating: 4.8,
    badge: "new",
    badgeLabel: "Mới",
    category: "club",
    team: "Bayern Munich",
    size: ["S", "M", "L"],
  },
  {
    id: "12",
    name: "PSG Sân Nhà 23/24",
    price: 1320000,
    originalPrice: 1600000,
    image:
      "https://images.unsplash.com/photo-1577902019539-36e96e57938f?w=500&h=600&fit=crop",
    rating: 4.7,
    badge: "discount",
    badgeLabel: "-18%",
    category: "club",
    team: "PSG",
    size: ["M", "L", "XL", "XXL"],
  },
];
