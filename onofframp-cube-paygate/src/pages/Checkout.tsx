import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  Shield,
  CreditCard,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import PaymentTerminalSelector from "../components/PaymentTerminalSelector";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useStore();

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showTerminalSelector, setShowTerminalSelector] = useState(false);

  const orderId = location.state?.orderId;
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!order) {
      navigate("/buy");
      return;
    }

    // Simulate order processing
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [order, navigate]);

  useEffect(() => {
    if (!loading && !redirecting) {
      // Start redirect countdown after loading is complete
      const timer = setTimeout(() => {
        setRedirecting(true);
        startRedirectCountdown();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, redirecting]);

  const startRedirectCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirectToPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRedirectToPayment = () => {
    // Safety check - ensure order exists
    if (!order) {
      navigate("/buy");
      return;
    }

    // Prepare payment data for AR Viewer
    const paymentData = {
      orderId: order.id,
      amount: order.fiatAmount + order.fees.network + order.fees.service,
      currency: "USD",
      items: [
        {
          name: `${order.crypto.name} (${order.crypto.symbol})`,
          quantity: order.cryptoAmount,
          price: order.fiatAmount,
        },
        {
          name: "Network Fee",
          quantity: 1,
          price: order.fees.network,
        },
        {
          name: "Service Fee",
          quantity: 1,
          price: order.fees.service,
        },
      ],
      merchantName: "CubePay Exchange",
      redirectUrl: `http://localhost:5176/confirmation?order_id=${order.id}`,
      type: "onofframp",
      crypto: order.crypto.symbol,
      cryptoAmount: order.cryptoAmount,
    };

    // Encode payment data
    const encodedData = btoa(JSON.stringify(paymentData));

    // Redirect to AR Viewer with payment terminal
    window.location.href = `http://localhost:5176/ar-view?filter=myPaymentTerminals&data=${encodedData}`;
  };

  const handleSimulatePayment = () => {
    setRedirecting(true);
    // Redirect to AR Viewer virtual terminal immediately
    handleRedirectToPayment();
  };

  const handleCancelOrder = () => {
    navigate("/buy");
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-text-secondary">Order not found</p>
              <Button onClick={() => navigate("/buy")} className="mt-4">
                Back to Buy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          /* Loading State */
          <Card>
            <CardContent>
              <div className="text-center py-16">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Processing your order...
                </h2>
                <p className="text-text-secondary mb-4">
                  Please don't close this window
                </p>
                <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Shield className="w-4 h-4" />
                    <span>
                      Your transaction is secured with bank-level encryption
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : redirecting ? (
          /* Redirect State */
          <Card>
            <CardContent>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  🎯 Redirecting to Your Virtual Terminal
                </h2>
                <div className="max-w-md mx-auto space-y-4 mb-8">
                  <div className="bg-gray-100 rounded-lg p-4 text-left">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Order ID:</span>
                        <span className="font-semibold">#{order.id?.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Amount:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            order.fiatAmount +
                              order.fees.network +
                              order.fees.service,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Cryptocurrency:
                        </span>
                        <span className="font-semibold">USDC</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-secondary">
                    Your payment will be processed securely through your
                    personal CubePay virtual terminal.
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    Redirecting in {countdown}...
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <div className="flex items-center space-x-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <CreditCard className="w-4 h-4" />
                    <span>Your Terminal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Order Created State */
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-success" />
                  <span>Order Created Successfully</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Order Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Order ID:</span>
                        <span className="font-semibold">#{order.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Date:</span>
                        <span className="font-semibold">
                          {order.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Cryptocurrency:
                        </span>
                        <span className="flex items-center space-x-2">
                          <span className="text-lg">{order.crypto.logo}</span>
                          <span className="font-semibold">
                            {order.crypto.name} ({order.crypto.symbol})
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Amount:</span>
                        <span className="font-semibold">
                          {formatCrypto(
                            order.cryptoAmount,
                            order.crypto.symbol,
                            8,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Price per {order.crypto.symbol}:
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(order.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Delivery Address:
                        </span>
                        <span className="font-semibold">
                          {order.deliveryAddress?.slice(0, 6)}...
                          {order.deliveryAddress?.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Payment Method:
                        </span>
                        <span className="font-semibold">
                          {order.paymentMethod.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                      Payment Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal:</span>
                        <span>{formatCurrency(order.fiatAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Network fee:
                        </span>
                        <span>{formatCurrency(order.fees.network)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">
                          Service fee:
                        </span>
                        <span>{formatCurrency(order.fees.service)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(
                            order.fiatAmount +
                              order.fees.network +
                              order.fees.service,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Virtual Terminal Integration Point */}
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-4">
                    Virtual Terminal Integration Point
                  </h2>
                  <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-6 mb-6">
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Order ID:</span>
                        <span className="font-semibold">{order.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Amount:</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            order.fiatAmount +
                              order.fees.network +
                              order.fees.service,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Type:</span>
                        <span className="font-semibold">Crypto Purchase</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Crypto:</span>
                        <span className="font-semibold">
                          {order.crypto.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Quantity:</span>
                        <span className="font-semibold">
                          {formatCrypto(
                            order.cryptoAmount,
                            order.crypto.symbol,
                            8,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-secondary mb-6">
                    Choose a payment method using CubePay terminals
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowTerminalSelector(true)}
                      size="lg"
                      className="w-full max-w-xs"
                    >
                      Select Payment Terminal
                      <CreditCard className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSimulatePayment}
                      size="lg"
                      variant="outline"
                      className="w-full max-w-xs"
                      isLoading={redirecting}
                    >
                      {redirecting ? "Processing..." : "Use AR Viewer Terminal"}
                      {!redirecting && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={handleCancelOrder}
                      variant="outline"
                      size="lg"
                      className="w-full max-w-xs"
                      disabled={redirecting}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Terminal Selector Modal */}
      {showTerminalSelector && (
        <PaymentTerminalSelector
          amount={
            order
              ? order.fiatAmount + order.fees.network + order.fees.service
              : 0
          }
          currency="USD"
          onClose={() => setShowTerminalSelector(false)}
          onComplete={() => {
            setShowTerminalSelector(false);
            navigate("/confirmation", { state: { orderId: order?.id } });
          }}
        />
      )}
    </div>
  );
}
