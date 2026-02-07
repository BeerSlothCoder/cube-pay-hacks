import { Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';
import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { useCartStore } from '@/stores/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Image */}
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {item.color} • {item.size}
          </p>
        </div>

        {/* Mobile: Quantity and Remove */}
        <div className="flex items-center justify-between mt-2 md:hidden">
          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(qty) =>
              updateQuantity(item.productId, item.color, item.size, qty)
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.productId, item.color, item.size)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop: Quantity, Price, Remove */}
      <div className="hidden md:flex items-center gap-8">
        <QuantitySelector
          quantity={item.quantity}
          onQuantityChange={(qty) =>
            updateQuantity(item.productId, item.color, item.size, qty)
          }
        />
        
        <div className="w-24 text-right">
          <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.price)} each
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.productId, item.color, item.size)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Price */}
      <div className="md:hidden text-right">
        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
      </div>
    </div>
  );
};
