import { ProductColor } from '@/types/product';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorSelector = ({ colors, selectedColor, onColorChange }: ColorSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Color: <span className="text-muted-foreground">{selectedColor}</span>
      </label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onColorChange(color.name)}
            className={cn(
              'relative h-12 w-12 rounded-full border-2 transition-all',
              selectedColor === color.name
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'border-border hover:border-muted-foreground'
            )}
            title={color.name}
          >
            <div
              className="h-full w-full rounded-full"
              style={{ backgroundColor: color.value }}
            />
            {selectedColor === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
