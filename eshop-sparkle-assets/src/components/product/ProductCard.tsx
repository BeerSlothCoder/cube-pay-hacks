import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
            {product.stock === 'limited' && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                Limited
              </Badge>
            )}
          </div>
          
          <p className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </p>

          {/* Color Options */}
          <div className="mt-3 flex items-center gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="h-4 w-4 rounded-full border-2 border-background shadow-sm"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{product.colors.length - 4}
              </span>
            )}
          </div>

          {/* Quick Add (visible on hover) */}
          <Button
            size="sm"
            className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Quick add functionality will be handled in product detail
            }}
          >
            Quick View
          </Button>
        </div>
      </div>
    </Link>
  );
};
