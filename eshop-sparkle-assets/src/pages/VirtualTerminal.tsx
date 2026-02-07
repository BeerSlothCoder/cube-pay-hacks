import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';

const VirtualTerminal = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const orderId = searchParams.get('order_id');
  const amount = parseFloat(searchParams.get('amount') || '0');
  const merchant = searchParams.get('merchant');
  
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setRedirecting(false);
    }
  }, [countdown]);

  const handleSimulatePayment = () => {
    // Clear cart and redirect to confirmation
    clearCart();
    navigate(`/order-confirmation?order_id=${orderId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/5 p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {redirecting ? (
          <>
            <div className="animate-spin mx-auto h-16 w-16 rounded-full border-4 border-primary border-t-transparent" />
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Redirecting to CubePay Virtual Terminal...</h1>
              <p className="text-lg text-muted-foreground">
                You will be redirected to your personal payment terminal
              </p>
              <p className="text-4xl font-bold text-primary">
                {countdown}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-lg border bg-card p-8 space-y-6">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2">🎯 Virtual Terminal Integration Point</h1>
              <p className="text-muted-foreground">
                This is where your AR Viewer virtual terminal would appear
              </p>
            </div>

            <div className="rounded-lg bg-muted p-6 space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-semibold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-primary text-lg">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant:</span>
                <span className="font-semibold">{merchant}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
              <p className="text-sm text-muted-foreground">
                [This will redirect to AR Viewer virtual terminal in production]
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={handleSimulatePayment}>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Simulate Payment Success
            </Button>

            <p className="text-xs text-muted-foreground">
              For testing purposes only
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTerminal;
