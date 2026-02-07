import React from "react";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useCartStore } from "../store/cartStore";

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="bg-gradient-to-r from-sparkle-600 via-purple-600 to-pink-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Sparkle Assets</h1>
              <p className="text-sm text-white/80">
                Premium Digital Marketplace
              </p>
            </div>
          </div>

          <button
            onClick={onCartClick}
            className="relative bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
