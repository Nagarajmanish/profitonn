import React from "react";

/**
 * PerformancePopup component for demo trade session results.
 * @param {boolean} isOpen - Whether the popup is open
 * @param {Array} closedTrades - Array of closed trades
 * @param {number} dynamicBalance - User's balance
 * @param {number} initialFixedBalance - Initial balance
 * @param {function} onExit - Callback for exit button
 */
const PerformancePopup = ({ isOpen, closedTrades, dynamicBalance, initialFixedBalance, onExit }) => {
  if (!isOpen) return null;
  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="relative w-11/12 max-w-lg bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl p-8 glow-effect">
        <h1 className="mb-6 font-mono text-center text-4xl text-white font-semibold tracking-widest">
          Your Performance
        </h1>
        <div className="text-white space-y-6">
          <div className="flex justify-between">
            <span className="font-semibold text-indigo-400 text-lg">Total Trades:</span>
            <span className="text-lg text-yellow-300">{closedTrades.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-indigo-400 text-lg">Total Profit/Loss:</span>
            <span className={`text-lg ${dynamicBalance - initialFixedBalance < 0 ? "text-red-400" : "text-green-400"}`}>
              {(dynamicBalance - initialFixedBalance).toFixed(3)}
            </span>
          </div>
        </div>
        <div className="mt-8 flex justify-center w-full">
          <button
            onClick={onExit}
            className="px-8 py-3 w-2/4 text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformancePopup; 