import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-16 text-center">
        <span className="text-lg font-semibold">{quantity}</span>
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
