import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Cryptocurrency,
  User,
  Transaction,
  Order,
  CryptoHolding,
} from "../types";
import {
  mockCryptocurrencies,
  mockUser,
  mockTransactions,
  mockOrders,
} from "../data/mockData";

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Crypto data
  cryptocurrencies: Cryptocurrency[];
  selectedCrypto: Cryptocurrency | null;

  // Portfolio
  holdings: CryptoHolding[];
  totalPortfolioValue: number;
  portfolioChange24h: number;

  // Transactions & Orders
  transactions: Transaction[];
  orders: Order[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Buy/Sell flow
  buyAmount: number;
  sellAmount: number;
  buyMode: "fiat" | "crypto";
  sellMode: "crypto" | "fiat";

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setSelectedCrypto: (crypto: Cryptocurrency | null) => void;
  setBuyAmount: (amount: number) => void;
  setSellAmount: (amount: number) => void;
  setBuyMode: (mode: "fiat" | "crypto") => void;
  setSellMode: (mode: "crypto" | "fiat") => void;
  addTransaction: (transaction: Transaction) => void;
  addOrder: (order: Order) => void;
  updateCryptoPrices: (prices: Partial<Cryptocurrency>[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      cryptocurrencies: [],
      selectedCrypto: null,
      holdings: [],
      totalPortfolioValue: 0,
      portfolioChange24h: 0,
      transactions: [],
      orders: [],
      isLoading: false,
      error: null,
      buyAmount: 0,
      sellAmount: 0,
      buyMode: "fiat",
      sellMode: "crypto",

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setSelectedCrypto: (selectedCrypto) => set({ selectedCrypto }),

      setBuyAmount: (buyAmount) => set({ buyAmount }),

      setSellAmount: (sellAmount) => set({ sellAmount }),

      setBuyMode: (buyMode) => set({ buyMode }),

      setSellMode: (sellMode) => set({ sellMode }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateCryptoPrices: (prices) =>
        set((state) => ({
          cryptocurrencies: state.cryptocurrencies.map((crypto) => {
            const update = prices.find((p) => p.id === crypto.id);
            return update ? { ...crypto, ...update } : crypto;
          }),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      initializeData: () => {
        const state = get();
        if (state.cryptocurrencies.length === 0) {
          // Calculate mock holdings based on transactions
          const holdings: CryptoHolding[] = [
            {
              crypto: mockCryptocurrencies[0], // BTC
              amount: 0.05,
              value: 0.05 * mockCryptocurrencies[0].price,
              change24h:
                0.05 *
                mockCryptocurrencies[0].price *
                (mockCryptocurrencies[0].change24h / 100),
            },
            {
              crypto: mockCryptocurrencies[1], // ETH
              amount: 1.5,
              value: 1.5 * mockCryptocurrencies[1].price,
              change24h:
                1.5 *
                mockCryptocurrencies[1].price *
                (mockCryptocurrencies[1].change24h / 100),
            },
            {
              crypto: mockCryptocurrencies[2], // USDC
              amount: 500,
              value: 500 * mockCryptocurrencies[2].price,
              change24h:
                500 *
                mockCryptocurrencies[2].price *
                (mockCryptocurrencies[2].change24h / 100),
            },
          ];

          const totalValue = holdings.reduce(
            (sum, holding) => sum + holding.value,
            0
          );
          const totalChange = holdings.reduce(
            (sum, holding) => sum + holding.change24h,
            0
          );

          set({
            cryptocurrencies: mockCryptocurrencies,
            transactions: mockTransactions,
            orders: mockOrders,
            holdings,
            totalPortfolioValue: totalValue,
            portfolioChange24h: (totalChange / totalValue) * 100,
          });
        }
      },
    }),
    {
      name: "cubepay-exchange-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        transactions: state.transactions,
        orders: state.orders,
        holdings: state.holdings,
      }),
    }
  )
);
