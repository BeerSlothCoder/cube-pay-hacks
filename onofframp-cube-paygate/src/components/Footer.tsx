import { Link } from "react-router-dom";
import { Box, Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const cryptoLogos = [
    { name: "Bitcoin", symbol: "₿" },
    { name: "Ethereum", symbol: "Ξ" },
    { name: "USDC", symbol: "$" },
    { name: "Solana", symbol: "◎" },
    { name: "Polygon", symbol: "⬟" },
    { name: "Arbitrum", symbol: "🔷" },
  ];

  const paymentMethods = [
    { name: "Visa", logo: "VISA" },
    { name: "Mastercard", logo: "MC" },
    { name: "CubePay", logo: "🟦" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CubePay Exchange</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your gateway to crypto - buy, sell, and manage cryptocurrency with
              ease. Secure, fast, and user-friendly platform powered by CubePay
              Payment Gate.
            </p>

            {/* Supported Cryptocurrencies */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Supported Cryptocurrencies</h4>
              <div className="flex flex-wrap gap-3">
                {cryptoLogos.map((crypto) => (
                  <div
                    key={crypto.name}
                    className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg"
                  >
                    <span className="text-lg">{crypto.symbol}</span>
                    <span className="text-sm text-gray-300">{crypto.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold mb-3">Payment Methods</h4>
              <div className="flex space-x-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-white text-gray-900 px-3 py-2 rounded-lg font-semibold text-sm"
                  >
                    {method.logo}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/buy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Buy Crypto
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sell Crypto
                </Link>
              </li>
              <li>
                <Link
                  to="/prices"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Prices
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Support & Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 CubePay Exchange - Powered by CubePay Payment Gate. All
            rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Regulated and compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🛡️</span>
              <span>Your funds are safe</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🏦</span>
              <span>Trusted by 100,000+ users</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
