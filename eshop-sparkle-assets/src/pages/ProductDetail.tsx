import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ColorSelector } from '@/components/product/ColorSelector';
import { SizeSelector } from '@/components/product/SizeSelector';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { formatCurrency } from '@/utils/currency';
import { useCartStore } from '@/stores/cartStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  
  const product = products.find((p) => p.slug === slug);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0].name || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      image: product.images[0],
      quantity,
    });

    toast({
      title: 'Added to cart',
      description: `${quantity} ${product.name} added to your cart`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={product.images[mainImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    mainImage === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                {product.stock === 'limited' && (
                  <Badge variant="secondary">Limited Stock</Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <ColorSelector
              colors={product.colors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />

            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{product.description}</p>
                </AccordionContent>
              </AccordionItem>
              
              {product.details?.materials && (
                <AccordionItem value="materials">
                  <AccordionTrigger>Materials & Care</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground mb-2">{product.details.materials}</p>
                    {product.details.care && (
                      <p className="text-muted-foreground">{product.details.care}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {product.details?.shipping && (
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{product.details.shipping}</p>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
