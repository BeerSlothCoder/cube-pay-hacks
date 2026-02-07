# 🚀 CubePay Exchange

**Your Gateway to Crypto - Buy, Sell, Own**

A modern, secure crypto on/off ramp platform built with React, TypeScript, and Tailwind CSS. Features CubePay's signature dark theme with green glow accents and comprehensive cryptocurrency trading functionality.

![CubePay Exchange](https://img.shields.io/badge/CubePay-Exchange-00FF88?style=for-the-badge&logo=bitcoin&logoColor=white)

## ✨ Features

### 🎯 Core Functionality

- **Buy Crypto (On-Ramp)** - Purchase cryptocurrency using CubePay virtual terminal
- **Sell Crypto (Off-Ramp)** - Convert cryptocurrency to fiat currency
- **Wallet Management** - Auto-create wallets for first-time users
- **Portfolio Dashboard** - Real-time portfolio tracking and analytics
- **Transaction History** - Complete transaction management
- **Price Tracking** - Live cryptocurrency prices and market data

### 🔐 Security & Authentication

- **Thirdweb Integration** - Wallet connect + social login
- **Auto-Wallet Creation** - Seamless onboarding for new users
- **CubePay Virtual Terminal** - Secure payment processing
- **Bank-level Encryption** - Enterprise-grade security

### 🎨 Design & UX

- **Dark Theme** - Professional crypto exchange aesthetic
- **CubePay Branding** - Signature green glow (#00FF88) accents
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Animated Components** - Smooth transitions and micro-interactions
- **Trust Indicators** - Security badges and guarantees

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom CubePay theme
- **State Management**: Zustand
- **Routing**: React Router v6
- **Authentication**: Thirdweb (Wallet Connect + Social Login)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Build Tool**: Vite
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/[your-username]/cubepay-exchange.git
   cd cubepay-exchange
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your Thirdweb Client ID:

   ```
   VITE_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5175`

## 📱 Pages & Features

### 🏠 Home Page

- Hero section with quick buy widget
- Supported cryptocurrencies showcase
- How it works explanation
- Trust indicators and statistics
- Recent transactions feed

### 💰 Buy Crypto (On-Ramp)

- 5-step purchase flow
- 50+ supported cryptocurrencies
- Real-time price calculations
- CubePay virtual terminal integration
- Transparent fee breakdown

### 💸 Sell Crypto (Off-Ramp)

- Portfolio-based selling
- Multiple payout methods
- Bank account integration
- CubePay virtual card option
- Instant and scheduled payouts

### 👛 Wallet Management

- Auto-generated wallets for new users
- Portfolio overview with charts
- Send/receive functionality
- Private key management
- Security settings

### 📊 Dashboard

- Portfolio performance tracking
- Holdings breakdown with pie charts
- Recent transaction history
- Quick action buttons
- Market summary

### 📈 Prices & Market Data

- Real-time cryptocurrency prices
- Market cap and volume data
- Price change indicators
- Sortable and filterable tables
- Top gainers/losers

## 🎨 CubePay Brand Colors

```css
/* Primary Colors */
--cube-green: #00FF88    /* Signature green glow */
--cube-glow: #00CC66     /* Darker green accents */
--primary: #0099FF       /* CubePay blue */

/* Dark Theme */
--dark-bg: #0A0F1C       /* Main background */
--dark-card: #1A1F2E     /* Card backgrounds */
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input)
│   ├── layout/         # Layout components (Header, Footer)
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx
│   ├── BuyCrypto.tsx
│   ├── SellCrypto.tsx
│   └── ...
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── data/               # Mock data and constants
├── lib/                # Utility functions
└── ...
```

## 🌟 Key Features Implemented

### Authentication Flow

- [x] Thirdweb wallet connection
- [x] Social login (Google, Twitter, Discord)
- [x] Auto-wallet creation for new users
- [x] User session management

### Trading Features

- [x] Buy crypto with fiat
- [x] Sell crypto to fiat
- [x] Real-time price updates
- [x] Fee calculation and display
- [x] Order management

### Wallet Features

- [x] Portfolio tracking
- [x] Transaction history
- [x] Address management
- [x] QR code generation
- [x] Security settings

### UI/UX Features

- [x] Responsive design
- [x] Dark theme with CubePay branding
- [x] Animated components
- [x] Loading states
- [x] Error handling
- [x] Toast notifications

## 🔮 Future Enhancements

- [ ] Real cryptocurrency price API integration
- [ ] Actual blockchain transaction processing
- [ ] KYC/AML verification flow
- [ ] Advanced trading features (limit orders, etc.)
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced portfolio analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CubePay Payment Gate** - For the amazing branding and payment infrastructure
- **Thirdweb** - For seamless Web3 authentication
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon set

## 📞 Support

For support, email support@cubepayexchange.com or join our Discord community.

---

**Built with ❤️ for the crypto community**

_CubePay Exchange - Your Gateway to Crypto_
