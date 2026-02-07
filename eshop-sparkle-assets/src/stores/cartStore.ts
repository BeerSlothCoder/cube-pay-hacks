import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { calculateShipping, calculateTax } from '@/utils/currency';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
          );
          
          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity || 1;
            return { items: newItems };
          }
          
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        });
      },
      
      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.color === color && item.size === size)
          ),
        }));
      },
      
      updateQuantity: (productId, color, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, color, size);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.color === color && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getShipping: () => {
        const subtotal = get().getSubtotal();
        return calculateShipping(subtotal);
      },
      
      getTax: () => {
        const subtotal = get().getSubtotal();
        return calculateTax(subtotal);
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShipping();
        const tax = get().getTax();
        return subtotal + shipping + tax;
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cubepay-cart',
    }
  )
);
