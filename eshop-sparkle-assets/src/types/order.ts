import { CartItem } from './cart';

export interface ShippingAddress {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}
