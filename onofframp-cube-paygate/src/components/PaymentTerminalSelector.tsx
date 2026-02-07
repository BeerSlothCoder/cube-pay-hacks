import { useState, useEffect } from "react";
import { X, MapPin, CreditCard, Wallet } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";

interface PaymentTerminal {
  id: string;
  name: string;
  agent_type: "pos_terminal" | "artm_terminal";
  location: { lat: number; lng: number };
  screen_position?: { x: number; y: number };
}

interface PaymentTerminalSelectorProps {
  amount: number;
  currency: string;
  onClose: () => void;
  onComplete: () => void;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);

export default function PaymentTerminalSelector({
  amount,
  currency,
  onClose,
  onComplete,
}: PaymentTerminalSelectorProps) {
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadTerminals();
  }, []);

  const loadTerminals = async () => {
    try {
      const { data, error } = await supabase
        .from("deployed_ar_agents")
        .select("*")
        .in("agent_type", ["pos_terminal", "artm_terminal"]);

      if (error) throw error;
      setTerminals(data || []);
    } catch (error) {
      console.error("Error loading terminals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedTerminal) {
      alert("Please select a payment terminal");
      return;
    }

    const terminal = terminals.find((t) => t.id === selectedTerminal);
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onComplete();
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1F2E] rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-crypto-600">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-crypto-600/30 bg-gradient-to-r from-crypto-600/20 to-purple-600/20">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Select Payment Terminal
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Choose a nearby CubePay terminal to complete your transaction
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading available terminals...
              </div>
            ) : terminals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No payment terminals available</p>
                <p className="text-sm mt-2">Please try again later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {terminals.map((terminal) => (
                  <div
                    key={terminal.id}
                    onClick={() => setSelectedTerminal(terminal.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedTerminal === terminal.id
                          ? "border-crypto-500 bg-crypto-500/10"
                          : "border-gray-700 hover:border-crypto-600 bg-gray-800/50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                        p-3 rounded-lg
                        ${
                          terminal.agent_type === "artm_terminal"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-crypto-500/20 text-crypto-400"
                        }
                      `}
                      >
                        {terminal.agent_type === "artm_terminal" ? (
                          <Wallet className="w-6 h-6" />
                        ) : (
                          <CreditCard className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-white">
                          {terminal.name}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {terminal.agent_type.replace("_", " ")}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {terminal.location.lat.toFixed(4)},{" "}
                            {terminal.location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {selectedTerminal === terminal.id && (
                        <div className="text-crypto-400">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-crypto-600/30 bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-2xl font-bold text-crypto-400">
                {amount.toFixed(4)} {currency}
              </span>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!selectedTerminal || processing}
              className="w-full"
            >
              {processing ? "Processing..." : "Complete Payment"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
