export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  logo: string;
  rank: number;
  priceHistory: number[];
}

export interface UserPortfolio {
  totalValue: number;
  change24h: number;
  holdings: CryptoHolding[];
}

export interface CryptoHolding {
  crypto: Cryptocurrency;
  amount: number;
  value: number;
  change24h: number;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "send" | "receive";
  crypto: Cryptocurrency;
  amount: number;
  fiatAmount?: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  txHash?: string;
  orderId?: string;
}

export interface Order {
  id: string;
  type: "buy" | "sell";
  crypto: Cryptocurrency;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  status: "pending" | "processing" | "completed" | "failed";
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  payoutMethod?: PayoutMethod;
  timestamp: Date;
  fees: {
    network: number;
    service: number;
  };
}

export interface PaymentMethod {
  type: "cubepay" | "card" | "bank";
  name: string;
  details?: string;
}

export interface PayoutMethod {
  type: "bank" | "card" | "cubepay";
  name: string;
  details: string;
  estimatedTime: string;
}

export interface User {
  id: string;
  address?: string;
  email?: string;
  name?: string;
  avatar?: string;
  isWalletCreated: boolean;
  kycStatus: "none" | "pending" | "verified";
  limits: {
    daily: number;
    monthly: number;
  };
}

export interface PriceAlert {
  id: string;
  crypto: Cryptocurrency;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
