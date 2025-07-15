import React, { useState, useEffect } from "react";
import axios from "axios";

const Timer = ({ startTime, onTimeEnd, userId, username, gameId }) => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // Timer duration in seconds (15 minutes)
  const [currentMinute, setCurrentMinute] = useState(0); // Track current minute interval

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const gameStart = new Date(startTime).getTime();
      const elapsedTime = Math.floor((now - gameStart) / 1000) - 5; // Subtract 5 seconds for the buffer
      const remainingTime = Math.max(5 * 60 - elapsedTime, 0); // Ensure no negative time
      setTimeLeft(remainingTime);

      if (remainingTime === 0) {
        onTimeEnd(); // Notify parent when the timer reaches zero
      }

      // Calculate the current minute of the game
      const currentMinuteInterval = Math.floor(elapsedTime / 60);
      if (currentMinuteInterval !== currentMinute && currentMinuteInterval >= 0) {
        setCurrentMinute(currentMinuteInterval);
        sendNetActionToBackend(currentMinuteInterval); // Trigger backend request
      }
    };

    calculateTimeLeft(); // Initial calculation
    const interval = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [startTime, onTimeEnd, currentMinute]);

  // Format time as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // Backend request for net action and net volume action
  const sendNetActionToBackend = async (minute) => {
    try {
      const response = await axios.post("/api/store-trade-action-data", {
        startTime,
        currentMinute: minute,
        userId,
        username,
        gameId,
      });
      console.log("Backend response:", response.data);
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: "40px",
        fontWeight: "bold",
        color: "white",
      }}
    >
      {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;
