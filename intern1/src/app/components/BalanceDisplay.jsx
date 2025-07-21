import React from "react";

/**
 * BalanceDisplay component for showing user and opponent/bot balances.
 * @param {number} dynamicBalance - User's balance
 * @param {number} opponentBalance - Opponent's balance
 * @param {number} botBalance - Bot's balance (if any)
 * @param {string} oppName - Opponent's name
 * @param {object} oppData - Opponent's data (with oppName)
 * @param {boolean} isDynamicHigher - If user's balance is higher
 * @param {boolean} isGameOver - If the game is over
 * @param {boolean} isFullScreen - If in fullscreen mode
 */
const BalanceDisplay = ({
  dynamicBalance,
  opponentBalance,
  botBalance,
  oppName,
  oppData = {},
  isDynamicHigher,
  isGameOver,
  isFullScreen,
}) => {
  return (
    <div className={`flex justify-around gap-x-2 ${isFullScreen ? "flex" : "hidden sm:flex"}`}>
      {/* User Balance */}
      <div
        className={`flex items-center border-[1px] justify-center h-[7vh] gap-x-4 w-40 rounded-md ${
          dynamicBalance !== null && opponentBalance !== null
            ? dynamicBalance > opponentBalance
              ? "border-green-500 animate-pulseGreen"
              : "border-red-500 animate-pulseRed"
            : "border-green-500 animate-pulseGreen"
        }`}
      >
        <span>You</span>
        <div className="font-bold flex justify-center items-center">
          <div className="text-xl font-thin">$</div>
          {dynamicBalance !== null ? Number(dynamicBalance).toFixed(3) : "-----"}
        </div>
      </div>
      {/* Opponent or Bot Balance */}
      {((opponentBalance !== null && (oppData.oppName || oppName)) || botBalance) && (
        <div className="flex justify-around items-center rounded-md bg-transparent border-slate-600 border-2 h-[7vh] w-48">
          <span>
            {opponentBalance !== null
              ? "Opponent"
              : botBalance !== null
              ? `Bot`
              : "-------"}
          </span>
          <div className="font-bold flex justify-center items-center">
            <span>
              {opponentBalance !== null
                ? `$${Number(opponentBalance).toFixed(3)}`
                : botBalance !== null
                ? ` $${Number(botBalance).toFixed(3)}`
                : "-------"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay; 