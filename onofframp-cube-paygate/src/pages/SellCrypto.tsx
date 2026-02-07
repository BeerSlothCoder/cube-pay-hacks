import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock,
  Shield,
  CreditCard,
  Wallet,
  AlertCircle,
  Landmark,
  DollarSign,
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

export default function SellCrypto() {
  const navigate = useNavigate();
  const {
    holdings,
    selectedCrypto,
    setSelectedCrypto,
    sellAmount,
    setSellAmount,
    sellMode,
    setSellMode,
    addOrder,
  } = useStore();

  const [step, setStep] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [bankDetails, setBankDetails] = useState({
    fullName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [priceCountdown, setPriceCountdown] = useState(600);

  const networkFee = 15.5;
  const serviceFeeRate = 0.025; // 2.5%

  const selectedHolding = holdings.find(
    (h) => h.crypto.id === selectedCrypto?.id
  );
  const maxAmount = selectedHolding?.amount || 0;

  const cryptoAmount = sellMode === "crypto" ? sellAmount : 0;
  const fiatAmount =
    selectedCrypto && sellMode === "crypto"
      ? sellAmount * selectedCrypto.price
      : sellAmount;

  const serviceFee = fiatAmount * serviceFeeRate;
  const youReceive = Math.max(0, fiatAmount - networkFee - serviceFee);

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

  const quickPercentages = [25, 50, 75, 100];

  const handleCryptoSelect = (holding: any) => {
    setSelectedCrypto(holding.crypto);
    setStep(2);
  };

  const handlePercentageSelect = (percentage: number) => {
    const amount = (maxAmount * percentage) / 100;
    setSellAmount(amount);
  };

  const handleSellNow = () => {
    if (!selectedCrypto || !agreedToTerms) return;

    const order = {
      id: generateOrderId(),
      type: "sell" as const,
      crypto: selectedCrypto,
      cryptoAmount,
      fiatAmount,
      price: selectedCrypto.price,
      status: "pending" as const,
      paymentMethod: {
        type: "bank" as const,
        name: "Bank Account",
      },
      payoutMethod: {
        type: payoutMethod as any,
        name: payoutMethod === "bank" ? "Bank Account" : "CubePay Virtual Card",
        details:
          payoutMethod === "bank"
            ? `***${bankDetails.accountNumber.slice(-4)}`
            : "Virtual Card",
        estimatedTime:
          payoutMethod === "bank" ? "1-3 business days" : "Instant",
      },
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Sell Cryptocurrency
          </h1>
          <p className="text-text-secondary">
            Convert your crypto to fiat currency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Cryptocurrency to Sell */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      step >= 1 ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span>Select Cryptocurrency to Sell</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {holdings.map((holding) => (
                      <div
                        key={holding.crypto.id}
                        onClick={() => handleCryptoSelect(holding)}
                        className={`crypto-card p-4 ${
                          selectedCrypto?.id === holding.crypto.id
                            ? "selected"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">
                            {holding.crypto.logo}
                          </span>
                          <div>
                            <div className="font-semibold">
                              {holding.crypto.symbol}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {holding.crypto.name}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Balance:</span>
                            <span className="font-semibold">
                              {formatCrypto(
                                holding.amount,
                                holding.crypto.symbol,
                                8
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Current Price:</span>
                            <span>{formatCurrency(holding.crypto.price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>USD Value:</span>
                            <span className="font-semibold">
                              {formatCurrency(holding.value)}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3">
                          Sell
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      No crypto to sell
                    </h3>
                    <p className="text-text-secondary mb-6">
                      You don't have any cryptocurrency yet. Buy some first!
                    </p>
                    <Button onClick={() => navigate("/buy")}>Buy Crypto</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Enter Amount to Sell */}
            {selectedCrypto && selectedHolding && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        step >= 2 ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span>Enter Amount to Sell</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setSellMode("crypto")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        sellMode === "crypto"
                          ? "bg-white text-primary shadow-sm"
                          : "text-text-secondary"
                      }`}
                    >
                      I want to sell ({selectedCrypto.symbol})
                    </button>
                    <button
                      onClick={() => setSellMode("fiat")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        sellMode === "fiat"
                          ? "bg-white text-primary shadow-sm"
                          : "text-text-secondary"
                      }`}
                    >
                      I want to receive (USD)
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-6">
                    <Input
                      type="number"
                      value={sellAmount}
                      onChange={(e) =>
                        setSellAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder={sellMode === "crypto" ? "0.001" : "100"}
                      className="text-lg font-semibold"
                      helperText={`Max: ${formatCrypto(
                        maxAmount,
                        selectedCrypto.symbol,
                        8
                      )}`}
                    />

                    {/* Quick Percentage Buttons */}
                    {sellMode === "crypto" && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {quickPercentages.map((percentage) => (
                          <button
                            key={percentage}
                            onClick={() => handlePercentageSelect(percentage)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            {percentage}%{percentage === 100 && " (Max)"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Conversion Display */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">
                        {sellMode === "crypto"
                          ? "You will receive:"
                          : "You will sell:"}
                      </span>
                      <span className="font-semibold text-lg text-success">
                        {sellMode === "crypto"
                          ? formatCurrency(fiatAmount)
                          : `~${formatCrypto(
                              cryptoAmount,
                              selectedCrypto.symbol,
                              8
                            )}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-text-secondary">
                      <span>Price per {selectedCrypto.symbol}:</span>
                      <span>{formatCurrency(selectedCrypto.price)}</span>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(fiatAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network fee:</span>
                      <span>-{formatCurrency(networkFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee (2.5%):</span>
                      <span>-{formatCurrency(serviceFee)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg text-success">
                      <span>You receive:</span>
                      <span>{formatCurrency(youReceive)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    className="w-full mt-6"
                    disabled={
                      !sellAmount || sellAmount <= 0 || sellAmount > maxAmount
                    }
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payout Method */}
            {step >= 3 && selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        step >= 3 ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      {step > 3 ? <Check className="w-4 h-4" /> : "3"}
                    </div>
                    <span>Payout Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {/* Bank Account */}
                    <div
                      onClick={() => setPayoutMethod("bank")}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        payoutMethod === "bank"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Landmark className="w-8 h-8 text-primary" />
                        <div>
                          <div className="font-semibold">
                            Bank Account (ACH)
                          </div>
                          <div className="text-sm text-text-secondary">
                            1-3 business days
                          </div>
                        </div>
                        {payoutMethod === "bank" && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        Receive funds directly to your bank account
                      </p>
                    </div>

                    {/* CubePay Virtual Card */}
                    <div
                      onClick={() => setPayoutMethod("cubepay")}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        payoutMethod === "cubepay"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <CreditCard className="w-8 h-8 text-primary" />
                        <div>
                          <div className="font-semibold">
                            CubePay Virtual Card
                          </div>
                          <div className="text-sm text-success">Instant</div>
                        </div>
                        {payoutMethod === "cubepay" && (
                          <div className="ml-auto">
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary">
                        Receive to your CubePay virtual card - use anywhere
                        cards are accepted
                      </p>
                    </div>
                  </div>

                  {/* Bank Account Form */}
                  {payoutMethod === "bank" && (
                    <div className="space-y-4 mb-6">
                      <Input
                        label="Full Name"
                        value={bankDetails.fullName}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                      />
                      <Input
                        label="Bank Name"
                        value={bankDetails.bankName}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            bankName: e.target.value,
                          })
                        }
                        placeholder="Chase Bank"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Account Number"
                          value={bankDetails.accountNumber}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              accountNumber: e.target.value,
                            })
                          }
                          placeholder="1234567890"
                        />
                        <Input
                          label="Routing Number"
                          value={bankDetails.routingNumber}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              routingNumber: e.target.value,
                            })
                          }
                          placeholder="021000021"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Account Type
                        </label>
                        <select
                          value={bankDetails.accountType}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              accountType: e.target.value,
                            })
                          }
                          className="input-field"
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(4)}
                    className="w-full"
                    disabled={
                      payoutMethod === "bank" &&
                      (!bankDetails.fullName ||
                        !bankDetails.accountNumber ||
                        !bankDetails.routingNumber)
                    }
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Confirm */}
            {step >= 4 && selectedCrypto && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-primary">
                      4
                    </div>
                    <span>Review & Confirm</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Cryptocurrency:</span>
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">{selectedCrypto.logo}</span>
                        <span>
                          {selectedCrypto.name} ({selectedCrypto.symbol})
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount selling:</span>
                      <span>
                        {formatCrypto(cryptoAmount, selectedCrypto.symbol, 8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span>
                        {formatCurrency(selectedCrypto.price)} per{" "}
                        {selectedCrypto.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payout method:</span>
                      <span>
                        {payoutMethod === "bank"
                          ? `Bank Account (***${bankDetails.accountNumber.slice(
                              -4
                            )})`
                          : "CubePay Virtual Card"}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg text-success">
                      <span>You receive:</span>
                      <span>{formatCurrency(youReceive)}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important Notes:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Crypto transactions are irreversible</li>
                          <li>
                            • Funds will arrive in{" "}
                            {payoutMethod === "bank"
                              ? "1-3 business days"
                              : "minutes"}
                          </li>
                          <li>• Your bank details are encrypted and secure</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start space-x-2 mb-6">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-text-secondary">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and understand that crypto transactions are irreversible
                    </span>
                  </label>

                  <Button
                    onClick={handleSellNow}
                    disabled={!agreedToTerms}
                    className="w-full"
                    size="lg"
                    variant="danger"
                  >
                    Sell Now
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
                  <CardTitle>Sell Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCrypto && selectedHolding ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{selectedCrypto.logo}</span>
                        <div>
                          <div className="font-semibold">
                            {selectedCrypto.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {selectedCrypto.symbol}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Your balance:</span>
                          <span>
                            {formatCrypto(maxAmount, selectedCrypto.symbol, 8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount selling:</span>
                          <span>
                            {formatCrypto(
                              cryptoAmount,
                              selectedCrypto.symbol,
                              8
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span>{formatCurrency(selectedCrypto.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(fiatAmount)}</span>
                        </div>
                        <div className="flex justify-between text-error">
                          <span>Network fee:</span>
                          <span>-{formatCurrency(networkFee)}</span>
                        </div>
                        <div className="flex justify-between text-error">
                          <span>Service fee:</span>
                          <span>-{formatCurrency(serviceFee)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-semibold text-lg text-success">
                          <span>You receive:</span>
                          <span>{formatCurrency(youReceive)}</span>
                        </div>
                      </div>

                      <div className="text-center text-sm text-text-secondary">
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Estimated arrival:{" "}
                            {payoutMethod === "bank"
                              ? "1-3 business days"
                              : "Instant"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          <span>Price locked for:</span>
                          <span className="font-semibold text-primary">
                            {formatTime(priceCountdown)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-text-secondary py-8">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a cryptocurrency to see sell summary</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
