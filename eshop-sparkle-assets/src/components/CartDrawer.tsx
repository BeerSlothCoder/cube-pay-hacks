import React, { useState } from "react";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { PaymentTerminalSelector } from "./PaymentTerminalSelector";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } =
    useCartStore();
  const [showPayment, setShowPayment] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    clearCart();
    setShowPayment(false);
    onClose();
    alert("Payment successful! Thank you for your purchase.");
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sparkle-600 font-bold mb-2">
                      {item.price} {item.currency}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-sparkle-600">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-sparkle-600 hover:bg-sparkle-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      {/* Payment Terminal Selector Modal */}
      {showPayment && (
        <PaymentTerminalSelector
          amount={getTotalPrice()}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};
