import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  QrCode,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Shield,
  Download,
  Settings,
  Plus,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { formatCurrency, formatCrypto, truncateAddress } from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import toast from "react-hot-toast";

export default function Wallet() {
  const { holdings, transactions } = useStore();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  // Mock wallet data
  const walletAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590c4";
  const privateKey =
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const recentTransactions = transactions.slice(0, 5);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied!");
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    toast.success("Private key copied!");
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "send", label: "Send" },
    { key: "receive", label: "Receive" },
    { key: "security", label: "Security" },
  ];

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-300">
            Manage your cryptocurrency holdings and transactions
          </p>
        </div>

        {/* Wallet Overview */}
        <Card className="mb-8">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wallet Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Total Balance
                    </h2>
                    <div className="text-4xl font-bold text-cube-green mb-2">
                      {formatCurrency(totalValue)}
                    </div>
                    <div className="text-sm text-gray-400">
                      Wallet Address: {truncateAddress(walletAddress, 8, 6)}
                      <button
                        onClick={handleCopyAddress}
                        className="ml-2 text-cube-green hover:text-cube-glow transition-colors"
                      >
                        <Copy className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-2">
                      <QrCode className="w-16 h-16 text-dark-bg" />
                    </div>
                    <div className="text-xs text-gray-400">QR Code</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4">
                  <Button className="flex items-center space-x-2">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Send</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Receive</span>
                  </Button>
                  <Link to="/buy">
                    <Button
                      variant="secondary"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Buy Crypto</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Security Status */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Security Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Wallet Backup</span>
                    <span className="text-cube-green">✓ Secured</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">2FA Enabled</span>
                    <span className="text-cube-green">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Recovery Phrase</span>
                    <span className="text-cube-green">✓ Saved</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-dark-card rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? "bg-gradient-to-r from-cube-green to-cube-glow text-white"
                  : "text-gray-300 hover:text-cube-green"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings.map((holding) => (
                      <div
                        key={holding.crypto.id}
                        className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {holding.crypto.logo}
                          </span>
                          <div>
                            <div className="font-semibold text-white">
                              {holding.crypto.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatCrypto(
                                holding.amount,
                                holding.crypto.symbol,
                                8
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-cube-green">
                            {formatCurrency(holding.value)}
                          </div>
                          <div
                            className={`text-sm ${
                              holding.change24h >= 0
                                ? "text-success"
                                : "text-error"
                            }`}
                          >
                            {holding.change24h >= 0 ? "+" : ""}
                            {(
                              (holding.change24h / holding.value) *
                              100
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      No crypto holdings yet
                    </div>
                    <Link to="/buy">
                      <Button>Buy Your First Crypto</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
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
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === "buy"
                                ? "bg-success/20"
                                : "bg-error/20"
                            }`}
                          >
                            {transaction.type === "buy" ? (
                              <ArrowDownLeft className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-error" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">
                              {transaction.type} {transaction.crypto.symbol}
                            </div>
                            <div className="text-sm text-gray-400">
                              {transaction.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">
                            {formatCrypto(
                              transaction.amount,
                              transaction.crypto.symbol,
                              6
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {transaction.fiatAmount &&
                              formatCurrency(transaction.fiatAmount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No transactions yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "send" && (
          <Card>
            <CardHeader>
              <CardTitle>Send Cryptocurrency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Cryptocurrency
                  </label>
                  <select className="input-field">
                    {holdings.map((holding) => (
                      <option key={holding.crypto.id} value={holding.crypto.id}>
                        {holding.crypto.name} (
                        {formatCrypto(holding.amount, holding.crypto.symbol, 6)}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Recipient Address"
                  placeholder="0x..."
                  helperText="Enter the wallet address to send to"
                />

                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  helperText="Enter the amount to send"
                />

                <div className="bg-dark-bg/50 border border-cube-green/20 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Network Fee:</span>
                    <span className="text-white">~$2.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-cube-green font-semibold">$0.00</span>
                  </div>
                </div>

                <Button className="w-full" disabled>
                  Send Cryptocurrency
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Send functionality will be available after wallet integration
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "receive" && (
          <Card>
            <CardHeader>
              <CardTitle>Receive Cryptocurrency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto text-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                  <QrCode className="w-32 h-32 text-dark-bg" />
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-300 mb-2">
                    Your Wallet Address
                  </div>
                  <div className="bg-dark-bg border border-cube-green/30 rounded-lg p-4 font-mono text-sm text-white break-all">
                    {walletAddress}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="mt-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </div>

                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <div className="text-warning text-sm font-medium mb-1">
                    Important
                  </div>
                  <div className="text-xs text-gray-300">
                    Only send Ethereum and ERC-20 tokens to this address.
                    Sending other cryptocurrencies may result in permanent loss.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Private Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-error/10 border border-error/30 rounded-lg p-4">
                    <div className="text-error text-sm font-medium mb-1">
                      ⚠️ Warning
                    </div>
                    <div className="text-xs text-gray-300">
                      Never share your private key with anyone. Anyone with
                      access to your private key can control your funds.
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        Private Key
                      </label>
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="text-cube-green hover:text-cube-glow text-sm flex items-center space-x-1"
                      >
                        {showPrivateKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span>{showPrivateKey ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                    <div className="bg-dark-bg border border-cube-green/30 rounded-lg p-4 font-mono text-sm">
                      {showPrivateKey ? (
                        <span className="text-white break-all">
                          {privateKey}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                        </span>
                      )}
                    </div>
                    {showPrivateKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrivateKey}
                        className="mt-2"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Private Key
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        Two-Factor Authentication
                      </div>
                      <div className="text-sm text-gray-400">
                        Add an extra layer of security
                      </div>
                    </div>
                    <div className="text-cube-green">✓ Enabled</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        Biometric Authentication
                      </div>
                      <div className="text-sm text-gray-400">
                        Use fingerprint or face ID
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        Recovery Phrase
                      </div>
                      <div className="text-sm text-gray-400">
                        Backup your wallet
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Backup
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">
                        Session Management
                      </div>
                      <div className="text-sm text-gray-400">
                        Manage active sessions
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
