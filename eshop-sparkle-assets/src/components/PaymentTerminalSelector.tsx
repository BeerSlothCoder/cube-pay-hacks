import React, { useState, useEffect } from "react";
import { X, MapPin, CreditCard, Wallet } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface PaymentTerminal {
  id: string;
  name: string;
  agent_type: "pos_terminal" | "artm_terminal";
  location: { lat: number; lng: number };
  screen_position?: { x: number; y: number };
}

interface PaymentTerminalSelectorProps {
  amount: number;
  onClose: () => void;
  onComplete: () => void;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
);

export const PaymentTerminalSelector: React.FC<
  PaymentTerminalSelectorProps
> = ({ amount, onClose, onComplete }) => {
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePayment = () => {
    if (!selectedTerminal) {
      alert("Please select a payment terminal");
      return;
    }

    const terminal = terminals.find((t) => t.id === selectedTerminal);

    // Simulate payment processing
    alert(
      `Processing payment of $${amount.toFixed(2)} via ${terminal?.name}...`,
    );

    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-sparkle-600 to-purple-600 text-white">
            <div>
              <h2 className="text-2xl font-bold">Select Payment Terminal</h2>
              <p className="text-sm text-white/80 mt-1">
                Choose a nearby CubePay terminal to complete your purchase
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading available terminals...
              </div>
            ) : terminals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
                          ? "border-sparkle-600 bg-sparkle-50"
                          : "border-gray-200 hover:border-sparkle-300"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                        p-3 rounded-lg
                        ${
                          terminal.agent_type === "artm_terminal"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
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
                        <h3 className="font-semibold text-lg">
                          {terminal.name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
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
                        <div className="text-sparkle-600">
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
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-2xl font-bold text-sparkle-600">
                ${amount.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedTerminal}
              className="w-full bg-sparkle-600 hover:bg-sparkle-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Complete Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
