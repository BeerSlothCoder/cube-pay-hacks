import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  ExternalLink,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
} from "../lib/utils";
import Button from "../components/ui/Button";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Prices() {
  const { cryptocurrencies } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [favorites, setFavorites] = useState<string[]>(["bitcoin", "ethereum"]);

  const marketStats = {
    totalMarketCap: 2.1e12, // $2.1T
    volume24h: 85.6e9, // $85.6B
    btcDominance: 52.3,
    activeCryptos: cryptocurrencies.length,
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "favorites", label: "Favorites" },
    { key: "gainers", label: "Gainers" },
    { key: "losers", label: "Losers" },
  ];

  const sortOptions = [
    { key: "rank", label: "Rank" },
    { key: "price", label: "Price" },
    { key: "marketCap", label: "Market Cap" },
    { key: "volume", label: "Volume" },
    { key: "change24h", label: "24h Change" },
  ];

  const toggleFavorite = (cryptoId: string) => {
    setFavorites((prev) =>
      prev.includes(cryptoId)
        ? prev.filter((id) => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  const filteredCryptos = cryptocurrencies
    .filter((crypto) => {
      // Search filter
      if (
        searchTerm &&
        !crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      switch (filter) {
        case "favorites":
          return favorites.includes(crypto.id);
        case "gainers":
          return crypto.change24h > 0;
        case "losers":
          return crypto.change24h < 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "marketCap":
          return b.marketCap - a.marketCap;
        case "volume":
          return b.volume24h - a.volume24h;
        case "change24h":
          return b.change24h - a.change24h;
        default:
          return a.rank - b.rank;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Cryptocurrency Prices
          </h1>
          <p className="text-text-secondary">
            Track real-time prices and market trends
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  ${formatLargeNumber(marketStats.totalMarketCap)}
                </div>
                <div className="text-sm text-text-secondary">
                  Total Market Cap
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  ${formatLargeNumber(marketStats.volume24h)}
                </div>
                <div className="text-sm text-text-secondary">24h Volume</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {marketStats.btcDominance}%
                </div>
                <div className="text-sm text-text-secondary">BTC Dominance</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {marketStats.activeCryptos}+
                </div>
                <div className="text-sm text-text-secondary">
                  Active Cryptocurrencies
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text-secondary hover:bg-gray-200"
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
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Price Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-text-secondary">
                      #
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-text-secondary">
                      Cryptocurrency
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-text-secondary">
                      Price
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-text-secondary">
                      24h Change
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-text-secondary hidden md:table-cell">
                      7d Change
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-text-secondary hidden lg:table-cell">
                      Market Cap
                    </th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-text-secondary hidden lg:table-cell">
                      Volume (24h)
                    </th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCryptos.map((crypto) => (
                    <tr
                      key={crypto.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(crypto.id)}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                favorites.includes(crypto.id)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : ""
                              }`}
                            />
                          </button>
                          <span className="text-sm font-medium">
                            {crypto.rank}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{crypto.logo}</span>
                          <div>
                            <div className="font-semibold text-text-primary">
                              {crypto.name}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {crypto.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-2 text-right">
                        <div className="font-semibold text-text-primary">
                          {formatCurrency(crypto.price)}
                        </div>
                      </td>

                      <td className="py-4 px-2 text-right">
                        <div
                          className={`flex items-center justify-end space-x-1 ${
                            crypto.change24h >= 0
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {crypto.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {formatPercentage(crypto.change24h)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-2 text-right hidden md:table-cell">
                        <span
                          className={`font-medium ${
                            crypto.change7d >= 0 ? "text-success" : "text-error"
                          }`}
                        >
                          {formatPercentage(crypto.change7d)}
                        </span>
                      </td>

                      <td className="py-4 px-2 text-right hidden lg:table-cell">
                        <span className="text-text-primary">
                          ${formatLargeNumber(crypto.marketCap)}
                        </span>
                      </td>

                      <td className="py-4 px-2 text-right hidden lg:table-cell">
                        <span className="text-text-primary">
                          ${formatLargeNumber(crypto.volume24h)}
                        </span>
                      </td>

                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Link to="/buy" state={{ selectedCrypto: crypto }}>
                            <Button size="sm" variant="success">
                              Buy
                            </Button>
                          </Link>
                          <Link to="/sell" state={{ selectedCrypto: crypto }}>
                            <Button size="sm" variant="danger">
                              Sell
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCryptos.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No cryptocurrencies found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Gainers/Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Gainers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span>Top Gainers (24h)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cryptocurrencies
                  .filter((crypto) => crypto.change24h > 0)
                  .sort((a, b) => b.change24h - a.change24h)
                  .slice(0, 5)
                  .map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{crypto.logo}</span>
                        <div>
                          <div className="font-semibold text-sm">
                            {crypto.symbol}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatCurrency(crypto.price)}
                          </div>
                        </div>
                      </div>
                      <div className="text-success font-semibold">
                        +{crypto.change24h.toFixed(2)}%
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-error" />
                <span>Top Losers (24h)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cryptocurrencies
                  .filter((crypto) => crypto.change24h < 0)
                  .sort((a, b) => a.change24h - b.change24h)
                  .slice(0, 5)
                  .map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{crypto.logo}</span>
                        <div>
                          <div className="font-semibold text-sm">
                            {crypto.symbol}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatCurrency(crypto.price)}
                          </div>
                        </div>
                      </div>
                      <div className="text-error font-semibold">
                        {crypto.change24h.toFixed(2)}%
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
