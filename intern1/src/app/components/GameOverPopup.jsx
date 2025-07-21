import React from "react";

/**
 * GameOverPopup component for showing game results.
 * @param {boolean} isOpen - Whether the popup is open
 * @param {number} dynamicBalance - User's balance
 * @param {number} opponentBalance - Opponent's balance
 * @param {number} bidPrice
 * @param {number} askPrice
 * @param {string} gameCategory
 * @param {string|number} amount
 * @param {string|number} opponentBet
 * @param {string|number} yourBet
 * @param {function} toNumber - Utility to convert to number
 * @param {function} onExit - Callback for exit button
 */
const GameOverPopup = ({
  isOpen,
  dynamicBalance,
  opponentBalance,
  bidPrice,
  askPrice,
  gameCategory,
  amount,
  opponentBet,
  yourBet,
  toNumber,
  onExit,
}) => {
  if (!isOpen) return null;
  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative w-11/12 max-w-lg bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-3xl shadow-xl p-6 glow-effect">
        <h1 className="mb-4 font-mono text-center text-3xl text-white font-semibold tracking-widest">
          Game Results
        </h1>
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="text-center">
            <div className="text-gray-400 text-sm font-light">Your Balance</div>
            <div className="font-bold font-mono text-xl text-green-400 mt-2">
              {dynamicBalance !== null ? Number(dynamicBalance).toFixed(3) : "--"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm font-light">Opponent&apos;s Balance</div>
            <div className="font-bold font-mono text-xl text-red-400 mt-2">
              {opponentBalance !== null && !isNaN(opponentBalance)
                ? Number(opponentBalance).toFixed(3)
                : "--"}
            </div>
          </div>
        </div>
        <div className="text-center text-white mb-6">
          {dynamicBalance > opponentBalance && bidPrice !== null && askPrice !== null && dynamicBalance !== 0 ? (
            <div>
              <p className="text-green-500 text-xl font-semibold mb-2">🎉 Victory!</p>
              <p className="text-gray-300 text-sm">
                You won by {(dynamicBalance - opponentBalance).toFixed(3)}!
              </p>
              <p className="text-gray-400 text-xs mt-1">
                ₹
                {["bgchallenge", "plchallenge", "prchallenge"].includes(gameCategory)
                  ? 0.9 * toNumber(opponentBet)
                  : 0.9 * toNumber(amount)}
                {" "}has been transferred to your wallet.
              </p>
            </div>
          ) : dynamicBalance < opponentBalance && bidPrice !== null && askPrice !== null && dynamicBalance !== 0 ? (
            <div>
              <p className="text-red-500 text-xl font-semibold mb-2">😢 You Just Missed</p>
              <p className="text-gray-300 text-sm">Better luck next time!</p>
            </div>
          ) : Math.abs(dynamicBalance - opponentBalance) < 0.0001 && bidPrice !== null && askPrice !== null && dynamicBalance !== 0 ? (
            <div>
              <p className="text-yellow-400 text-xl font-semibold mb-2">🤝 It&apos;s a Tie!</p>
              <p className="text-gray-300 text-sm">No winners this time.</p>
            </div>
          ) : (
            <p className="text-yellow-400 text-lg font-medium animate-pulse">Fetching results...</p>
          )}
        </div>
        <div className="flex justify-center gap-6">
          <button
            onClick={onExit}
            className="w-[45%] font-mono text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg shadow-md"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverPopup; 