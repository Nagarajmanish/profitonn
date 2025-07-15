// "use client";
// import React, { createContext, useState, useEffect } from "react";
// import io from "socket.io-client";
// import Cookies from "js-cookie";

// const GameStatusContext = createContext();
// // const socket = io('wss://profitonn.com/', {
// //     path: '/ml-socket/socket.io',
// // });

// const socket = io("http://localhost:3001/");
// export const GameStatusProvider = ({ children }) => {
//   // Function to get cookies safely
//   const getCookie = (key, defaultValue) => {
//     if (typeof window !== "undefined") {
//       return Cookies.get(key) || defaultValue;
//     }
//     return defaultValue;
//   };

//   // State variables with initial values from cookies
//   const [gameStatus, setGameStatus] = useState(() =>
//     getCookie("gameStatus", "Waiting for the game to start...")
//   );
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(null);


//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     // Listen for gameStatus updates from the server
//     socket.on("gameStatus", (data) => {
//       setIsButtonDisabled(data.isButtonDisabled);
//       setTimeRemaining(data.remainingTime);
//     });

//     return () => socket.off("gameStatus");
//   }, [socket]);

//   // useEffect(() => {
//   //   if (typeof window === "undefined") return;

//   //   socket.on("timerUpdate", (data) => {
//   //     setTimeRemaining(data.remainingTime);
//   //   });

//   //   return () => socket.off("timerUpdate");
//   // }, []);

//   // useEffect(() => {
//   //   if (typeof window === "undefined") return;

//   //   // Decrement local timer every second
//   //   const interval = setInterval(() => {
//   //     setTimeRemaining((prev) => Math.max(prev - 1000, 0));
//   //   }, 1000);

//   //   return () => clearInterval(interval);
//   // }, []);

//   return (
//     <GameStatusContext.Provider
//       value={{
//         gameStatus,
//         timeRemaining,
//         isButtonDisabled,
//       }}
//     >
//       {children}
//     </GameStatusContext.Provider>
//   );
// };

// export default GameStatusContext;


"use client";

import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";

const GameStatusContext = createContext();

const socket = io("http://localhost:3001/");

export const GameStatusProvider = ({ children }) => {
  const [gameStatus, setGameStatus] = useState("Waiting for the game to start...");
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [totalTimer, setTotalTimer] = useState(null);
  const [isButton1Disabled, setIsButton1Disabled] = useState(true);
  const [isButton2Disabled, setIsButton2Disabled] = useState(true);

  useEffect(() => {
    // Listen for gameStatus updates from the server
    socket.on("gameStatus", (data) => {
      setGameStatus(data.message);
      setIsButton1Disabled(data.button1Disabled);
      setIsButton2Disabled(data.button2Disabled);
      setTimeRemaining(data.totalSeconds);
      setTotalTimer(data.totalTimer);
    });

    return () => socket.off("gameStatus");
  }, []);

  console.log(isButton1Disabled, timeRemaining);
  // useEffect(() => {
  //   // Decrement local timer every second
  //   const interval = setInterval(() => {
  //     setTimeRemaining((prev) => Math.max(prev - 1000, 0));
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <GameStatusContext.Provider
      value={{
        gameStatus,
        timeRemaining,
        isButton1Disabled,
        isButton2Disabled,
        totalTimer,
      }}
    >
      {children}
    </GameStatusContext.Provider>
  );
};

export default GameStatusContext;



// "use client";
// import React, { createContext, useState, useEffect } from "react";
// import io from "socket.io-client";
// import Cookies from "js-cookie";

// const GameStatusContext = createContext();
// const socket = io("http://localhost:3001/");

// export const GameStatusProvider = ({ children }) => {
//   // Function to get cookies safely
//   const getCookie = (key, defaultValue) => {
//     if (typeof window !== "undefined") {
//       return Cookies.get(key) || defaultValue;
//     }
//     return defaultValue;
//   };



//   // State variables with initial values from cookies
//   const [gameStatus, setGameStatus] = useState(() =>
//     getCookie("gameStatus", "Waiting for the game to start...")
//   );
//   const [timeRemaining, setTimeRemaining] = useState(0);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(null);

  
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     // Listen for gameStatus updates from the server
//     socket.on("gameStatus", (data) => {
//       setIsButtonDisabled(data.isButtonDisabled);
//       setTimeRemaining(data.remainingTime);
//     });

//     return () => socket.off("gameStatus");
//   }, [socket]);

//   // useEffect(() => {
//   //   if (typeof window === "undefined") return;

//   //   socket.on("timerUpdate", (data) => {
//   //     setTimeRemaining(data.remainingTime);
//   //   });

//   //   return () => socket.off("timerUpdate");
//   // }, []);

//   // useEffect(() => {
//   //   if (typeof window === "undefined") return;

//   //   // Decrement local timer every second
//   //   const interval = setInterval(() => {
//   //     setTimeRemaining((prev) => Math.max(prev - 1000, 0));
//   //   }, 1000);

//   //   return () => clearInterval(interval);
//   // }, []);

//   return (
//     <GameStatusContext.Provider
//       value={{
//         gameStatus,
//         timeRemaining,
//         isButtonDisabled,
//       }}
//     >
//       {children}
//     </GameStatusContext.Provider>
//   );
// };

// export default GameStatusContext;
