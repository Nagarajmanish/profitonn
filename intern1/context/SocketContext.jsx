"use client"; // Ensures the file runs only in the client environment

import { toNumber } from "lodash";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const SocketContext = createContext(null);

// Context Provider Component
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [parsedUserDetails, setParsedUserDetails] = useState(null);
  const [noofChallengesSent, setnoofChallengesSent] = useState(0);
  const [noofChallengesGot, setnoofChallengesGot] = useState(0);
  const [dataBy, setDataBy] = useState([]);
  const [dataTo, setDataTo] = useState([]);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [receivedChallengeDetails, setReceivedChallengeDetails] = useState([]);
  const [opponentBalance, setOpponentBalance] = useState(null);
  const [oppData, setOppData] = useState([]);
  const [matchFound, setMatchFound] = useState(false);
  const [message, setMessage] = useState("");
  const [botBalance, setBotBalance] = useState(null);
  // const { data: session, status } = useSession();

    let status = "unloading";

  let session = {
    user: {
      email: "priyanshuranjancosmicx@gmail.com",
      id: "101334696226767318614",
      name: "priyanshuranjancosmicx",
    },
  };
  
  useEffect(() => {
    if (!session) return; 
     
    // Wait until user details are ready
    // const newSocket = io("wss://profitonn.com", {
    //   query: {
    //     userId: session.user.id, // Replace with the actual user ID
    //     profile: JSON.stringify(session.user),
    //   },
    //   transports: ['websocket'], // Force WebSocket transport
    // });

    const newSocket = io("http://localhost:3000/", {
      query: {
        userId: session.user.id, // Replace with the actual user ID
        profile: JSON.stringify(session.user),
      },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Disconnect socket on component unmount
    };
  }, [session]); // Depend on parsedUserDetails

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => setIsSocketConnected(true));
    socket.on("disconnect", () => setIsSocketConnected(false));
    socket.on("getUsers", (res) => setOnlineUsers(res));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("getUsers");
    };
  }, [socket]);

  console.log(onlineUsers);
  //emit send challenge
  const sendChallenge = (receiverId, challengeDetails) => {
    if (socket) {
      // Emit the challenge with all necessary details
      socket.emit("sendChallenge", {
        receiverId,
        challengeDetails: {
          ...challengeDetails, // spread existing challenge details
          ranking: challengeDetails.ranking || "null", // Ensure ranking is included
          betStartRange: challengeDetails.betStartRange,
          betEndRange: challengeDetails.betEndRange,
          askStartRange: challengeDetails.askStartRange,
          askEndRange: challengeDetails.askEndRange,
          challengeToname: challengeDetails.challengeToname,
          challengerUserId: challengeDetails.challengerUserId,
          challengerWinProb: challengeDetails.challengerWinProb,
        },
      });
      // Update the state with the new challenge in dataTo
      setDataTo((prevDataTo) => {
        // Check if the new challenge details are not already in the dataTo array
        if (
          !prevDataTo.some(
            (challenge) =>
              challenge.challengeToname === challengeDetails.challengeToname
          )
        ) {
          return [...prevDataTo, challengeDetails];
        }
        return prevDataTo;
      });

      setnoofChallengesSent((prev) => prev + 1); // Update challenge count
      // console.log(challengeDetails, receiverId, "ChallengeDetails");
    }
  };

  //receive challenge
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("receiveChallenge", (challengeDetails) => {
      console.log("Received Challenge", challengeDetails);

      // Check if the challenge is unique before updating
      setDataBy((prevDataBy) => {
        // console.log(prevDataBy , "prevdata ")
        if (
          !prevDataBy.some(
            (challenge) =>
              challenge.challengerName === challengeDetails.challengerName
          )
        ) {
          return [...prevDataBy, challengeDetails];
        }
        return prevDataBy;
      });

      // Increment the challenge count accurately
      setnoofChallengesGot((prev) => {
        return toNumber(prev) + 1; // Simply increment count by 1
      });
    });

    return () => {
      socket.off("receiveChallenge");
    };
  }, [socket]);

  //resend challenge Details
  const resendChallenge = (receiverId, resendChallengeDetails) => {
    if (socket) {
      socket.emit("resendChallenge", {
        receiverId,
        resendChallengeDetails,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveResendChallenge", (resendChallengeDetails) => {
      // console.log("received Resend Challenge ", resendChallengeDetails);
      setChallengeAccepted(true);
      setReceivedChallengeDetails(resendChallengeDetails);
    });

    return () => {
      socket.off("receiveResendChallenge");
    };
  }, [socket]);

  const sendDemoBalance = (receiverId, demoBalance) => {
    if (socket) {
      // console.log(receiverId, demoBalance, "DemoBalance12345");
      socket.emit("sendDemoBalance", {
        receiverId,
        demoBalance,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("receiveDemoBalance", (demoBalance) => {
      // console.log("Received Demo Balance", demoBalance);
      setOpponentBalance(demoBalance);
    });

    return () => {
      socket.off("receiveDemoBalance");
    };
  }, [socket]);

  const findMatch = (amount, username, userId) => {
    if (socket) {
      // Emit an event to update the amount in the backend
      socket.emit("updateAmount", { userId, amount });
      // Then find a match based on the updated amount
      socket.emit("findMatch", {
        amount,
        username,
        userId,
      });
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listener for "matchFound"
    socket.on(
      "matchFound",
      ({ oppname, winrate, ranking, startTime, gameId }) => {
        setOppData({ oppname, winrate, ranking, startTime, gameId });
        setMatchFound(true);
      }
    );

    socket.on("matchNotFound", ({ message }) => {
      // console.log("Match Not Found:", message);
      setMessage(message);
    });

    // Cleanup the listeners on unmount
    return () => {
      socket.off("matchFound");
      socket.off("matchNotFound");
    };
  }, [socket]);

  //   const onDisconnectSendTradeData = ({ userId, username, gameId, sessionId, isGameOver }) => {
  //     console.log('User disconnected:', { userId, username, gameId, sessionId, isGameOver });

  //     if (socket) {
  //         socket.emit("sendDataOnDisconnect", { userId, username, gameId, sessionId, isGameOver });
  //     }
  // };

  // const onStartTradeSession = ({gameId,}) =>{
  //   socket.emit("startTradeSession", {
  //     userId: session.user.id,
  //     gameId,
  //     sessionId,
  //     startTime,
  //     amount,
  //     symbol,
  //   });

  // }

  const startTrade = ({ gameId, sessionId, startTime, amount, symbol, botId }) => {
    console.log(gameId, sessionId, startTime, amount, symbol, botId,  "hello world");
    socket.emit("startTradeSession", {
      userId: session.user.id,
      gameId,
      sessionId,
      startTime,
      amount,
      symbol,
      botId,
    });

    // Reconnect to trade session if user refreshes or disconnects
    socket.on("connect", () => {
      if (sessionId) {
        socket.emit("reconnectTradeSession", { sessionId });
      }
    });

    // Receive trade session details after reconnecting
    socket.on("tradeSessionDetails", ({ timeLeft, ohlcData }) => {
      console.log("Reconnected! Time left:", timeLeft);
      console.log("OHLC Data:", ohlcData);
    });
  };

  const checkAutomaticMatchCount = (count) => {
    if (!socket) {
      return; // Prevent function from running
    }
    socket.emit("checkAutomaticMatchCount", {
      userId: session.user.id,
      count1: count,
    });
  };

  const botFunction = () =>{
    if(!socket){
      return;
    }
    console.log("Bot Function");
    socket.emit("humanTrade", {
      userId: session.user.id,
      username: session.user.name,

    });
  }

  useEffect(() => {
    if (!socket) return;
  
    const handleBotBalanceUpdate = ({ botBalance }) => {
      setBotBalance(botBalance);
      console.log("Bot Balance Updated", botBalance);
    };
  
    socket.on("botBalanceUpdate", handleBotBalanceUpdate);
  
    return () => {
      socket.off("botBalanceUpdate", handleBotBalanceUpdate);
    };
  }, [socket, session]);
  
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log("Socket reconnected");
      if (session.user.id) {
        socket.emit("userReconnected", { userId: session.user.id });
      }
    };

    // Attach event listeners
    socket.on("connect", handleReconnect);
    socket.on("reconnect", handleReconnect);

    // Cleanup the listeners on unmount or before reattaching
    return () => {
      socket.off("connect", handleReconnect);
      socket.off("reconnect", handleReconnect);
    };
  }, [socket, session]); // Ensure userId is tracked

  const deleteAutoPairingMatchDetails = (userId) => {
    // console.log("delete Auto pairing Data ");
    if (socket) {
      // Emit an event to remove the pairing details without replacing the socket
      socket.emit("deleteAutoPairingMatchDetails", { userId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        setSocket,
        onlineUsers,
        sendChallenge,
        noofChallengesGot,
        noofChallengesSent,
        setnoofChallengesSent,
        setnoofChallengesGot,
        setDataBy,
        dataBy,
        setDataTo,
        dataTo,
        resendChallenge,
        challengeAccepted,
        receivedChallengeDetails,
        setOpponentBalance,
        opponentBalance,
        sendDemoBalance,
        findMatch,
        oppData,
        setOppData,
        deleteAutoPairingMatchDetails,
        matchFound,
        message,
        startTrade,
        checkAutomaticMatchCount,
        botFunction,
        botBalance,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook to use Socket Context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};





