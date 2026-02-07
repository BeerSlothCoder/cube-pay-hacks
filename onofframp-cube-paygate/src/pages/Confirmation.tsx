import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircle, ExternalLink, Twitter, Copy } from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import toast from "react-hot-toast";

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, addTransaction } = useStore();

  const orderId = location.state?.orderId;
  const success = location.state?.success;
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!order || !success) {
      navigate("/buy");
      return;
    }

    // Add transaction to history
    const transaction = {
      id: `tx_${Date.now()}`,
      type: order.type,
      crypto: order.crypto,
      amount: order.cryptoAmount,
      fiatAmount: order.fiatAmount,
      status: "completed" as const,
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      orderId: order.id,
    };

    addTransaction(transaction);
  }, [order, success, navigate, addTransaction]);

  const handleCopyTxHash = () => {
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    navigator.clipboard.writeText(txHash);
    toast.success("Transaction hash copied!");
  };

  const handleShareTwitter = () => {
    const text = `Just bought ${formatCrypto(
      order?.cryptoAmount || 0,
      order?.crypto.symbol || "",
      8
    )} on @CubePayExchange! 🚀 #crypto #bitcoin #ethereum`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  if (!order || !success) {
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

  const totalPaid = order.fiatAmount + order.fees.network + order.fees.service;
  const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {order.type === "buy" ? "Purchase Successful!" : "Sale Successful!"}
          </h1>
          <p className="text-xl text-text-secondary">
            {order.type === "buy"
              ? "Your crypto is on the way"
              : "Your money is on the way"}
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Order number:</span>
                  <span className="font-semibold">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Date:</span>
                  <span className="font-semibold">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cryptocurrency:</span>
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">{order.crypto.logo}</span>
                    <span className="font-semibold">
                      {order.crypto.name} ({order.crypto.symbol})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Amount {order.type === "buy" ? "purchased" : "sold"}:
                  </span>
                  <span className="font-semibold">
                    {formatCrypto(order.cryptoAmount, order.crypto.symbol, 8)}
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    {order.type === "buy" ? "Total paid:" : "You received:"}
                  </span>
                  <span className="font-semibold text-lg">
                    {order.type === "buy"
                      ? formatCurrency(totalPaid)
                      : formatCurrency(
                          order.fiatAmount -
                            order.fees.network -
                            order.fees.service
                        )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Payment method:</span>
                  <span className="font-semibold">
                    {order.paymentMethod.name}
                  </span>
                </div>
                {order.type === "buy" ? (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      Delivery address:
                    </span>
                    <span className="font-semibold">
                      Your wallet ({order.deliveryAddress?.slice(0, 6)}...
                      {order.deliveryAddress?.slice(-4)})
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Payout method:</span>
                    <span className="font-semibold">
                      {order.payoutMethod?.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-secondary">Transaction hash:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {mockTxHash.slice(0, 10)}...{mockTxHash.slice(-8)}
                    </span>
                    <button
                      onClick={handleCopyTxHash}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${mockTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-semibold text-success">
                      Completed
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mb-8">
          <CardContent>
            <div className="text-center py-6">
              {order.type === "buy" ? (
                <>
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Your crypto has been sent to your wallet
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Transaction confirmed on blockchain
                  </p>
                  <div className="bg-success/10 text-success px-4 py-2 rounded-lg inline-block">
                    Already in your wallet!
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    Your sale has been processed
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Funds will arrive in your{" "}
                    {order.payoutMethod?.name.toLowerCase()}
                  </p>
                  <div className="bg-warning/10 text-warning px-4 py-2 rounded-lg inline-block">
                    Estimated arrival: {order.payoutMethod?.estimatedTime}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <a
                href="http://localhost:5173/ar-view?source=onramp"
                className="block"
              >
                <Button
                  variant="primary"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className="text-lg">🎯</div>
                  <span>Return to AR Viewer</span>
                </Button>
              </a>

              <Link to="/transactions">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className="text-lg">📊</div>
                  <span>View Transaction</span>
                </Button>
              </Link>

              <Link to={order.type === "buy" ? "/buy" : "/sell"}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className="text-lg">
                    {order.type === "buy" ? "💰" : "💸"}
                  </div>
                  <span>
                    {order.type === "buy"
                      ? "Buy More Crypto"
                      : "Sell More Crypto"}
                  </span>
                </Button>
              </Link>

              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                >
                  <div className="text-lg">📈</div>
                  <span>Go to Dashboard</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={handleShareTwitter}
                className="w-full h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Twitter className="w-5 h-5" />
                <span>Share on Twitter</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-text-secondary mb-4">
            Need help? Our support team is here 24/7
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="outline" size="sm">
              Help Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
