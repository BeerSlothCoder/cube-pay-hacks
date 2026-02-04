import React, { useState, useEffect } from 'react';
import {
  Star,
  StarOff,
  Trash2,
  Plus,
  Clock,
  TrendingUp,
} from 'lucide-react';

export interface ENSShortcut {
  id: string;
  domain: string;
  address: string;
  amount: string;
  chain: number;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
  isFavorite: boolean;
}

export interface ENSPaymentShortcutsProps {
  shortcuts: ENSShortcut[];
  onSelectShortcut: (shortcut: ENSShortcut) => void;
  onAddShortcut: () => void;
  onRemoveShortcut: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  maxVisible?: number;
}

const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Sepolia',
  84532: 'Base',
  421614: 'Arbitrum',
};

const CHAIN_COLORS: Record<number, string> = {
  11155111: 'bg-blue-100 text-blue-800',
  84532: 'bg-indigo-100 text-indigo-800',
  421614: 'bg-purple-100 text-purple-800',
};

export const ENSPaymentShortcuts: React.FC<ENSPaymentShortcutsProps> = ({
  shortcuts,
  onSelectShortcut,
  onAddShortcut,
  onRemoveShortcut,
  onToggleFavorite,
  maxVisible = 5,
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'favorite' | 'frequent'>('recent');
  const [displayShortcuts, setDisplayShortcuts] = useState<ENSShortcut[]>([]);

  // Sort and filter shortcuts
  useEffect(() => {
    let sorted = [...shortcuts];

    switch (sortBy) {
      case 'favorite':
        sorted.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          return (b.lastUsed || 0) - (a.lastUsed || 0);
        });
        break;
      case 'frequent':
        sorted.sort((a, b) => b.useCount - a.useCount);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => (b.lastUsed || b.createdAt) - (a.lastUsed || a.createdAt));
        break;
    }

    setDisplayShortcuts(sorted.slice(0, maxVisible));
  }, [shortcuts, sortBy, maxVisible]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Quick Payments
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {shortcuts.length} saved • {shortcuts.filter((s) => s.isFavorite).length} favorites
          </p>
        </div>
        <button
          onClick={onAddShortcut}
          className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          title="Add new shortcut"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-800 pb-3">
        {(['recent', 'favorite', 'frequent'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              sortBy === option
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Shortcuts List */}
      <div className="space-y-2">
        {displayShortcuts.length > 0 ? (
          displayShortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="bg-gray-800 hover:bg-gray-750 rounded-lg p-3 flex items-center justify-between group transition-colors cursor-pointer"
              onClick={() => onSelectShortcut(shortcut)}
            >
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-amber-400 font-semibold truncate">
                    {shortcut.domain}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                      CHAIN_COLORS[shortcut.chain] || CHAIN_COLORS[11155111]
                    }`}
                  >
                    {CHAIN_NAMES[shortcut.chain] || 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">
                    {shortcut.amount} USDC
                  </span>

                  {shortcut.useCount > 0 && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {shortcut.useCount} times
                    </span>
                  )}

                  {shortcut.lastUsed && (
                    <span>{formatTime(shortcut.lastUsed)}</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                  {shortcut.address.slice(0, 6)}...{shortcut.address.slice(-4)}
                </p>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(shortcut.id);
                  }}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title={shortcut.isFavorite ? 'Unstar' : 'Star'}
                >
                  {shortcut.isFavorite ? (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <StarOff className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveShortcut(shortcut.id);
                  }}
                  className="p-1.5 hover:bg-red-900 hover:text-red-400 rounded transition-colors text-gray-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-2">No shortcuts yet</p>
            <button
              onClick={onAddShortcut}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Create your first quick payment
            </button>
          </div>
        )}
      </div>

      {/* More Link */}
      {shortcuts.length > maxVisible && (
        <button className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-300 font-semibold transition-colors border-t border-gray-800 pt-3">
          View all {shortcuts.length} shortcuts →
        </button>
      )}

      {/* Recent Used Indicator */}
      {shortcuts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Tip: Frequently used shortcuts appear first</p>
          <div className="bg-gray-800 rounded px-2 py-1.5">
            <p className="text-xs text-amber-400 font-mono">
              Total saved: {shortcuts.length} domains
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ENSPaymentShortcuts;
