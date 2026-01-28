export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Áo CLB',
    icon: '🏆',
    slug: 'ao-clb'
  },
  {
    id: 'cat-2',
    name: 'Áo Đội Tuyển',
    icon: '🚩',
    slug: 'ao-doi-tuyen'
  },
  {
    id: 'cat-3',
    name: 'Sân Nhà / Khách',
    icon: '🏟️',
    slug: 'san-nha-khach'
  },
  {
    id: 'cat-4',
    name: 'Mùa Giải Mới',
    icon: '📅',
    slug: 'mua-giai-moi'
  }
];

export interface MenuItem {
  label: string;
  href: string;
}

export const menuItems: MenuItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Khuyến mãi', href: '/promotions' },
  { label: 'Liên hệ', href: '/contact' }
];

