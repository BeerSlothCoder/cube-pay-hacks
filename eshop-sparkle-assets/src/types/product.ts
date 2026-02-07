export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: 'hoodies' | 'tshirts' | 'caps' | 'sneakers';
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  featured?: boolean;
  stock: 'in-stock' | 'limited' | 'out-of-stock';
  details?: {
    materials?: string;
    care?: string;
    shipping?: string;
  };
}

export interface ProductColor {
  name: string;
  value: string; // hex color
}

export interface ProductFilter {
  categories: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  inStockOnly: boolean;
}
