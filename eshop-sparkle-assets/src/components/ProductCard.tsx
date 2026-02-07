import React from "react";
import { Plus } from "lucide-react";
import type { Product } from "../store/cartStore";
import { useCartStore } from "../store/cartStore";

interface ProductCardProps {
  product: Product;
}

const CATEGORY_LABELS: Record<Product["category"], string> = {
  nft: "NFT",
  "3d-model": "3D Model",
  audio: "Audio",
  video: "Video",
  art: "Art",
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 right-2 bg-sparkle-600 text-white text-xs px-2 py-1 rounded-full">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-sparkle-600">
              {product.price} {product.currency}
            </p>
          </div>

          <button
            onClick={() => addItem(product)}
            className="bg-sparkle-600 hover:bg-sparkle-700 text-white p-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
