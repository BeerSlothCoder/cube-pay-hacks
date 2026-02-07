import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import App from "./App.tsx";
import "./index.css";

const clientId =
  import.meta.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id-here";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider clientId={clientId} activeChain="ethereum">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>
);
