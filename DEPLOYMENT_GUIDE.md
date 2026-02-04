# ENS Payment Integration - Deployment Guide

**Date:** February 4, 2026  
**Status:** Ready for Production Deployment  
**Version:** 1.0

---

## Overview

This guide provides step-by-step instructions for deploying the complete ENS payment integration to production. All core functionality is implemented and tested.

---

## Part 1: Pre-Deployment Checklist

### Development Environment (✅ Completed)

- [x] ENS Client implementation in `packages/wallet-connector/src/ensClient.ts`
- [x] ENS Payment Service in `apps/cube-viewer/src/services/ensPaymentService.ts`
- [x] ENS Payment Display Component in `apps/cube-viewer/src/components/ENSPaymentDisplay.tsx`
- [x] PaymentModal integration with ENS support
- [x] Database schema includes ar_qr_codes table for QR code tracking
- [x] `.env` configured for Sepolia testnet ENS resolution
- [x] Migration file created for ar_qr_codes table

### Code Quality & Testing

- [x] TypeScript types defined for ENS payment configurations
- [x] Error handling for failed domain resolution
- [x] Validation for payment amount constraints
- [x] Caching mechanism for ENS lookups (1-hour TTL)
- [x] Responsive UI with loading and error states

---

## Part 2: Production Environment Setup

### Step 1: Create Production Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Configure:
   - **Project Name:** `cubepay-production`
   - **Database Password:** Use strong password (save securely)
   - **Region:** Choose closest to your users
   - **Pricing:** Pro tier (pay-as-you-go recommended)

4. Wait for database initialization (2-3 minutes)

### Step 2: Apply Database Schema to Production

1. In Supabase dashboard, navigate to **SQL Editor**
2. Create new query and run the schema:

```bash
# Copy entire contents of database/schema.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

**Expected Output:**

```
CubePay database setup completed successfully!
Tables: deployed_objects, ar_qr_codes
Ready for agent deployment and AR payments
```

3. Verify tables exist:
   - Go to **Database** > **Tables**
   - Confirm `deployed_objects` and `ar_qr_codes` visible

### Step 3: Apply ar_qr_codes Migration

If not included in main schema:

```bash
# In Supabase SQL Editor:
# Run: database/migrations/create_ar_qr_codes_table.sql
```

### Step 4: Configure Row Level Security (RLS)

Verify RLS policies are active:

```sql
-- In Supabase SQL Editor, verify policies exist:
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('deployed_objects', 'ar_qr_codes');
```

Expected policies:

- `Anyone can read deployed objects`
- `Users can insert objects`
- `Users can update their own objects`
- `Allow read access to active QR codes`
- `Allow creating QR codes`
- `Allow updating QR codes`

---

## Part 3: Configure Production Environment Variables

### Step 1: Get Production Credentials

From Supabase Production Project:

1. Go to **Project Settings** > **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API Key (anon/public)** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** → `VITE_SUPABASE_SERVICE_ROLE_KEY` (for server only)

### Step 2: Create .env.production File

```bash
# Copy template
cp .env.production.example .env.production

# Edit with production values
nano .env.production  # or use your editor
```

### Step 3: Fill Required Fields

```env
# CRITICAL - From Supabase Production
VITE_SUPABASE_URL=https://YOUR_PROD_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PRODUCTION_ANON_KEY
VITE_SUPABASE_SERVICE_ROLE_KEY=YOUR_PRODUCTION_SERVICE_ROLE_KEY

# ENS Configuration (Sepolia testnet)
VITE_ENS_RESOLVER_NETWORK=sepolia
VITE_ENS_DOMAIN=cube-pay.eth
VITE_ENS_RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# ThirdWeb
VITE_THIRDWEB_CLIENT_ID=YOUR_THIRDWEB_ID
VITE_THIRDWEB_SECRET_KEY=YOUR_THIRDWEB_SECRET

# Wallet Providers
# Add any other blockchain-related keys
```

### Step 4: Secure Storage

**DO NOT commit .env.production to Git:**

```bash
# Verify .gitignore has entry
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "ensure production env is not committed"
```

---

## Part 4: Build & Test Production Build

### Step 1: Install Dependencies

```bash
# At project root
npm install
# or
yarn install
```

### Step 2: Build Production Bundle

```bash
# Build all applications
npm run build
# or
yarn build
```

**Expected Output:**

```
Building cube-viewer...
✓ Built in 45s
Building deploy-cube...
✓ Built in 38s
Building api-server...
✓ Built in 22s
Total: 3 apps built successfully
```

### Step 3: Preview Production Locally

```bash
# Preview the build locally
npm run preview
# or
yarn preview

# Access at: http://localhost:5000
```

### Step 4: Test ENS Payment Flow

1. **Wallet Connection:**
   - Connect MetaMask (Sepolia testnet)
   - Verify wallet address displays

2. **ENS Resolution:**
   - Select "ENS Payment" option
   - Enter: `cube-pay.eth`
   - Verify domain resolves to address

3. **Payment Validation:**
   - Enter payment amount
   - Select network (Ethereum Sepolia)
   - Verify validation messages

4. **Transaction:**
   - Execute payment (use testnet funds)
   - Verify transaction hash displays
   - Check block explorer confirmation

---

## Part 5: Deploy to Production Hosting

### Option A: Deploy to Vercel (Recommended)

1. **Connect Repository:**

```bash
npm install -g vercel
vercel link
```

2. **Configure Environment:**
   - In Vercel dashboard: **Settings** > **Environment Variables**
   - Add production values from `.env.production`

3. **Deploy:**

```bash
vercel --prod
```

### Option B: Deploy to Netlify

1. **Connect Repository:**
   - Go to netlify.com
   - Click "New site from Git"
   - Connect GitHub repository

2. **Configure Build:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   - In Netlify: **Settings** > **Build & deploy** > **Environment**
   - Add all variables from `.env.production`

4. **Deploy:**
   - Push to main branch
   - Netlify auto-deploys

### Option C: Deploy to Custom Server

```bash
# Build
npm run build

# Upload dist folders to server
scp -r apps/*/dist/ user@server:/var/www/cubepay/

# Configure nginx/apache
# Set up SSL certificate (Let's Encrypt)
# Configure domain DNS
```

---

## Part 6: Smoke Tests (Post-Deployment)

### 1. Verify Application Loads

```bash
curl -I https://your-production-domain.com
# Expected: 200 OK
```

### 2. Test ENS Payment Flow

1. Visit production app
2. Connect wallet to Sepolia testnet
3. Select "ENS Payment"
4. Resolve cube-pay.eth
5. Execute test payment

### 3. Check Database Connectivity

```sql
-- Verify deployment in Supabase production
SELECT COUNT(*) as agent_count FROM deployed_objects;

-- Check payment sessions
SELECT * FROM ar_qr_codes ORDER BY created_at DESC LIMIT 5;
```

### 4. Monitor for Errors

- Check browser console for JavaScript errors
- Check Supabase logs: **Project** > **Database** > **Monitor**
- Check API response times

---

## Part 7: Production Monitoring Setup

### Enable Monitoring

1. **Supabase Monitoring:**
   - Go to **Project** > **Monitor** > **Database**
   - Set up alerts for high query times

2. **Error Tracking (Sentry):**

```bash
npm install @sentry/react @sentry/tracing
```

3. **Analytics (Google Analytics):**
   - Add GA tracking code to production domain

---

## Part 8: Troubleshooting

### Issue: "Unable to resolve cube-pay.eth"

**Solution:**

```env
# Verify ENS RPC is correct for network
VITE_ENS_RESOLVER_NETWORK=sepolia  # or mainnet
VITE_ENS_RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_KEY
```

### Issue: "Payment failed - wallet not connected"

**Solution:**

- Verify user selected correct network (Sepolia for testnet)
- Check wallet has sufficient test ETH/USDC balance
- Verify ThirdWeb credentials are valid

### Issue: "Database connection failed"

**Solution:**

```env
# Verify Supabase URL is correct
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=correct-api-key
```

### Issue: "Slow ENS resolution"

**Solution:**

- ENS client caches results for 1 hour
- Clear cache if needed: `ensPaymentService.clearCache()`
- Check RPC endpoint load

---

## Part 9: Rollback Plan

If issues occur in production:

1. **Revert Code:**

```bash
git revert HEAD
git push origin main  # Auto-deploys if CI/CD configured
```

2. **Revert Database:**

```sql
-- Backup current state
-- Restore from snapshot in Supabase

-- Or manually:
DELETE FROM ar_qr_codes WHERE created_at > '2026-02-04';
```

3. **Revert Environment:**

```bash
# Restore previous .env.production values
# Re-deploy with old credentials
```

---

## Part 10: Next Steps

### Short Term (Week 1)

- [ ] Monitor production for issues
- [ ] Collect user feedback
- [ ] Fix any critical bugs

### Medium Term (Month 1)

- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Implement automated testing
- [ ] Add more ENS domains per agent

### Long Term (Quarter 1)

- [ ] Migrate from Sepolia testnet to mainnet
- [ ] Add more blockchains (Polygon, Arbitrum, etc.)
- [ ] Implement advanced ENS features (multiple addresses per chain)

---

## Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **ENS Documentation:** https://docs.ens.domains
- **ThirdWeb Docs:** https://portal.thirdweb.com
- **Vercel Deployment:** https://vercel.com/docs

---

## Contact

For deployment issues or questions:

- Create GitHub issue in cube-pay-hacks
- Contact DevOps team
- Check deployment logs in Vercel/Netlify dashboard

---

**Deployment Date:** ********\_********  
**Deployed By:** ********\_********  
**Status:** 🟢 Production Ready
