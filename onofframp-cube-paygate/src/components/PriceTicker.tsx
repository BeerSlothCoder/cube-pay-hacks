import { priceTicker } from "../data/mockData";
import { formatCurrency, formatPercentage } from "../lib/utils";

export default function PriceTicker() {
  return (
    <div className="bg-dark-bg border-b border-cube-green/20 text-white py-2 overflow-hidden">
      <div className="animate-scroll whitespace-nowrap">
        <div className="inline-flex space-x-8">
          {[...priceTicker, ...priceTicker].map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="inline-flex items-center space-x-2"
            >
              <span className="font-medium text-cube-green">{item.symbol}</span>
              <span className="text-white">{formatCurrency(item.price)}</span>
              <span
                className={`text-sm ${
                  item.change >= 0 ? "text-success" : "text-error"
                }`}
              >
                {formatPercentage(item.change)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
