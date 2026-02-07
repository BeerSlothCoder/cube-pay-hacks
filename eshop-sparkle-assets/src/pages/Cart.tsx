import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import paymentBanner from '@/assets/cubepay-payment-banner.png';

const Cart = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const shipping = useCartStore((state) => state.getShipping());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Start shopping to add items to your cart</p>
          <Button asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8 overflow-hidden rounded-xl">
          <div className="flex items-center gap-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white z-10 relative">Shopping Cart</h1>
            <div className="flex-1 hidden md:block">
              <img 
                src={paymentBanner} 
                alt="CubePay Payment Gate" 
                className="w-full h-24 object-cover object-left"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card p-4 md:p-6">
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.color}-${item.size}`} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onCheckout={() => navigate('/checkout')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
