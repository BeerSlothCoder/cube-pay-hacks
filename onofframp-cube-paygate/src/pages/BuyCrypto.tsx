import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  Shield,
  CreditCard,
  Wallet,
  AlertCircle,
  Box,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto, generateOrderId } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function BuyCrypto() {
  const navigate = useNavigate();
  const {
    cryptocurrencies,
    selectedCrypto,
    setSelectedCrypto,
    buyAmount,
    setBuyAmount,
    buyMode,
    setBuyMode,
    addOrder,
  } = useStore();

  const [step, setStep] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(
    "0x742d35Cc6634C0532925a3b8D4C9db96590c4"
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [priceCountdown, setPriceCountdown] = useState(600); // 10 minutes

  const topCryptos = cryptocurrencies.slice(0, 8);
  const networkFee = 15.5;
  const serviceFeeRate = 0.025; // 2.5%

  const cryptoAmount =
    selectedCrypto && buyMode === "fiat"
      ? buyAmount / selectedCrypto.price
      : buyAmount;

  const fiatAmount =
    selectedCrypto && buyMode === "crypto"
      ? buyAmount * selectedCrypto.price
      : buyAmount;

  const serviceFee = fiatAmount * serviceFeeRate;
  const totalAmount = fiatAmount + networkFee + serviceFee;

  // Price countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPriceCountdown((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleCryptoSelect = (crypto: any) => {
    setSelectedCrypto(crypto);
    setStep(2);
  };

  const handleBuyNow = () => {
    if (!selectedCrypto || !agreedToTerms) return;

    const order = {
      id: generateOrderId(),
      type: "buy" as const,
      crypto: selectedCrypto,
      cryptoAmount,
      fiatAmount,
      price: selectedCrypto.price,
      status: "pending" as const,
      paymentMethod: {
        type: "cubepay" as const,
        name: "CubePay Virtual Terminal",
      },
      deliveryAddress,
      timestamp: new Date(),
      fees: {
        network: networkFee,
        service: serviceFee,
      },
    };

    addOrder(order);
    navigate("/checkout", { state: { orderId: order.id } });
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Buy Cryptocurrency
          </h1>
          <p className="text-gray-300">
            Purchase crypto with your CubePay virtual terminal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Cryptocurrency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      step >= 1
                        ? "bg-gradient-to-r from-cube-green to-cube-glow shadow-lg shadow-cube-green/25"
                        : "bg-gray-600"
                    }`}
                  >
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span>Select Cryptocurrency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {topCryptos.map((crypto) => (
                    <div
                      key={crypto.id}
                      onClick={() => handleCryptoSelect(crypto)}
                      className={`p-4 text-center rounded-lg border-2 transition-all duration-200 cursor-pointer hover:border-cube-green/40 ${
                        selectedCrypto?.id === crypto.id
                          ? "border-cube-green bg-cube-green/10"
                          : "border-cube-green/20 bg-dark-bg hover:bg-dark-card"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        <img
                          src={crypto.logo}
                          alt={crypto.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%2300ff66"/></svg>';
                          }}
                        />
                      </div>
                      <div className="font-semibold text-sm text-white">
                        {crypto.symbol}
                      </div>
                      <div className="text-xs text-gray-400">{crypto.name}</div>
                      <div className="text-sm font-medium mt-2 text-cube-green">
                        {formatCurrency(crypto.price)}
                      </div>
                      <div
                        className={`text-xs ${
                          crypto.change24h >= 0 ? "text-success" : "text-error"
                        }`}
                      >
                        {crypto.change24h >= 0 ? "+" : ""}
                        {crypto.change24h.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Enter Amount */}
            {selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        step >= 2
                          ? "bg-gradient-to-r from-cube-green to-cube-glow shadow-lg shadow-cube-green/25"
                          : "bg-gray-600"
                      }`}
                    >
                      {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span>Enter Amount</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mode Toggle */}
                  <div className="flex bg-dark-bg rounded-lg p-1 mb-6 border border-cube-green/20">
                    <button
                      onClick={() => setBuyMode("fiat")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        buyMode === "fiat"
                          ? "bg-gradient-to-r from-cube-green to-cube-glow text-white shadow-lg shadow-cube-green/25"
                          : "text-gray-300 hover:text-cube-green"
                      }`}
                    >
                      I want to spend (USD)
                    </button>
                    <button
                      onClick={() => setBuyMode("crypto")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        buyMode === "crypto"
                          ? "bg-gradient-to-r from-cube-green to-cube-glow text-white shadow-lg shadow-cube-green/25"
                          : "text-gray-300 hover:text-cube-green"
                      }`}
                    >
                      I want to buy ({selectedCrypto.symbol})
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-6">
                    <Input
                      type="number"
                      value={buyAmount}
                      onChange={(e) =>
                        setBuyAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder={buyMode === "fiat" ? "100" : "0.001"}
                      className="text-lg font-semibold"
                    />

                    {/* Quick Amount Buttons */}
                    {buyMode === "fiat" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {quickAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setBuyAmount(amount)}
                            className="px-3 py-1 bg-dark-card hover:bg-cube-green/20 border border-cube-green/30 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:text-cube-green"
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversion Display */}
                  <div className="bg-dark-bg/50 border border-cube-green/20 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        {buyMode === "fiat"
                          ? "You will receive:"
                          : "You will pay:"}
                      </span>
                      <span className="font-semibold text-lg text-cube-green">
                        {buyMode === "fiat"
                          ? `~${formatCrypto(
                              cryptoAmount,
                              selectedCrypto.symbol,
                              8
                            )}`
                          : formatCurrency(fiatAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                      <span>Price per {selectedCrypto.symbol}:</span>
                      <span className="text-white">
                        {formatCurrency(selectedCrypto.price)}
                      </span>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(fiatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Network fee:</span>
                      <span>{formatCurrency(networkFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Service fee (2.5%):</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                    <hr className="border-cube-green/20" />
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total:</span>
                      <span className="text-cube-green">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    className="w-full mt-6"
                    disabled={!buyAmount || buyAmount <= 0}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Delivery Address */}
            {step >= 3 && selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        step >= 3
                          ? "bg-gradient-to-r from-cube-green to-cube-glow shadow-lg shadow-cube-green/25"
                          : "bg-gray-600"
                      }`}
                    >
                      {step > 3 ? <Check className="w-4 h-4" /> : "3"}
                    </div>
                    <span>Delivery Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="flex items-center space-x-2 mb-4 text-gray-300">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="text-cube-green focus:ring-cube-green"
                      />
                      <span>Send to my wallet</span>
                    </label>
                  </div>

                  <Input
                    label="Wallet Address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="0x..."
                    helperText="Your crypto will be sent to this address"
                  />

                  <Button
                    onClick={() => setStep(4)}
                    className="w-full mt-6"
                    disabled={!deliveryAddress}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment Method */}
            {step >= 4 && selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        step >= 4
                          ? "bg-gradient-to-r from-cube-green to-cube-glow shadow-lg shadow-cube-green/25"
                          : "bg-gray-600"
                      }`}
                    >
                      {step > 4 ? <Check className="w-4 h-4" /> : "4"}
                    </div>
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* CubePay Virtual Terminal */}
                    <div className="border-2 border-cube-green bg-cube-green/10 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cube-green to-cube-glow rounded-lg flex items-center justify-center shadow-lg shadow-cube-green/25">
                          <Box className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-cube-green">
                            CubePay Virtual Terminal
                          </div>
                          <div className="text-sm text-gray-400">
                            Recommended - Most secure option
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="w-4 h-4 bg-cube-green rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">
                        Pay with your secure virtual terminal. You control the
                        payment environment.
                      </p>
                    </div>

                    {/* Other Payment Methods (Disabled) */}
                    <div className="border border-gray-600 bg-gray-800/50 rounded-lg p-4 opacity-50">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-gray-500" />
                        <div>
                          <div className="font-semibold text-gray-500">
                            Credit/Debit Card
                          </div>
                          <div className="text-sm text-gray-500">
                            Coming soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-cube-green/10 border border-cube-green/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-cube-green mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <strong className="text-cube-green">
                          New to CubePay?
                        </strong>{" "}
                        Your virtual terminal will be created automatically!
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setStep(5)} className="w-full mt-6">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review & Confirm */}
            {step >= 5 && selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-cube-green to-cube-glow shadow-lg shadow-cube-green/25">
                      5
                    </div>
                    <span>Review & Confirm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-300">
                      <span>Cryptocurrency:</span>
                      <span className="flex items-center space-x-2 text-white">
                        <img
                          src={selectedCrypto.logo}
                          alt={selectedCrypto.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="%2310b981"/></svg>';
                          }}
                        />
                        <span>
                          {selectedCrypto.name} ({selectedCrypto.symbol})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Amount:</span>
                      <span className="text-cube-green">
                        {formatCrypto(cryptoAmount, selectedCrypto.symbol, 8)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Price:</span>
                      <span className="text-white">
                        {formatCurrency(selectedCrypto.price)} per{" "}
                        {selectedCrypto.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Delivery:</span>
                      <span className="text-white">
                        Your wallet ({deliveryAddress.slice(0, 6)}...
                        {deliveryAddress.slice(-4)})
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Payment:</span>
                      <span className="text-cube-green">
                        CubePay Virtual Terminal
                      </span>
                    </div>
                    <hr className="border-cube-green/20" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-white">Total:</span>
                      <span className="text-cube-green">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <label className="flex items-start space-x-2 mb-6">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 text-cube-green focus:ring-cube-green"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{" "}
                      <a href="#" className="text-cube-green hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-cube-green hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <Button
                    onClick={handleBuyNow}
                    disabled={!agreedToTerms}
                    className="w-full"
                    size="lg"
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCrypto ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedCrypto.logo}
                          alt={selectedCrypto.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="14" fill="%2310b981"/></svg>';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-white">
                            {selectedCrypto.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {selectedCrypto.symbol}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Amount:</span>
                          <span className="text-cube-green">
                            {formatCrypto(
                              cryptoAmount,
                              selectedCrypto.symbol,
                              8
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Price:</span>
                          <span className="text-white">
                            {formatCurrency(selectedCrypto.price)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Subtotal:</span>
                          <span className="text-white">
                            {formatCurrency(fiatAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Network fee:</span>
                          <span className="text-white">
                            {formatCurrency(networkFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Service fee:</span>
                          <span className="text-white">
                            {formatCurrency(serviceFee)}
                          </span>
                        </div>
                        <hr className="border-cube-green/20" />
                        <div className="flex justify-between font-semibold text-lg">
                          <span className="text-white">Total:</span>
                          <span className="text-cube-green">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-300">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Clock className="w-4 h-4 text-cube-green" />
                          <span>Estimated arrival: Instant</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span>Price locked for:</span>
                          <span className="font-semibold text-cube-green">
                            {formatTime(priceCountdown)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a cryptocurrency to see order summary</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card className="mt-6">
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-cube-green" />
                      <span className="text-gray-300">
                        Bank-level encryption
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-cube-green" />
                      <span className="text-gray-300">Instant delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-cube-green" />
                      <span className="text-gray-300">Secure payments</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-cube-green" />
                      <span className="text-gray-300">
                        100% satisfaction guarantee
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <div className="mt-6 text-center">
                <button className="text-cube-green hover:text-cube-glow text-sm font-medium">
                  Need help? Chat with us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
