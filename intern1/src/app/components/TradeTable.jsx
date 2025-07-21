import React from "react";

/**
 * TradeTable component for displaying Open, Pending, or Closed trades.
 * @param {Array} trades - Array of trade objects to display
 * @param {String} type - 'open' | 'pending' | 'closed'
 * @param {Number} askPrice - Current ask price
 * @param {Number} bidPrice - Current bid price
 * @param {Array} allProfit - Array of {id, profit} for open trades
 * @param {Function} onCloseTrade - Callback for closing a trade (open only)
 * @param {Function} onCancelTrade - Callback for canceling a pending trade
 */
const TradeTable = ({
  trades = [],
  type = "open",
  askPrice,
  bidPrice,
  allProfit = [],
  onCloseTrade,
  onCancelTrade,
}) => {
  // Helper to get profit for a trade
  const getProfit = (trade) => {
    const profitData = allProfit.find((p) => p.id === trade.id);
    return profitData ? profitData.profit.toFixed(3) : "0.00";
  };

  // Helper to format time
  const formatTime = (date, opts = {}) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", opts);
  };

  // Table headers based on type
  const headers = [
    "Symbol",
    "Sell/Buy",
    "Volume",
    ...(type === "open" ? ["CloseTrade"] : []),
    ...(type === "pending" ? ["CancelOrder"] : []),
    ...(type === "open" || type === "closed" ? ["Profit"] : []),
    "Margin",
    "OpeningPrice",
    ...(type === "closed" ? ["ClosingPrice"] : []),
    ...(type === "open" || type === "pending" ? ["CurrentPrice"] : []),
    ...(type === "open" || type === "closed" ? ["OpeningTime"] : []),
    ...(type === "closed" ? ["ClosingTime"] : []),
    "TakeProfit",
    "StopLoss",
  ];

  return (
    <div className="overflow-y-auto max-h-[190px] custom-scrollbar overflow-x-auto text-[13px]">
      {/* Header */}
      <div className="flex bg-gray-800 text-slate-300 text-[0.7rem] h-8 sticky top-0 gap-x-2">
        {headers.map((h) => (
          <div key={h} className="min-w-[3rem] p-2 text-center flex-1">
            {h}
          </div>
        ))}
      </div>
      {/* Content */}
      {trades.length === 0 ? (
        <div className="text-center text-slate-600 text-lg p-3">
          {type === "open"
            ? "No Open Trade"
            : type === "pending"
            ? "No Pending Trades"
            : "No Trade History"}
        </div>
      ) : (
        <div className="flex flex-col">
          {trades
            .slice()
            .sort((a, b) => {
              if (type === "closed" || type === "pending") {
                return new Date(b.closingtime) - new Date(a.closingtime);
              }
              return 0;
            })
            .reverse() // For open trades, show latest first
            .map((row, index) => {
              const profitOrLoss = getProfit(row);
              const openTime = formatTime(row.openingtime, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              });
              const closeTime = formatTime(row.closingtime, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              });
              return (
                <div key={index} className="flex gap-x-2">
                  <div className="min-w-[3rem] p-2 flex justify-center flex-1">{row.symbol}</div>
                  <div className="min-w-[3rem] p-2 text-center flex-1">{row.buyorsell}</div>
                  <div className="min-w-[3rem] p-2 text-center flex-1">{row.unitsorlots}</div>
                  {type === "open" && (
                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      <button
                        onClick={() => onCloseTrade && onCloseTrade(row.id, profitOrLoss, row.buyorsell)}
                        className={`h-6 rounded-full min-w-[5rem] ${
                          row.buyorsell === "buy"
                            ? "bg-blue-700 hover:bg-blue-600"
                            : "bg-red-700 hover:bg-red-500"
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  )}
                  {type === "pending" && (
                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      <button
                        onClick={() => onCancelTrade && onCancelTrade(row.id)}
                        className={`h-6 rounded-full min-w-[5rem] ${
                          row.buyorsell === "buy"
                            ? "bg-blue-700 hover:bg-blue-600"
                            : "bg-red-700 hover:bg-red-500"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {(type === "open" || type === "closed") && (
                    <div className="min-w-[3rem] p-2 text-center flex-1">
                      <span
                        className={
                          profitOrLoss < 0 ? "text-red-500" : "text-green-600"
                        }
                      >
                        {profitOrLoss > 0 ? "+" : null}
                        {profitOrLoss}
                      </span>
                    </div>
                  )}
                  <div className="min-w-[3rem] p-2 text-center flex-1">{row.margin}</div>
                  <div className="min-w-[5rem] p-2 text-center flex-1">{row.openingprice}</div>
                  {type === "closed" && (
                    <div className="min-w-[5rem] p-2 text-center flex-1">{row.closingprice}</div>
                  )}
                  {(type === "open" || type === "pending") && (
                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      {row.buyorsell === "buy" ? askPrice : bidPrice}
                    </div>
                  )}
                  {(type === "open" || type === "closed") && (
                    <div className="min-w-[7rem] p-2 text-[12px] whitespace-nowrap flex-1">
                      {openTime}
                    </div>
                  )}
                  {type === "closed" && (
                    <div className="min-w-[7rem] p-2 text-[10px] whitespace-nowrap flex-1">
                      {closeTime}
                    </div>
                  )}
                  <div className="min-w-[5rem] p-2 text-center flex-1">
                    {row.takeprofitvalue ?? "- - - -"}
                  </div>
                  <div className="min-w-[5rem] p-2 text-center flex-1">
                    {row.stoplossvalue ?? "- - - -"}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default TradeTable; 