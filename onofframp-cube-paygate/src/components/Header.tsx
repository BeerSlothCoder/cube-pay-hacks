import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectWallet, useAddress, useDisconnect } from "@thirdweb-dev/react";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Wallet,
  History,
  Settings,
  LogOut,
  Box,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { truncateAddress } from "../lib/utils";
import PriceTicker from "./PriceTicker";
import RotatableCube from "./RotatableCube";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const address = useAddress();
  const disconnect = useDisconnect();
  const { user, setUser, setAuthenticated } = useStore();

  const navigation = [
    { name: "Buy Crypto", href: "/buy" },
    { name: "Sell Crypto", href: "/sell" },
    { name: "Prices", href: "/prices" },
    { name: "How It Works", href: "/how-it-works" },
  ];

  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Transactions", href: "/transactions", icon: History },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleDisconnect = () => {
    disconnect();
    setUser(null);
    setAuthenticated(false);
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Price Ticker */}
      <PriceTicker />

      {/* Main Header */}
      <header className="bg-dark-card shadow-lg border-b border-cube-green/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cube-green to-cube-glow rounded-lg flex items-center justify-center shadow-lg shadow-cube-green/25">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  CubePay Exchange
                </span>
                <span className="text-xs text-cube-green font-medium">
                  Your Gateway to Crypto
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-cube-green border-b-2 border-cube-green"
                      : "text-gray-300 hover:text-cube-green"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select className="text-sm bg-dark-bg border border-cube-green/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-cube-green/50">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>

              {/* Auth Section */}
              {address ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-dark-bg hover:bg-dark-bg/80 px-4 py-2 rounded-lg transition-colors duration-200 border border-cube-green/30"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cube-green to-cube-glow rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {truncateAddress(address)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-lg shadow-lg border border-cube-green/30 py-1 z-50">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-bg hover:text-cube-green transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <hr className="my-1" />
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-error hover:bg-dark-bg transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <ConnectWallet
                  theme="light"
                  btnTitle="Connect Wallet"
                  modalTitle="Connect to CubePay Exchange"
                  modalTitleIconUrl=""
                  className="!bg-gradient-to-r !from-cube-green !to-cube-glow !text-white !font-medium !px-6 !py-2 !rounded-lg hover:!from-cube-glow hover:!to-cube-green !transition-all !duration-200 !shadow-lg !shadow-cube-green/25"
                />
              )}

              {/* Rotating Cube */}
              <RotatableCube />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-dark-bg transition-colors duration-200 text-gray-300"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cube-green/20 bg-dark-card">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-cube-green bg-cube-green/10"
                      : "text-gray-300 hover:text-cube-green hover:bg-dark-bg"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
