import React from "react";
import ToogleButton from "./ToggleButton";

/**
 * OrderControl component for Pending, TakeProfit, StopLoss controls.
 * @param {string} label - Label for the control (e.g., 'Pending')
 * @param {boolean} isActive - If the toggle is active
 * @param {any} value - Value of the input
 * @param {function} onToggle - Toggle handler
 * @param {function} onChange - Input change handler
 * @param {function} onIncrease - Increase handler
 * @param {function} onDecrease - Decrease handler
 * @param {string} unitLabel - Unit label (e.g., 'USD')
 * @param {React.ReactNode} icon - Optional icon
 */
const OrderControl = ({
  label,
  isActive,
  value,
  onToggle,
  onChange,
  onIncrease,
  onDecrease,
  unitLabel = "USD",
  icon,
}) => (
  <div className="w-full flex flex-col items-start bg-zinc-950 border-b border-slate-800 py-1 px-2">
    <div className="flex items-center w-full h-10">
      <ToogleButton onToggle={onToggle} isActive={isActive} value={value} />
      <span className="ml-3 text-sm text-white font-normal">{label}</span>
      {icon && <span className="ml-2">{icon}</span>}
    </div>
    {isActive && (
      <div className="dropdown-content bg-zinc-950 text-white rounded w-full -mb-2 -mt-1">
        <div className="flex border border-slate-600 rounded w-full h-[32px]">
          <div className="w-[60%] h-full text-sm flex items-center justify-between">
            <input
              className="ml-1 bg-zinc-950 w-20 border-none outline-none"
              type="number"
              inputMode="decimal"
              placeholder={value === "" ? "" : "0"}
              value={value || ""}
              style={{ border: "none", outline: "none", MozAppearance: "textfield" }}
              onChange={onChange}
            />
            <span className="mr-1 text-xs">{unitLabel}</span>
          </div>
          <button
            onClick={onDecrease}
            className="w-[20%] h-full border-l border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
          >
            -
          </button>
          <button
            onClick={onIncrease}
            className="w-[20%] h-full border-l border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
          >
            +
          </button>
        </div>
      </div>
    )}
  </div>
);

export default OrderControl; 