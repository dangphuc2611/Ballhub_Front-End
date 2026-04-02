import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface PosCartItem {
  variantId: number;
  productId: number;
  productName: string;
  sku: string;
  sizeName: string;
  colorName: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  imageUrl: string;
  quantity: number;
}

export interface PosVoucher {
  promotionId: number;
  promotionName: string;
  promoCode: string;
  discountPercent: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
}

export interface PosOrder {
  id: string;
  items: PosCartItem[];
  customerName: string;
  customerPhone: string;
  customerId: number | null;
  isDelivery: boolean;
  deliveryAddress: string;
  addressId: number | null;
  shippingFee: number;
  discountAmount: number;
  appliedVoucher: PosVoucher | null;
  
  paymentMethodId?: number; 
}

interface PosState {
  orders: PosOrder[];
  activeOrderId: string | null;
  orderCounter: number;
  availableVouchers: PosVoucher[];
  setAvailableVouchers: (vouchers: PosVoucher[]) => void;
  addOrder: () => void;
  removeOrder: (id: string) => void;
  setActiveOrder: (id: string) => void;
  addItemToActiveOrder: (item: Omit<PosCartItem, 'quantity'>, quantity: number) => void;
  updateItemQuantity: (variantId: number, quantity: number) => void;
  removeItemFromActiveOrder: (variantId: number) => void;
  updateActiveOrderDetails: (updates: Partial<PosOrder>) => void;
  calculateBestVoucher: () => void;
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      orders: [
        { 
          id: 'HD1', 
          items: [], 
          customerName: '', 
          customerPhone: '', 
          shippingFee: 0, 
          appliedVoucher: null, 
          discountAmount: 0,
          // ✅ Bổ sung giá trị mặc định lúc khởi tạo Store
          customerId: null,
          isDelivery: false,
          addressId: null,
          deliveryAddress: ''
        }
      ],
      activeOrderId: 'HD1',
      orderCounter: 1,
      availableVouchers: [],

      setAvailableVouchers: (vouchers) => {
        set({ availableVouchers: vouchers });
        get().calculateBestVoucher();
      },

      addOrder: () => {
        const { orders, orderCounter } = get();
        if (orders.length >= 5) {
          toast.error("Chỉ được mở tối đa 5 đơn hàng! Xử lý bớt đơn cũ đi bạn ơi.");
          return;
        }
        const nextCounter = orderCounter + 1;
        const newOrderId = `HD${nextCounter}`;
        set({
          orders: [
            ...orders, 
            { 
              id: newOrderId, 
              items: [], 
              customerName: '', 
              customerPhone: '', 
              shippingFee: 0, 
              appliedVoucher: null, 
              discountAmount: 0,
              // ✅ Bổ sung giá trị mặc định lúc bấm "Tạo đơn mới"
              customerId: null,
              isDelivery: false,
              addressId: null,
              deliveryAddress: ''
            }
          ],
          activeOrderId: newOrderId,
          orderCounter: nextCounter,
        });
      },

      removeOrder: (id) => {
        set((state) => {
          const newOrders = state.orders.filter((o) => o.id !== id);
          if (newOrders.length === 0) {
            return { orders: [], activeOrderId: null, orderCounter: 0 };
          }
          const newActiveId = state.activeOrderId === id ? newOrders[newOrders.length - 1].id : state.activeOrderId;
          return { orders: newOrders, activeOrderId: newActiveId };
        });
      },

      setActiveOrder: (id) => set({ activeOrderId: id }),

      calculateBestVoucher: () => {
        const { orders, activeOrderId, availableVouchers } = get();
        const orderIndex = orders.findIndex(o => o.id === activeOrderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        const subTotal = order.items.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
        
        let bestVoucher: PosVoucher | null = null;
        let maxDiscount = 0;

        availableVouchers.forEach(v => {
          if (subTotal >= v.minOrderAmount) {
            let discount = subTotal * (v.discountPercent / 100);
            if (v.maxDiscountAmount && discount > v.maxDiscountAmount) discount = v.maxDiscountAmount;
            if (discount > maxDiscount) {
              maxDiscount = discount;
              bestVoucher = v;
            }
          }
        });

        const newOrders = [...orders];
        newOrders[orderIndex] = { ...order, appliedVoucher: bestVoucher, discountAmount: maxDiscount };
        set({ orders: newOrders });
      },

      addItemToActiveOrder: (item, quantity) => {
        const { orders, activeOrderId } = get();
        const orderIndex = orders.findIndex(o => o.id === activeOrderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        const existingItemIndex = order.items.findIndex(i => i.variantId === item.variantId);
        let newItems = [...order.items];

        if (existingItemIndex >= 0) {
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems.push({ ...item, quantity });
        }

        const newOrders = [...orders];
        newOrders[orderIndex] = { ...order, items: newItems };
        set({ orders: newOrders });
        get().calculateBestVoucher();
      },

      updateItemQuantity: (variantId, quantity) => {
        const { orders, activeOrderId } = get();
        const orderIndex = orders.findIndex(o => o.id === activeOrderId);
        if (orderIndex === -1) return;

        const order = orders[orderIndex];
        const newOrders = [...orders];
        
        newOrders[orderIndex].items = order.items.map(item => {
          if (item.variantId === variantId) {
            let newQty = Math.max(1, quantity);
            if (newQty > item.stockQuantity) {
              toast.warning(`Chỉ còn ${item.stockQuantity} sản phẩm trong kho!`);
              newQty = item.stockQuantity;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        });

        set({ orders: newOrders });
        get().calculateBestVoucher();
      },

      removeItemFromActiveOrder: (variantId) => {
        const { orders, activeOrderId } = get();
        const orderIndex = orders.findIndex(o => o.id === activeOrderId);
        if (orderIndex === -1) return;

        const newOrders = [...orders];
        newOrders[orderIndex].items = newOrders[orderIndex].items.filter(i => i.variantId !== variantId);
        set({ orders: newOrders });
        get().calculateBestVoucher();
      },

      updateActiveOrderDetails: (updates) => {
        const { orders, activeOrderId } = get();
        const orderIndex = orders.findIndex(o => o.id === activeOrderId);
        if (orderIndex === -1) return;
        const newOrders = [...orders];
        newOrders[orderIndex] = { ...newOrders[orderIndex], ...updates };
        set({ orders: newOrders });
      }
    }),
    { name: 'ballhub-pos-storage' }
  )
);