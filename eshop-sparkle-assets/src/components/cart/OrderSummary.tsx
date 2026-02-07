import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import trustBadge from '@/assets/cubepay-trust-badge-circle.png';
import cubePayLogo from '@/assets/cubepay-logo.png';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  showCheckout?: boolean;
  onCheckout?: () => void;
  checkoutLabel?: string;
}

export const OrderSummary = ({
  subtotal,
  shipping,
  tax,
  total,
  showCheckout = true,
  onCheckout,
  checkoutLabel = 'Proceed to Checkout',
}: OrderSummaryProps) => {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 sticky top-20">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (8%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        
        {shipping === 0 && subtotal > 0 && (
          <p className="text-xs text-success">
            🎉 You qualify for free shipping!
          </p>
        )}
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-primary">{formatCurrency(total)}</span>
      </div>

      {showCheckout && (
        <>
          <button 
            onClick={onCheckout}
            className="w-full py-4 px-8 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--cubepay-green-glow)) 0%, hsl(var(--cubepay-green)) 50%, hsl(var(--cubepay-green-light)) 100%)',
              boxShadow: '0 8px 32px hsla(var(--cubepay-green), 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)',
            }}
          >
            <img 
              src={cubePayLogo} 
              alt="CubePay Logo" 
              className="h-8 w-8"
            />
            <span className="relative z-10">Pay with CubePay</span>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              style={{ transform: 'skewX(-20deg)' }}
            />
          </button>
          
          <div className="flex items-center justify-center gap-3 py-4 bg-muted/30 rounded-lg">
            <img 
              src={trustBadge} 
              alt="Secured by CubePay" 
              className="h-16 w-16"
            />
            <span className="text-sm font-medium text-foreground">
              Secured by CubePay Gate
            </span>
          </div>
          
          <Button variant="outline" size="sm" className="w-full">
            Continue Shopping
          </Button>
        </>
      )}
    </div>
  );
};
