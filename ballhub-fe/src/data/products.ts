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

export const newProducts: Product[] = [
  {
    id: 'new-1',
    name: 'Man Utd Sân Nhà 23/24',
    price: 2000000,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    category: 'Áo CLB',
    isNew: true,
    badge: 'MỚI'
  },
  {
    id: 'new-2',
    name: 'Real Madrid Sân Nhà 23/24',
    price: 1800000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    category: 'Áo CLB',
    isNew: true,
    badge: 'MỚI'
  },
  {
    id: 'new-3',
    name: 'Arsenal Sân Khách 23/24',
    price: 1600000,
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=500&fit=crop',
    category: 'Áo CLB',
    isNew: true,
    badge: 'MỚI'
  },
  {
    id: 'new-4',
    name: 'Tuyển Việt Nam Sân Nhà',
    price: 1300000,
    image: 'https://images.unsplash.com/photo-1505814346881-b72b27e84530?w=500&h=500&fit=crop',
    category: 'Áo Đội Tuyển',
    isNew: true,
    badge: 'MỚI'
  }
];

export const bestsellingProducts: Product[] = [
  {
    id: 'best-1',
    name: 'Man City Sân Nhà 23/24',
    price: 1800000,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    category: 'Áo CLB',
    badge: 'BÁN CHẠY'
  },
  {
    id: 'best-2',
    name: 'Nike Phantom GX',
    price: 3200000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    category: 'Giày',
    badge: 'BÁN CHẠY'
  },
  {
    id: 'best-3',
    name: 'Liverpool Sân Nhà 23/24',
    price: 1900000,
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=500&fit=crop',
    category: 'Áo CLB',
    badge: 'BÁN CHẠY'
  },
  {
    id: 'best-4',
    name: 'Hập Anh Sân Đấu',
    price: 990000,
    image: 'https://images.unsplash.com/photo-1505814346881-b72b27e84530?w=500&h=500&fit=crop',
    category: 'Áo Đội Tuyển',
    badge: 'BÁN CHẠY'
  }
];
