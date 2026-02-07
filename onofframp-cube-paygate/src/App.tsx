import { Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BuyCrypto from "./pages/BuyCrypto";
import SellCrypto from "./pages/SellCrypto";
import Prices from "./pages/Prices";
import HowItWorks from "./pages/HowItWorks";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";

const CLIENT_ID = "your-thirdweb-client-id"; // Replace with actual client ID

function App() {
  return (
    <ThirdwebProvider clientId={CLIENT_ID} activeChain="ethereum">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyCrypto />} />
          <Route path="/sell" element={<SellCrypto />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1A1F2E",
            color: "#fff",
            border: "1px solid #00FF88",
          },
        }}
      />
    </ThirdwebProvider>
  );
}

export default App;
