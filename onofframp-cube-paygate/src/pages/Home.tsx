import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  Headphones,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Box,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatPercentage } from "../lib/utils";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Home() {
  const { cryptocurrencies } = useStore();
  const [selectedCrypto, setSelectedCrypto] = useState(cryptocurrencies[0]);
  const [amount, setAmount] = useState("100");

  const topCryptos = cryptocurrencies.slice(0, 6);

  const stats = [
    { label: "$10M+ Traded", value: "$10M+" },
    { label: "100K+ Users", value: "100K+" },
    { label: "50+ Countries", value: "50+" },
    { label: "99.9% Uptime", value: "99.9%" },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Setup",
      description: "No verification delays",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your own virtual terminal",
    },
    {
      icon: DollarSign,
      title: "Best Rates",
      description: "Competitive pricing",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Always here to help",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Connect or Create Wallet",
      description:
        "Sign in with wallet or social account. New? We'll create one for you.",
      icon: "🔗",
    },
    {
      number: 2,
      title: "Choose Amount",
      description:
        "Select cryptocurrency and enter amount. See real-time pricing.",
      icon: "💰",
    },
    {
      number: 3,
      title: "Complete Purchase",
      description: "Pay securely with card via your CubePay virtual terminal.",
      icon: "✅",
    },
  ];

  const recentTransactions = [
    { user: "***1234", action: "bought 0.05 BTC", time: "2 minutes ago" },
    { user: "***5678", action: "bought 500 USDC", time: "5 minutes ago" },
    { user: "***9012", action: "bought 2.5 ETH", time: "8 minutes ago" },
    { user: "***3456", action: "bought 100 SOL", time: "12 minutes ago" },
  ];

  const cryptoAmount = selectedCrypto
    ? parseFloat(amount) / selectedCrypto.price
    : 0;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-cube-green rounded-lg rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-cube-green rounded-lg -rotate-12"></div>
          <div className="absolute bottom-32 left-1/3 w-20 h-20 border border-cube-green rounded-lg rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cube-green bg-clip-text text-transparent">
                Buy Crypto in Seconds
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                The easiest way to buy, sell, and manage cryptocurrency with
                CubePay's secure payment gateway
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="w-4 h-4 text-cube-green" />
                  <span>Trusted by 100K+ users</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Headphones className="w-4 h-4 text-cube-green" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Shield className="w-4 h-4 text-cube-green" />
                  <span>Bank-level security</span>
                </div>
              </div>

              <Link to="/buy">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cube-green to-cube-glow text-white hover:from-cube-glow hover:to-cube-green shadow-lg shadow-cube-green/25"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Quick Buy Widget */}
            <Card className="bg-dark-card/80 backdrop-blur-sm border border-cube-green/30 shadow-xl shadow-cube-green/10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Quick Buy
                </h3>

                {/* Crypto Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    I want to buy
                  </label>
                  <select
                    value={selectedCrypto?.id || ""}
                    onChange={(e) =>
                      setSelectedCrypto(
                        cryptocurrencies.find((c) => c.id === e.target.value)
                      )
                    }
                    className="w-full bg-dark-bg border border-cube-green/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cube-green/50"
                  >
                    {topCryptos.map((crypto) => (
                      <option
                        key={crypto.id}
                        value={crypto.id}
                        className="bg-dark-bg text-white"
                      >
                        {crypto.name} ({crypto.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-dark-bg border border-cube-green/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cube-green/50"
                    placeholder="100"
                  />
                </div>

                {/* Live Price Display */}
                {selectedCrypto && (
                  <div className="mb-6 p-4 bg-dark-bg/50 border border-cube-green/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">
                        You will receive:
                      </span>
                      <span className="font-semibold text-cube-green">
                        ~{cryptoAmount.toFixed(8)} {selectedCrypto.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <span>Price per {selectedCrypto.symbol}:</span>
                      <span className="text-white">
                        {formatCurrency(selectedCrypto.price)}
                      </span>
                    </div>
                  </div>
                )}

                <Link to="/buy" className="block">
                  <Button className="w-full bg-gradient-to-r from-cube-green to-cube-glow hover:from-cube-glow hover:to-cube-green shadow-lg shadow-cube-green/25">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Cryptocurrencies */}
      <section className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Supported Cryptocurrencies
            </h2>
            <p className="text-gray-300">
              Trade the most popular cryptocurrencies with real-time pricing
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {topCryptos.map((crypto) => (
              <Card
                key={crypto.id}
                hover
                className="text-center group bg-dark-bg border-cube-green/20 hover:border-cube-green/40"
              >
                <div className="text-3xl mb-3">{crypto.logo}</div>
                <h3 className="font-semibold text-white mb-1">{crypto.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{crypto.symbol}</p>
                <p className="font-semibold text-cube-green mb-1">
                  {formatCurrency(crypto.price)}
                </p>
                <p
                  className={`text-sm ${
                    crypto.change24h >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  {formatPercentage(crypto.change24h)}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to="/buy">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-cube-green to-cube-glow"
                    >
                      Buy Now
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-300">
              Get started with crypto in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cube-green to-cube-glow rounded-full flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg shadow-cube-green/25">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CubePay Exchange */}
      <section className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why CubePay Exchange
            </h2>
            <p className="text-gray-300">
              The most secure and user-friendly way to trade crypto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="text-center bg-dark-bg border-cube-green/20 hover:border-cube-green/40"
              >
                <feature.icon className="w-12 h-12 text-cube-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-cube-green mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-16 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Recent Transactions
            </h2>
            <p className="text-gray-300">
              See what others are buying right now
            </p>
          </div>

          <Card className="max-w-2xl mx-auto bg-dark-bg border-cube-green/20">
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-cube-green/10 last:border-b-0"
                >
                  <span className="text-white">
                    User {tx.user} {tx.action}
                  </span>
                  <span className="text-gray-400 text-sm">{tx.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cube-green to-cube-glow text-white relative overflow-hidden">
        {/* CubePay Logo Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20">
            <Box className="w-24 h-24 rotate-12" />
          </div>
          <div className="absolute bottom-10 left-20">
            <Box className="w-32 h-32 -rotate-12" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of users buying crypto the easy way with CubePay
          </p>
          <Link to="/buy">
            <Button
              size="lg"
              className="bg-white text-cube-green hover:bg-gray-100 shadow-lg"
            >
              Buy Crypto Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
