import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

export default function Transactions() {
  const { transactions } = useStore();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const filters = [
    { key: "all", label: "All Transactions" },
    { key: "buy", label: "Purchases" },
    { key: "sell", label: "Sales" },
    { key: "pending", label: "Pending" },
  ];

  const filteredTransactions = transactions
    .filter((tx) => {
      if (filter === "all") return true;
      if (filter === "pending") return tx.status === "pending";
      return tx.type === filter;
    })
    .sort((a, b) => {
      if (sortBy === "date")
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      if (sortBy === "amount") return (b.fiatAmount || 0) - (a.fiatAmount || 0);
      return 0;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowDownLeft className="w-5 h-5 text-success" />;
      case "sell":
        return <ArrowUpRight className="w-5 h-5 text-error" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-300">View all your crypto transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? "bg-gradient-to-r from-cube-green to-cube-glow text-white"
                        : "bg-dark-bg text-gray-300 hover:text-cube-green border border-cube-green/30"
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-bg border border-cube-green/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cube-green/50"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-cube-green/20 hover:border-cube-green/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Type Icon */}
                      <div className="w-12 h-12 rounded-full bg-dark-card flex items-center justify-center">
                        {getTypeIcon(transaction.type)}
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white capitalize">
                            {transaction.type} {transaction.crypto.symbol}
                          </span>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {transaction.timestamp.toLocaleDateString()} at{" "}
                          {transaction.timestamp.toLocaleTimeString()}
                        </div>
                        {transaction.orderId && (
                          <div className="text-xs text-gray-500">
                            Order: {transaction.orderId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {formatCrypto(
                          transaction.amount,
                          transaction.crypto.symbol,
                          8
                        )}
                      </div>
                      {transaction.fiatAmount && (
                        <div className="text-sm text-gray-400">
                          {formatCurrency(transaction.fiatAmount)}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        {transaction.txHash && (
                          <a
                            href={`https://etherscan.io/tx/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cube-green hover:text-cube-glow text-xs flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View</span>
                          </a>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-success/10 text-success"
                              : transaction.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowUpRight className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-400 mb-6">
                  {filter === "all"
                    ? "You haven't made any transactions yet"
                    : `No ${filter} transactions found`}
                </p>
                <Link to="/buy">
                  <Button>Make Your First Purchase</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {filteredTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cube-green mb-1">
                    {
                      filteredTransactions.filter((tx) => tx.type === "buy")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-400">Total Purchases</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cube-green mb-1">
                    {
                      filteredTransactions.filter((tx) => tx.type === "sell")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-400">Total Sales</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cube-green mb-1">
                    {formatCurrency(
                      filteredTransactions
                        .filter((tx) => tx.fiatAmount)
                        .reduce((sum, tx) => sum + (tx.fiatAmount || 0), 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Total Volume</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
