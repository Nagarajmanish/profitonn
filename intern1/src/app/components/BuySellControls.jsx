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
  <div className="flex justify-center gap-x-1 w-full mt-2">
    <button
      onClick={() => onSelect("sell")}
      className={`transition-colors duration-50 p-3 w-[45%] h-16 rounded-lg border-2 text-center ${
        selectButton === "sell"
          ? "bg-red-600 text-white border-red-500"
          : "bg-gray-950 text-red-400 border-red-600"
      } hover:bg-red-600 hover:text-slate-100`}
      disabled={disabled}
    >
      <span>Sell</span>
      <br />
      <span className="text-[14px]">{askPrice}</span>
    </button>
    <button
      onClick={() => onSelect("buy")}
      className={`transition-colors duration-50 p-3 w-[45%] h-16 rounded-lg border-2 text-center ${
        selectButton === "buy"
          ? "bg-blue-600 text-white border-blue-500"
          : "bg-gray-950 text-blue-400 border-blue-600"
      } hover:bg-blue-600 hover:text-slate-100`}
      disabled={disabled}
    >
      <span>Buy</span>
      <br />
      <span className="text-[14px]">{bidPrice}</span>
    </button>
    <div className="flex flex-col items-center ml-2">
      <input
        className="w-16 text-slate-200 bg-slate-900 h-12 no-spinner text-center"
        placeholder="0.01"
        step="0.01"
        type="number"
        inputMode="decimal"
        value={inputValue}
        onChange={onInputChange}
        onBlur={onBlur}
        style={{ border: "none", outline: "none", MozAppearance: "textfield" }}
        disabled={disabled}
      />
      <div className="flex flex-col text-2xl font-semibold mt-1">
        <button onClick={onIncrease} className="text-slate-400 hover:bg-slate-700 opacity-80" disabled={disabled}>
          +
        </button>
        <button onClick={onDecrease} className="text-slate-400 hover:bg-slate-700 opacity-60" disabled={disabled}>
          -
        </button>
      </div>
      <span className="text-xs mt-1">units</span>
    </div>
  </div>
);

export default BuySellControls; 