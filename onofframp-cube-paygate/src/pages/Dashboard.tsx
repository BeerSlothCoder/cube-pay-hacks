import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Bell,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto, formatPercentage } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

export default function Dashboard() {
  const {
    holdings,
    totalPortfolioValue,
    portfolioChange24h,
    transactions,
    user,
  } = useStore();

  const recentTransactions = transactions.slice(0, 5);

  const portfolioData = holdings.map((holding, index) => ({
    name: holding.crypto.symbol,
    value: holding.value,
    color: ["#0066FF", "#764BA2", "#F7931A", "#627EEA", "#14F195"][index % 5],
  }));

  const mockPriceHistory = [
    { date: "10/10", value: totalPortfolioValue * 0.95 },
    { date: "10/11", value: totalPortfolioValue * 0.97 },
    { date: "10/12", value: totalPortfolioValue * 0.93 },
    { date: "10/13", value: totalPortfolioValue * 0.98 },
    { date: "10/14", value: totalPortfolioValue * 1.02 },
    { date: "10/15", value: totalPortfolioValue },
  ];

  const quickStats = [
    {
      label: "Total Invested",
      value: formatCurrency(6500),
      icon: ArrowDownLeft,
      color: "text-primary",
    },
    {
      label: "Total Withdrawn",
      value: formatCurrency(0),
      icon: ArrowUpRight,
      color: "text-success",
    },
    {
      label: "Total Profit/Loss",
      value: formatCurrency(totalPortfolioValue - 6500),
      change: formatPercentage(((totalPortfolioValue - 6500) / 6500) * 100),
      icon: totalPortfolioValue > 6500 ? TrendingUp : TrendingDown,
      color: totalPortfolioValue > 6500 ? "text-success" : "text-error",
    },
    {
      label: "Transactions This Month",
      value: "3",
      icon: Wallet,
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-text-secondary">Here's your portfolio overview</p>
        </div>

        {/* Portfolio Overview */}
        <Card className="mb-8">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Total Value */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-text-primary mb-2">
                    {formatCurrency(totalPortfolioValue)}
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${
                      portfolioChange24h >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {portfolioChange24h >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-lg font-semibold">
                      {formatCurrency(
                        Math.abs(
                          totalPortfolioValue * (portfolioChange24h / 100)
                        )
                      )}
                      ({formatPercentage(portfolioChange24h)})
                    </span>
                    <span className="text-text-secondary">24h</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4">
                  <Link to="/buy">
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Buy Crypto</span>
                    </Button>
                  </Link>
                  <Link to="/sell">
                    <Button
                      variant="danger"
                      className="flex items-center space-x-2"
                    >
                      <Minus className="w-4 h-4" />
                      <span>Sell Crypto</span>
                    </Button>
                  </Link>
                  <Link to="/wallet">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Wallet</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Portfolio Chart */}
              <div className="flex items-center justify-center">
                {holdings.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-text-secondary">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No holdings yet</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            {/* Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div
                        key={holding.crypto.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">
                            {holding.crypto.logo}
                          </span>
                          <div>
                            <div className="font-semibold text-text-primary">
                              {holding.crypto.name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {formatCrypto(
                                holding.amount,
                                holding.crypto.symbol,
                                8
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text-primary">
                            {formatCurrency(holding.value)}
                          </div>
                          <div
                            className={`text-sm ${
                              holding.change24h >= 0
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {formatPercentage(
                              (holding.change24h / holding.value) * 100
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to="/buy"
                            state={{ selectedCrypto: holding.crypto }}
                          >
                            <Button size="sm" variant="success">
                              Buy More
                            </Button>
                          </Link>
                          <Link
                            to="/sell"
                            state={{ selectedCrypto: holding.crypto }}
                          >
                            <Button size="sm" variant="danger">
                              Sell
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      No crypto holdings yet
                    </h3>
                    <p className="text-text-secondary mb-6">
                      Start building your portfolio by buying your first
                      cryptocurrency
                    </p>
                    <Link to="/buy">
                      <Button>Buy Your First Crypto</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPriceHistory}>
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(1)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0066FF"
                      strokeWidth={3}
                      dot={{ fill: "#0066FF", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Link to="/transactions">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "buy"
                                ? "bg-success/10"
                                : "bg-error/10"
                            }`}
                          >
                            {transaction.type === "buy" ? (
                              <ArrowDownLeft
                                className={`w-5 h-5 text-success`}
                              />
                            ) : (
                              <ArrowUpRight className={`w-5 h-5 text-error`} />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary capitalize">
                              {transaction.type} {transaction.crypto.symbol}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {transaction.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text-primary">
                            {formatCrypto(
                              transaction.amount,
                              transaction.crypto.symbol,
                              8
                            )}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {transaction.fiatAmount &&
                              formatCurrency(transaction.fiatAmount)}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-success/10 text-success"
                              : transaction.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {transaction.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-text-secondary">
                      No transactions yet
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-text-secondary mb-1">
                          {stat.label}
                        </div>
                        <div className="text-xl font-bold text-text-primary">
                          {stat.value}
                        </div>
                        {stat.change && (
                          <div className={`text-sm ${stat.color}`}>
                            {stat.change}
                          </div>
                        )}
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Price Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Price Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-secondary text-sm mb-4">
                    No price alerts set
                  </p>
                  <Button size="sm" variant="outline">
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Market Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Market Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">
                      Total Market Cap
                    </span>
                    <span className="font-semibold">$2.1T</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">24h Volume</span>
                    <span className="font-semibold">$85.6B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">BTC Dominance</span>
                    <span className="font-semibold">52.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Fear & Greed</span>
                    <span className="font-semibold text-warning">Neutral</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
