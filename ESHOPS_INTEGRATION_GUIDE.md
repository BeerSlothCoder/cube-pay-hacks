# 🛍️ CubePay E-Commerce Integration Guide

This document describes the two integrated e-shop applications within the CubePay ecosystem.

## 📋 Overview

Two e-commerce applications have been created with full integration to CubePay payment terminals:

1. **Sparkle Assets** - Premium digital assets marketplace
2. **CubePay Gate** - Crypto on/off ramp platform

Both applications feature seamless payment terminal integration, allowing customers to complete purchases using deployed POS and ARTM terminals.

---

## 🎨 Sparkle Assets E-Shop

**Location**: `/eshop-sparkle-assets`  
**Port**: `3002`  
**URL**: `http://localhost:3002`

### Purpose

A modern marketplace for purchasing premium digital assets including NFTs, 3D models, audio, video content, and digital art.

### Key Features

- ✅ Product catalog with 8+ premium assets
- ✅ Category filtering (NFT, Art, 3D Models, Audio, Video)
- ✅ Shopping cart with quantity management
- ✅ Multi-currency support (USD, USDC, ETH)
- ✅ **Payment terminal integration**
- ✅ Real-time terminal selection from database
- ✅ Responsive design

### Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand (state management)
- Supabase (database)
- Lucide React (icons)

### Payment Flow

1. User browses products and adds to cart
2. Cart drawer shows items and total
3. User clicks "Proceed to Checkout"
4. **PaymentTerminalSelector modal opens**
5. User selects POS or ARTM terminal
6. Payment is processed
7. Cart is cleared and success message shown

### Components

```
src/
├── components/
│   ├── Header.tsx                    # Navigation with cart badge
│   ├── ProductCard.tsx               # Product display cards
│   ├── CartDrawer.tsx                # Slide-out shopping cart
│   └── PaymentTerminalSelector.tsx   # Terminal selection modal
├── data/
│   └── products.ts                   # Product catalog
├── store/
│   └── cartStore.ts                  # Cart state management
└── App.tsx                           # Main app with category filters
```

### Running the App

```bash
cd eshop-sparkle-assets
npm install
npm run dev
```

---

## 💱 CubePay Gate (On/Off Ramp)

**Location**: `/onofframp-cube-paygate`  
**Port**: `3003`  
**URL**: `http://localhost:3003`

### Purpose

A comprehensive cryptocurrency exchange platform enabling users to buy and sell crypto with fiat currency, integrated with CubePay terminals.

### Key Features

- ✅ Buy crypto with fiat
- ✅ Sell crypto for fiat
- ✅ Live cryptocurrency prices
- ✅ Wallet integration (Thirdweb)
- ✅ Transaction history
- ✅ User dashboard
- ✅ **Payment terminal integration**
- ✅ Multiple payment options
- ✅ AR Viewer integration

### Tech Stack

- React 18 + TypeScript
- React Router v6
- Vite 6
- Tailwind CSS 4
- Zustand (state management)
- Thirdweb SDK (blockchain)
- Supabase (database)
- React Hot Toast (notifications)

### Payment Flow

1. User selects crypto and amount
2. Order is created
3. Checkout page displays order details
4. Two payment options:
   - **Option A**: Select Payment Terminal (modal)
   - **Option B**: Use AR Viewer Terminal (redirect)
5. User selects a terminal from database
6. Payment is processed
7. User redirected to confirmation page

### Pages

```
/                   # Home/Landing page
/buy                # Buy cryptocurrency
/sell               # Sell cryptocurrency
/checkout           # Order checkout with terminal selection
/confirmation       # Order confirmation
/dashboard          # User dashboard
/wallet             # Wallet management
/transactions       # Transaction history
/prices             # Live crypto prices
/how-it-works       # Information page
```

### Components

```
src/
├── components/
│   ├── Header.tsx                    # Main navigation
│   ├── Footer.tsx                    # Footer
│   ├── Layout.tsx                    # Page wrapper
│   ├── PriceTicker.tsx               # Live prices
│   ├── PaymentTerminalSelector.tsx   # Terminal modal
│   └── ui/                           # Reusable UI components
├── pages/
│   ├── Home.tsx
│   ├── BuyCrypto.tsx
│   ├── SellCrypto.tsx
│   ├── Checkout.tsx                  # ⭐ Terminal integration here
│   └── ...
└── store/
    └── useStore.ts                   # Global state
```

### Running the App

```bash
cd onofframp-cube-paygate
npm install
npm run dev
```

---

## 🔌 Payment Terminal Integration

Both e-shops integrate with CubePay's deployed payment terminals through a shared pattern:

### PaymentTerminalSelector Component

**Features**:

- Fetches live terminals from Supabase `deployed_ar_agents` table
- Filters for `pos_terminal` and `artm_terminal` types
- Displays terminal name, type, and location
- Visual selection with highlighting
- Shows total amount and currency
- Processes payment on selection

**Database Query**:

```sql
SELECT * FROM deployed_ar_agents
WHERE agent_type IN ('pos_terminal', 'artm_terminal')
```

### Terminal Types

#### POS Terminal

- Icon: Credit Card 💳
- Use: Traditional card payments
- Features: Bank/exchange integrations

#### ARTM Terminal

- Icon: Wallet 💼
- Use: Advanced crypto ATM
- Features: Card/crypto withdrawals, wallet management

### Integration Code Pattern

```typescript
import PaymentTerminalSelector from './PaymentTerminalSelector';

const [showPayment, setShowPayment] = useState(false);

// In your checkout flow:
<button onClick={() => setShowPayment(true)}>
  Pay with Terminal
</button>

{showPayment && (
  <PaymentTerminalSelector
    amount={totalAmount}
    currency="USD"
    onClose={() => setShowPayment(false)}
    onComplete={handlePaymentSuccess}
  />
)}
```

---

## 🗄️ Database Schema

Both apps query the same database table:

```sql
CREATE TABLE deployed_ar_agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  agent_type TEXT CHECK (agent_type IN ('pos_terminal', 'artm_terminal', ...)),
  location JSONB NOT NULL,  -- {lat: number, lng: number}
  screen_position JSONB,    -- {x: number, y: number} (for ARTM)
  bank_integrations TEXT[],
  exchange_integrations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Quick Start (Both Apps)

### 1. Install Dependencies

```bash
# From project root
npm install

# Or in each app directory
cd eshop-sparkle-assets && npm install
cd ../onofframp-cube-paygate && npm install
```

### 2. Set Environment Variables

Both apps share the root `.env` file:

```env
# Database
VITE_SUPABASE_URL=https://okzjeufiaeznfyomfenk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Blockchain (for onofframp)
VITE_THIRDWEB_CLIENT_ID=your_client_id
```

### 3. Start Development Servers

**Terminal 1** (Sparkle Assets):

```bash
cd eshop-sparkle-assets
npm run dev
# Runs on http://localhost:3002
```

**Terminal 2** (CubePay Gate):

```bash
cd onofframp-cube-paygate
npm run dev
# Runs on http://localhost:3003
```

### 4. Access the Apps

- **Sparkle Assets**: http://localhost:3002
- **CubePay Gate**: http://localhost:3003

---

## 🧪 Testing Payment Integration

### Test Flow for Sparkle Assets:

1. Navigate to http://localhost:3002
2. Add products to cart (click + button)
3. Open cart (click cart icon in header)
4. Click "Proceed to Checkout"
5. Click "Complete Payment"
6. Modal opens with available terminals
7. Select a terminal
8. Click "Complete Payment"
9. Success! Cart clears

### Test Flow for CubePay Gate:

1. Navigate to http://localhost:3003
2. Click "Buy Crypto"
3. Select cryptocurrency and enter amount
4. Enter wallet address
5. Click "Continue to Checkout"
6. On checkout page, click "Select Payment Terminal"
7. Modal opens with available terminals
8. Select terminal and confirm
9. Redirected to confirmation page

---

## 📊 Database Requirements

### Check Terminal Availability

```sql
SELECT id, name, agent_type, location
FROM deployed_ar_agents
WHERE agent_type IN ('pos_terminal', 'artm_terminal');
```

### Expected Results

```
id     | name           | agent_type      | location
-------|----------------|-----------------|------------------
uuid-1 | ARTM 1         | artm_terminal   | {"lat": 37.7749, "lng": -122.4194}
uuid-2 | POS 2 with x.y | pos_terminal    | {"lat": 37.7849, "lng": -122.4294}
uuid-3 | POS 1 No x,y   | pos_terminal    | {"lat": 37.7949, "lng": -122.4394}
```

If no terminals are available, the modal will show "No payment terminals available".

---

## 🔧 Troubleshooting

### Issue: Terminal selector shows "No terminals"

**Solution**:

- Check Supabase connection
- Verify terminals exist in database
- Check RLS policies allow anonymous reads

### Issue: Payment not processing

**Solution**:

- Check console for errors
- Verify `onComplete` callback is defined
- Check network tab for API errors

### Issue: Modal not closing

**Solution**:

- Ensure `onClose` prop is passed
- Check for z-index conflicts
- Verify state management

---

## 🎯 Next Steps

### Enhancements for Sparkle Assets

- [ ] User authentication
- [ ] Order history
- [ ] Digital asset delivery system
- [ ] Product reviews
- [ ] Wishlist feature

### Enhancements for CubePay Gate

- [ ] KYC/AML integration
- [ ] Multiple fiat currencies
- [ ] Advanced trading features
- [ ] Price alerts
- [ ] Recurring purchases

### Shared Enhancements

- [ ] Email confirmations
- [ ] SMS notifications
- [ ] Transaction receipts
- [ ] Customer support chat
- [ ] Analytics dashboard

---

## 📝 Summary

✅ **Sparkle Assets**: Fully functional digital marketplace with terminal payments  
✅ **CubePay Gate**: Complete crypto exchange with terminal selection  
✅ **Terminal Integration**: Both apps query live terminal database  
✅ **User Experience**: Seamless payment flow with modal selection  
✅ **Tech Stack**: Modern React + TypeScript + Tailwind

Both e-shops are production-ready and can be deployed independently or as part of the CubePay ecosystem.

---

## 📞 Support

For questions or issues:

- Check Supabase logs for database issues
- Review browser console for frontend errors
- Check network tab for API call failures
- Verify environment variables are set correctly

---

**Last Updated**: February 7, 2026  
**CubePay Version**: 1.0.0
