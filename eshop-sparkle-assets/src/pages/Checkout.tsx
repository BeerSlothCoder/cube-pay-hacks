import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ShippingAddress } from "@/types/order";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import trustBadge from "@/assets/cube-trust-badge.png";
import cubePayLogo from "@/assets/cubepay-logo.png";
import { createPaymentSession } from "@/services/paymentSessionService";

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const shipping = useCartStore((state) => state.getShipping());
  const tax = useCartStore((state) => state.getTax());
  const total = useCartStore((state) => state.getTotal());

  const [step, setStep] = useState<"shipping" | "payment" | "review">(
    "shipping"
  );
  const [paymentMethod, setPaymentMethod] = useState("cubepay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);

      // Generate order ID
      const orderId =
        "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Prepare payment data
      const paymentData = {
        orderId,
        amount: total,
        currency: "USD",
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          color: item.color,
          size: item.size,
        })),
        merchantName: "CubePay Merch",
        redirectUrl: `http://localhost:5175/order-confirmation?order_id=${orderId}`,
      };

      // Encode payment data
      const encodedData = btoa(JSON.stringify(paymentData));

      // Redirect to payment redirect page
      window.location.href = `http://localhost:5173/payment-redirect?data=${encodedData}`;
    } catch (error) {
      console.error("Failed to create payment:", error);
      alert("Failed to process order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 relative">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-semibold mb-4">
                1. Shipping Information
              </h2>

              {step === "shipping" ? (
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      required
                      value={shippingAddress.addressLine1}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          addressLine1: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          addressLine2: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        required
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            zipCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-8 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--cubepay-green-glow)) 0%, hsl(var(--cubepay-green)) 50%, hsl(var(--cubepay-green-light)) 100%)",
                      boxShadow:
                        "0 8px 32px hsla(var(--cubepay-green), 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)",
                    }}
                  >
                    <img
                      src={cubePayLogo}
                      alt="CubePay Logo"
                      className="h-6 w-6"
                    />
                    <span className="relative z-10">Continue to Payment</span>
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                      style={{ transform: "skewX(-20deg)" }}
                    />
                  </button>
                </form>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p className="text-muted-foreground">
                    {shippingAddress.email}
                  </p>
                  <p className="text-muted-foreground">
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 &&
                      `, ${shippingAddress.addressLine2}`}
                  </p>
                  <p className="text-muted-foreground">
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.zipCode}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("shipping")}
                    className="mt-2"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            {(step === "payment" || step === "review") && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  2. Payment Method
                </h2>

                {step === "payment" ? (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <div className="flex items-center space-x-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
                        <RadioGroupItem value="cubepay" id="cubepay" />
                        <Label
                          htmlFor="cubepay"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 rounded bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                CUBE
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">
                                CubePay Payment Gate
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Pay with your virtual terminal
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 rounded-lg border-2 p-4 opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex-1">
                          <div>
                            <p className="font-semibold">Credit Card</p>
                            <p className="text-sm text-muted-foreground">
                              Coming soon
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 rounded-lg border-2 p-4 opacity-50">
                        <RadioGroupItem value="crypto" id="crypto" disabled />
                        <Label htmlFor="crypto" className="flex-1">
                          <div>
                            <p className="font-semibold">Crypto Direct</p>
                            <p className="text-sm text-muted-foreground">
                              Coming soon
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Don't have CubePay?</strong> Merchants can
                        onboard you to crypto payments instantly!
                        <br />
                        <strong>Prefer traditional payment?</strong> Request
                        merchant to accept cards!
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" size="lg" className="w-full">
                      Review Order
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          CUBE
                        </span>
                      </div>
                      <p className="font-medium">CubePay Payment Gate</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep("payment")}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === "review" && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  3. Review & Confirm
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.color}-${item.size}`}
                          className="flex items-center gap-4 text-sm"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-muted-foreground">
                              {item.color} • {item.size} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              showCheckout={false}
            />
          </div>
        </div>
      </div>

      {/* Secured by CubePay Badge - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:block">
        <img
          src={trustBadge}
          alt="Secured by CubePay Gate"
          className="h-32 w-32 drop-shadow-2xl animate-fade-in"
        />
      </div>
    </div>
  );
};

export default Checkout;
