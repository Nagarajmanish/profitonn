import React from "react";

/**
 * TimerDisplay component for showing the timer.
 * @param {number} timeLeft - Time left in seconds
 * @param {boolean} isGameOver - If the game is over
 * @param {function} formatTime - Function to format seconds to MM:SS
 * @param {boolean} isMobile - If rendering for mobile
 */
const TimerDisplay = ({ timeLeft, isGameOver, formatTime, isMobile }) => {
  if (isMobile) {
    return (
      <div className="lg:hidden">
        {!isGameOver && timeLeft > 0 ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "600",
              color: "#E5E7EB",
              textShadow:
                "2px 2px 12px rgba(255, 99, 71, 0.6), 0 0 14px rgba(255, 99, 71, 0.4)",
              maxWidth: "220px",
              margin: "0 auto",
            }}
          >
            {formatTime(timeLeft)}
          </div>
        ) : (
          <h1 className="font-bold text-2xl text-red-600 mt-5 text-center animate-blink">
            Time&apos;s Up!
          </h1>
        )}
      </div>
    );
  }
  // Desktop
  return (
    <div className="hidden lg:block mt-8">
      {!isGameOver && timeLeft > 0 ? (
        <>
          <h1
            className="text-center font-bold"
            style={{
              fontSize: "40px",
              color: "#F9F8EB",
              textShadow: "3px 3px 6px rgba(0, 0, 0, 0.7)",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Time Left:
          </h1>
          <div
            style={{
              textAlign: "center",
              fontSize: "50px",
              fontWeight: "700",
              color: "#E5E7EB",
              textShadow:
                "2px 2px 8px rgba(255, 99, 71, 0.6), 0 0 25px rgba(0, 0, 0, 0.7)",
              maxWidth: "220px",
              margin: "0 auto",
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </>
      ) : (
        <h1 className="font-bold text-4xl text-red-400 mt-5 text-center">
          Time&apos;s Up!
        </h1>
      )}
    </div>
  );
};

export default TimerDisplay; 