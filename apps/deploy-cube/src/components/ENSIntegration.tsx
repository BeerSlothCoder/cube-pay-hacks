import React, { useState, useEffect } from "react";
import { Globe, Check, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { createENSClient } from "@cubepay/wallet-connector";
import type { ENSAgentProfile } from "@cubepay/wallet-connector";

interface ENSIntegrationProps {
  enabled: boolean;
  domain: string;
  onEnabledChange: (enabled: boolean) => void;
  onDomainChange: (domain: string) => void;
}

export const ENSIntegration: React.FC<ENSIntegrationProps> = ({
  enabled,
  domain,
  onEnabledChange,
  onDomainChange,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [ensProfile, setEnsProfile] = useState<ENSAgentProfile | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const ensClient = createENSClient();

  // Resolve ENS domain when it changes (debounced)
  useEffect(() => {
    if (!enabled || !domain.endsWith(".eth")) {
      setEnsProfile(null);
      setResolveError(null);
      return;
    }

    const timer = setTimeout(() => {
      resolveENS();
    }, 500);

    return () => clearTimeout(timer);
  }, [domain, enabled]);

  const resolveENS = async () => {
    if (!domain.endsWith(".eth")) {
      setResolveError("Domain must end with .eth");
      return;
    }

    setIsResolving(true);
    setResolveError(null);

    try {
      const address = await ensClient.resolveAddress(domain);
      if (!address) {
        setResolveError("ENS domain not found or not registered");
        setEnsProfile(null);
        setIsResolving(false);
        return;
      }

      const profile = await ensClient.getAgentProfile(domain);
      setEnsProfile(profile);
      setResolveError(null);
    } catch (error) {
      console.error("ENS resolution error:", error);
      setResolveError(
        error instanceof Error ? error.message : "Failed to resolve ENS",
      );
      setEnsProfile(null);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${enabled ? "bg-purple-500/20" : "bg-gray-700"}`}
          >
            <Globe
              className={`w-5 h-5 ${enabled ? "text-purple-400" : "text-gray-500"}`}
            />
          </div>
          <div>
            <h3 className="text-cream font-semibold">ENS Integration</h3>
            <p className="text-sm text-gray-400">
              Link your agent to an ENS domain
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            enabled ? "bg-purple-600" : "bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* ENS Info */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-purple-400 mb-2">
                  What is ENS Integration?
                </p>
                <p className="mb-2">
                  ENS (Ethereum Name Service) allows users to pay your agent
                  using a human-readable name like{" "}
                  <span className="text-purple-300 font-mono">
                    yourname.eth
                  </span>{" "}
                  instead of a long wallet address.
                </p>
                <p>
                  Your agent can also read payment preferences, multi-chain
                  addresses, and profile info from ENS text records.
                </p>
              </div>
            </div>
          </div>

          {/* ENS Domain Input */}
          <div>
            <label className="block text-sm font-medium text-cream mb-2">
              ENS Domain
            </label>
            <div className="relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => onDomainChange(e.target.value.toLowerCase())}
                placeholder="yourname.eth"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-cream placeholder-gray-500 focus:outline-none focus:border-purple-500 pr-10"
              />
              {isResolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              )}
              {!isResolving && ensProfile && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter your ENS domain (must end with .eth)
            </p>

            {/* Resolution Error */}
            {resolveError && (
              <div className="mt-2 p-3 bg-red-900/20 border border-red-500 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{resolveError}</p>
              </div>
            )}
          </div>

          {/* ENS Profile Preview */}
          {ensProfile && (
            <div className="p-4 bg-gray-800 rounded-lg border border-purple-500/30">
              <h4 className="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                ENS Profile Resolved
              </h4>

              <div className="space-y-3">
                {/* Avatar */}
                {ensProfile.avatar && (
                  <div className="flex items-center gap-3">
                    <img
                      src={ensProfile.avatar}
                      alt={domain}
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                    />
                    <div>
                      <div className="text-cream font-semibold">{domain}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {ensProfile.address.slice(0, 6)}...
                        {ensProfile.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {ensProfile.bio && (
                  <div>
                    <span className="text-xs text-gray-400">Bio:</span>
                    <p className="text-sm text-gray-300 mt-1">
                      {ensProfile.bio}
                    </p>
                  </div>
                )}

                {/* Payment Preferences */}
                {ensProfile.paymentPreferences && (
                  <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                    <div className="text-xs font-semibold text-purple-300 mb-2">
                      Payment Preferences
                    </div>
                    <div className="space-y-1 text-xs">
                      {ensProfile.paymentPreferences.preferredChain && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Preferred Chain:
                          </span>
                          <span className="text-cream">
                            {ensProfile.paymentPreferences.preferredChain}
                          </span>
                        </div>
                      )}
                      {ensProfile.paymentPreferences.minPayment && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Payment:</span>
                          <span className="text-cream">
                            {ensProfile.paymentPreferences.minPayment} USDC
                          </span>
                        </div>
                      )}
                      {ensProfile.paymentPreferences.maxPayment && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Payment:</span>
                          <span className="text-cream">
                            {ensProfile.paymentPreferences.maxPayment} USDC
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(ensProfile.twitter ||
                  ensProfile.github ||
                  ensProfile.website) && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">
                      Social Links:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ensProfile.twitter && (
                        <a
                          href={`https://twitter.com/${ensProfile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded text-xs text-blue-300 hover:bg-blue-500/30 flex items-center gap-1"
                        >
                          Twitter
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {ensProfile.github && (
                        <a
                          href={`https://github.com/${ensProfile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:bg-gray-600 flex items-center gap-1"
                        >
                          GitHub
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {ensProfile.website && (
                        <a
                          href={ensProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-300 hover:bg-green-500/30 flex items-center gap-1"
                        >
                          Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Content Hash */}
                {ensProfile.contentHash && (
                  <div>
                    <span className="text-xs text-gray-400">Content Hash:</span>
                    <p className="text-xs text-gray-500 font-mono break-all mt-1">
                      {ensProfile.contentHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ENS Benefits */}
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              Benefits of ENS
            </h4>
            <ul className="space-y-1 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Users can send payments using your memorable .eth name
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Store payment preferences in ENS text records</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Multi-chain address resolution - one name, many chains
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Decentralized profile with avatar, bio, and social links
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Enhanced trust and credibility for your agent</span>
              </li>
            </ul>
          </div>

          {/* Setup Guide */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              How to Set Up ENS
            </h4>
            <ol className="space-y-2 text-xs text-gray-300 list-decimal list-inside">
              <li>
                Register your .eth domain at{" "}
                <a
                  href="https://app.ens.domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  app.ens.domains
                </a>
              </li>
              <li>Set your wallet address as the primary address</li>
              <li>
                Add text records for payment preferences (optional):
                <ul className="ml-6 mt-1 space-y-1 list-disc">
                  <li className="text-gray-400">
                    <code className="bg-gray-800 px-1 rounded">
                      com.cubepay.preferredChain
                    </code>{" "}
                    - ethereum, base, etc.
                  </li>
                  <li className="text-gray-400">
                    <code className="bg-gray-800 px-1 rounded">
                      com.cubepay.minPayment
                    </code>{" "}
                    - minimum payment amount
                  </li>
                  <li className="text-gray-400">
                    <code className="bg-gray-800 px-1 rounded">
                      com.cubepay.maxPayment
                    </code>{" "}
                    - maximum payment amount
                  </li>
                </ul>
              </li>
              <li>Set avatar, bio, and social links in ENS records</li>
              <li>Enter your domain above and verify it resolves correctly</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};
