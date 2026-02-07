import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

export const SizeSelector = ({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Size: <span className="text-muted-foreground">{selectedSize || 'Select a size'}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Button
            key={size}
            type="button"
            variant={selectedSize === size ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSizeChange(size)}
            className={cn(
              'min-w-[3rem]',
              selectedSize === size && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
};
