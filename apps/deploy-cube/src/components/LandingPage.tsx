import React from "react";
import {
  Wallet,
  MapPin,
  Store,
  Database,
  Settings,
  Info,
  QrCode,
  Box,
  Camera,
  Coins,
  CreditCard,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const mainActions = [
    {
      id: "deploy",
      label: "Deploy Agent",
      icon: Box,
      color: "from-blue-500 via-blue-600 to-blue-700",
      shadowColor: "shadow-blue-500/50",
      description: "Deploy your payment agent",
    },
    {
      id: "pay-cubepay",
      label: "Pay With CubePay",
      icon: Coins,
      color: "from-emerald-500 via-green-600 to-teal-700",
      shadowColor: "shadow-emerald-500/50",
      description: "Make crypto payments",
    },
    {
      id: "find-atms",
      label: "Find Virtual ATMs",
      icon: MapPin,
      color: "from-purple-500 via-purple-600 to-pink-600",
      shadowColor: "shadow-purple-500/50",
      description: "Locate payment agents nearby",
    },
    {
      id: "pay-terminal",
      label: "Pay With Terminal",
      icon: CreditCard,
      color: "from-orange-500 via-amber-600 to-yellow-600",
      shadowColor: "shadow-orange-500/50",
      description: "Use POS payment terminal",
    },
  ];

  const featureCards = [
    {
      id: "cubepay",
      label: "CubePay",
      icon: Coins,
      color:
        "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20",
    },
    {
      id: "marketplace",
      label: "Agents Marketplace",
      icon: Store,
      color:
        "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/40 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20",
    },
    {
      id: "map",
      label: "Agent Map",
      icon: MapPin,
      color:
        "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/40 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20",
    },
    {
      id: "database",
      label: "Database",
      icon: Database,
      color:
        "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/40 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      color: "bg-red-900/30 border-red-500/30 hover:border-red-400",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "bg-gray-900/30 border-gray-500/30 hover:border-gray-400",
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      color: "bg-indigo-900/30 border-indigo-500/30 hover:border-indigo-400",
    },
    {
      id: "qr-tests",
      label: "QR Tests",
      icon: QrCode,
      color: "bg-pink-900/30 border-pink-500/30 hover:border-pink-400",
    },
    {
      id: "cube-demo",
      label: "Cube Demo",
      icon: Box,
      color: "bg-teal-900/30 border-teal-500/30 hover:border-teal-400",
    },
    {
      id: "camera-test",
      label: "Camera Test",
      icon: Camera,
      color: "bg-cyan-900/30 border-cyan-500/30 hover:border-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/50">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CubePay
            </h1>
          </div>
          <button
            onClick={() => onNavigate("deploy")}
            className="group px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 font-semibold"
          >
            <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-cream mb-6">
            Welcome to <span className="text-blue-400">CubePay</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Deploy AI-powered payment agents in augmented reality. Accept crypto
            payments anywhere in the world.
          </p>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {mainActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.color} p-8 text-left transition-all duration-500 hover:scale-110 hover:rotate-1 shadow-2xl ${action.shadowColor} hover:shadow-3xl border border-white/10`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-shadow-lg">
                    {action.label}
                  </h3>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </button>
            );
          })}
        </div>

        {/* Feature Cards Grid */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl rounded-3xl p-10 border border-gray-700/50 shadow-2xl">
          <h3 className="text-3xl font-black text-center mb-10 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Explore Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => onNavigate(feature.id)}
                  className={`${feature.color} border-2 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:scale-110 hover:-translate-y-2 backdrop-blur-sm`}
                >
                  <Icon className="w-10 h-10 text-gray-200" />
                  <span className="text-sm text-cream font-semibold text-center leading-tight">
                    {feature.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 CubePay. Decentralized payment infrastructure.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a
              href="#"
              className="hover:text-blue-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("about");
              }}
            >
              About
            </a>
            <a
              href="#"
              className="hover:text-blue-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("docs");
              }}
            >
              Documentation
            </a>
            <a
              href="#"
              className="hover:text-blue-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("support");
              }}
            >
              Support
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
