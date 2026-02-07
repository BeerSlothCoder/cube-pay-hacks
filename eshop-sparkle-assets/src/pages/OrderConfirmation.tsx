import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Mail } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useCartStore } from "@/stores/cartStore";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const total = useCartStore((state) => state.getTotal());

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-mono font-semibold">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="font-semibold text-primary text-lg">
                  {formatCurrency(total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">CubePay Payment Gate</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Confirmation email sent</p>
                <p className="text-muted-foreground">
                  We've sent a confirmation to your email address
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Shipping Information</h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estimated Delivery:
                </span>
                <span className="font-medium">5-7 business days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="font-medium">Available when shipped</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="outline" className="flex-1" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <Button size="lg" className="flex-1" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Questions about your order?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
