require("dotenv").config();
const { createServer } = require("http");
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const { Pool } = require("pg");
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const { spawn } = require("child_process");
const path = require("path");
const WebSocket = require("ws");
const axios = require("axios");
const { Server } = require("socket.io");
const { setSocketIO } = require("./automaticMatch");

const binanceSymbol = "btcusdt"; // Change this based on your needs
const interval = "1m"; // 1-minute interval (you can modify)
const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${interval}`;
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://profitonn.com"
    : "http://localhost:3000";
   
let ws;
const {
  addOnlineUser,
  getOnlineUsers,
  removeOnlineUserBySocketId,
} = require("./socket/onlineUsers");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let activeTrades = {};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // If it's a socket.io request, do nothing here — Socket.IO will handle it internally
    if (req.url.startsWith("/socket.io")) return;
    handler(req, res); // Let Next.js handle everything else
  });
  // io = new Server(httpServer);
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Ensure this matches the frontend URL
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });
  setSocketIO(io);
  let onlineUsers = [];
  let automaticPlayerList = [];

  io.on("connection", (socket) => {
    let { userId, profile } = socket.handshake.query; // Get user details from query

    // Ensure profile is a valid JSON string
    try {
      if (profile) {
        profile = JSON.parse(profile); // Parse the profile
        addOnlineUser({
          ispaired: false,
          userId,
          socketId: socket.id,
          profile,
        });

        onlineUsers = getOnlineUsers();
        io.emit("getUsers", onlineUsers);
      } else {
        profile = {}; // Set an empty object if profile is undefined
      }
    } catch (error) {
      console.error("Error parsing profile:", error);
      profile = {}; // Default to empty object on parse error
    }

    socket.on("automaticPairingRequest", ({ amount, userId, username }) => {
      automaticPlayerList[username] = {
        userId,
        username,
        amount,
      };
      console.log(automaticPlayerList, "list1");
    });

    socket.on("updateProfile", ({ userId, updatedProfile }) => {
      const userIndex = onlineUsers.findIndex((user) => user.userId === userId);
      if (userIndex !== -1) {
        onlineUsers[userIndex].profile = updatedProfile;
        io.emit("getUsers", onlineUsers); // Update user list for all clients
      }
    });

    // Handle challenge event
    socket.on("sendChallenge", ({ receiverId, challengeDetails }) => {
      const receiver = onlineUsers.find((user) => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveChallenge", { challengeDetails });
      } else {
      }
    });

    socket.on("resendChallenge", ({ receiverId, resendChallengeDetails }) => {
      const receiver = onlineUsers.find((user) => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit(
          "receiveResendChallenge",
          resendChallengeDetails
        );
      } else {
      }
    });

    socket.on("sendDemoBalance", ({ receiverId, demoBalance }) => {
      const receiver = onlineUsers.find(
        (user) => user.profile.name === receiverId
      );
      if (receiver) {
        io.to(receiver.socketId).emit("receiveDemoBalance", demoBalance);
      } else {
      }
    });

    socket.on("updateAmount", ({ userId, amount }) => {
      const userIndex = onlineUsers.findIndex((user) => user.userId === userId);
      if (userIndex !== -1) {
        onlineUsers[userIndex].profile.amount = amount;
        io.emit("getUsers", onlineUsers);
      }
    });

    socket.on("findMatch", async ({ amount, username, userId }) => {
      await handleFindMatch({ amount, username, userId });
    });

    function getCategory(amount) {
      if (25 <= amount && amount <= 150) {
        return "beginner";
      } else if (250 <= amount && amount <= 1000) {
        return "plus";
      } else if (1250 <= amount && amount <= 5000) {
        return "pro";
      }
      return "unknown";
    }

    socket.on("deleteAutoPairingMatchDetails", ({ userId }) => {
      const userIndex = onlineUsers.findIndex((user) => user.userId === userId);
      if (userIndex !== -1) {
        delete onlineUsers[userIndex].profile.amount;

        io.emit("getUsers", onlineUsers);
      }
    });

    // io.on("connection", (socket) => {
    //   socket.on("sendDataOnDisconnect", (userId,timeLeft,open,high,low) => {
    //     saveTradeData(userId,timeLeft,open,high,low);
    //   });
    // });

    // const disconnectTimers = new Map(); // To store disconnect timers for users

    // socket.on("sendDataOnDisconnect", (data) => {
    //   const { userId, username, gameId, sessionId, isGameOver } = data;

    //   console.log(
    //     `User ${userId} disconnected with ${username} seconds left at minute ${gameId}, ${sessionId} , ${isGameOver}`
    //   );
    //   const timer = setTimeout(() => {
    //     if (isGameOver === false) {
    //       saveTradeData(userId, gameId, sessionId);
    //     }
    //     disconnectTimers.delete(userId);
    //   }, 10000);

    //   disconnectTimers.set(userId, timer);
    // });

    // // When the user reconnects, cancel the timeout
    // socket.on("userReconnected", (data) => {
    //   const { userId } = data;

    //   if (disconnectTimers.has(userId)) {
    //     clearTimeout(disconnectTimers.get(userId)); // Cancel the scheduled execution
    //     disconnectTimers.delete(userId);
    //     console.log(`User ${userId} reconnected, trade data saving cancelled.`);
    //   }
    // });

    // // Function to save trade data to the database
    // const saveTradeData = async (userId, gameId, sessionId) => {
    //   try {
    //     let params = {
    //       userId,
    //       gameId,
    //       sessionId,
    //     };

    //     console.log(params);
    //     const response = await axios.post(
    //       "http://localhost:3000/api/run_pipeline_4",
    //       {
    //         params,
    //       }
    //     );

    //     console.log(`Trade data saved for user ${userId}`);
    //   } catch (error) {
    //     console.error("Error saving trade data:", error);
    //   }
    // };

    const connectWebSocket = () => {
      ws = new WebSocket(wsUrl);

      ws.on("open", () => {
        // console.log(`Connected to Binance WebSocket: ${wsUrl}`);
      });

      ws.on("message", async (data) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.k) {
            const { t, o, h, l, c, v } = parsedData.k; // Extract kline data
            ohlcData = {
              time: new Date(t).toISOString(),
              open: parseFloat(o),
              high: parseFloat(h),
              low: parseFloat(l),
              close: parseFloat(c),
              volume: parseFloat(v),
            };
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("WebSocket closed. Reconnecting in 5 seconds...");
        setTimeout(connectWebSocket, 5000); // Auto-reconnect
      });
    };

    connectWebSocket();

    // User starts a trade session
    socket.on(
      "startTradeSession",
      ({ userId, gameId, sessionId, startTime, amount, symbol }) => {
        console.log(userId, gameId, sessionId, startTime, amount, symbol);
        if (!userId || (!gameId && !sessionId) || !symbol) return;

        const gameStart = new Date(startTime).getTime();
        let timerDuration = getTradeDuration(amount);
        const targetEndTime = gameStart + timerDuration;

        // If user already has an active trade, clear it before starting a new one
        if (activeTrades[userId]) {
          console.log(`Clearing previous trade session for user: ${userId}`);
          clearInterval(activeTrades[userId].interval); // Stop previous timer
          delete activeTrades[userId]; // Remove old trade session
        }

        // Store trade in activeTrades
        activeTrades[userId] = {
          userId,
          gameId,
          sessionId,
          startTime,
          targetEndTime,
          timerDuration,
          symbol,
          ohlcData: [],
          interval: null,
          backendDataSent: false,
          dataSent: false,
        };

        console.log(
          `New trade started for user: ${userId}, Duration: ${
            timerDuration / 60000
          } mins`
        );

        // Ensure startTradeTimer runs for each user
        startTradeTimer(io, userId);

        // Store socket ID
        activeTrades[userId].socketId = socket.id;

        // Send trade details to reconnecting user
        socket.emit("tradeSessionDetails", {
          userId,
          timeLeft: Math.floor((targetEndTime - new Date().getTime()) / 1000),
          ohlcData: activeTrades[userId].ohlcData,
        });
      }
    );

    // Handle user reconnection
    socket.on("reconnectTradeSession", ({ userId }) => {
      if (activeTrades[userId]) {
        const trade = activeTrades[userId];
        trade.socketId = socket.id; // Update socket ID

        socket.emit("tradeSessionDetails", {
          userId,
          timeLeft: Math.floor(
            (trade.targetEndTime - new Date().getTime()) / 1000
          ),
          ohlcData: trade.ohlcData, // Send stored OHLC data, not trigger backend
        });

        console.log(`User reconnected to session ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      removeOnlineUserBySocketId(socket.id);
      io.emit("getUsers", getOnlineUsers());
    });
  });

  const getTradeDuration = (amount) => {
    if (amount === "0" || amount === "25") return 5 * 60 * 1000; // 5 mins
    if (amount === "150") return 20 * 60 * 1000; // 20 mins
    if (amount === "100") return 15 * 60 * 1000;
    if (!amount || amount === null || amount === undefined)
      return 5 * 60 * 1000;
  };

  // Timer logic (Runs even if user disconnects)
  const startTradeTimer = (io, userId) => {
    const trade = activeTrades[userId];
    if (!trade) return;

    // Send OHLC data every minute

    const interval = setInterval(async () => {
      const now = new Date().getTime();
      const remainingTime = Math.max(trade.targetEndTime - now, 0);
      const elapsedTime = trade.timerDuration - remainingTime;
      const currentMinute = Math.floor(elapsedTime / 60000);

      if (remainingTime <= 0) {
        console.log(`Trade session ended for user: ${trade.userId}`);
        clearInterval(trade.interval);
        trade.interval = null;

        if (!trade.backendDataSent) {
          await sendOHLCDataToBackend(
            trade.userId,
            trade.gameId,
            trade.sessionId,
            currentMinute,
            ohlcData,
            trade.symbol,
            trade.startTime
          );
          setTimeout(
            () => runPipeline_4(trade.userId, trade.gameId, trade.sessionId),
            1000
          );
          trade.backendDataSent = true;
        }

        delete activeTrades[userId];
        return;
      }

      if (currentMinute !== trade.currentMinute && currentMinute >= 1) {
        trade.currentMinute = currentMinute;
        await sendOHLCDataToBackend(
          trade.userId,
          trade.gameId,
          trade.sessionId,
          currentMinute,
          ohlcData,
          trade.symbol,
          trade.startTime
        );
      }

      io.to(userId).emit("updateTimer", {
        timeLeft: Math.floor(remainingTime / 1000),
      });
    }, 1000);

    trade.interval = interval;
  };

  const sendOHLCDataToBackend = async (
    userId,
    gameId,
    sessionId,
    minute,
    ohlcData,
    symbol,
    startTime
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/api/store-ohlc-data`, {
        userId,
        gameId,
        sessionId,
        currentMinute: minute,
        ohlc: ohlcData,
        currentTime: new Date(),
        symbol,
        startTime,
      });
      console.log(`OHLC data sent for user ${userId}, Minute: ${minute}`);
    } catch (error) {
      console.error("Error sending OHLC data:", error);
    }
  };

  // Run ML model training after trade ends
  const runPipeline_4 = async (userId, gameId, sessionId) => {
    console.log(userId, gameId, sessionId, "runPipeline_4");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/run_pipeline_4`,
        { userId, gameId, sessionId } // ✅ Send directly
      );

      if (response.status === 200) {
        console.log(`ML training completed for user ${userId}`);
      }
    } catch (error) {
      console.error("Error running pipeline:", error);
    }
  };

  // Remove user when they disconnect
  const removeUser = (socketId) => {
    Object.keys(activeTrades).forEach((userId) => {
      if (activeTrades[userId].socketId === socketId) {
        activeTrades[userId].socketId = null; // Keep session running
        console.log(
          `User disconnected but trade session ${userId} is still active.`
        );
      }
    });
  };

  httpServer
    .once("error", (err) => {
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`Ready on http://${hostname}:${port}`);
    });
});