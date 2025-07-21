import React from "react";

/**
 * BuySellControls component for buy/sell selection and units input.
 * @param {string} selectButton - 'buy' | 'sell' | null
 * @param {function} onSelect - callback for selecting buy/sell
 * @param {number} units - current units value
 * @param {string|number} inputValue - value for the input field
 * @param {function} onInputChange - handler for input change
 * @param {function} onBlur - handler for input blur
 * @param {function} onIncrease - handler for increment
 * @param {function} onDecrease - handler for decrement
 * @param {number|string} askPrice - ask price to show on sell
 * @param {number|string} bidPrice - bid price to show on buy
 * @param {boolean} disabled - disables the controls
 */
const BuySellControls = ({
  selectButton,
  onSelect,
  units,
  inputValue,
  onInputChange,
  onBlur,
  onIncrease,
  onDecrease,
  askPrice,
  bidPrice,
  disabled = false,
}) => (
  <div className="w-full flex flex-col items-center bg-zinc-950 border border-slate-700 rounded-lg py-4 px-2">
    <div className="flex w-full gap-2 mb-4">
      <button
        onClick={() => onSelect("sell")}
        className={`flex-1 h-16 rounded-md border-2 text-center text-lg font-semibold transition-colors duration-50 ${
          selectButton === "sell"
            ? "bg-transparent text-red-500 border-red-500"
            : "bg-transparent text-red-400 border-red-600"
        } hover:bg-red-900 hover:text-white`}
        disabled={disabled}
      >
        <span>Sell</span>
        <br />
        <span className="text-xs font-normal">{askPrice}</span>
      </button>
      <button
        onClick={() => onSelect("buy")}
        className={`flex-1 h-16 rounded-md border-2 text-center text-lg font-semibold transition-colors duration-50 ${
          selectButton === "buy"
            ? "bg-transparent text-blue-500 border-blue-500"
            : "bg-transparent text-blue-400 border-blue-600"
        } hover:bg-blue-900 hover:text-white`}
        disabled={disabled}
      >
        <span>Buy</span>
        <br />
        <span className="text-xs font-normal">{bidPrice}</span>
      </button>
    </div>
    <div className="flex items-center w-full mb-2">
      <input
        className="w-20 text-slate-200 bg-slate-900 h-10 text-center rounded-l-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="0.01"
        step="0.01"
        type="number"
        inputMode="decimal"
        value={inputValue}
        onChange={onInputChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      <span className="ml-2 text-xs text-slate-300">units</span>
      <div className="flex flex-col ml-2">
        <button onClick={onIncrease} className="text-slate-400 hover:bg-slate-700 rounded-t-md px-2" disabled={disabled}>
          +
        </button>
        <button onClick={onDecrease} className="text-slate-400 hover:bg-slate-700 rounded-b-md px-2" disabled={disabled}>
          -
        </button>
      </div>
    </div>
  </div>
);

export default BuySellControls; 