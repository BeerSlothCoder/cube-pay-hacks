export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}
