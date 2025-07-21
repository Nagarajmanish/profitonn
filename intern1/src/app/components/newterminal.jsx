"use client";

import React, { use, useEffect, useState, useRef, useCallback } from "react";
import ToogleButton from "./ToggleButton";
import TradingViewChart from "./ChartComponent";
import { useTradeData } from "./TradeDataContext";
import axios from "axios";
import Cookies from "js-cookie";
import { set, toNumber } from "lodash";
import { useRouter } from "next/navigation";
import { useSocket } from "../../../context/SocketContext";
import Loader from "./Loader";
import { Expand, Minimize } from "lucide-react";
// New reusable components
import TradeTable from "./TradeTable";
import BuySellControls from "./BuySellControls";
import BalanceDisplay from "./BalanceDisplay";
import TimerDisplay from "./TimerDisplay";
import OrderControl from "./OrderControl";
import AlertPopup from "./AlertPopup";
import GameOverPopup from "./GameOverPopup";
import PerformancePopup from "./PerformancePopup";

export default function Terminal({ onClickRotate, isFullScreen, isRotateOnly }) {
  const router = useRouter();
  const { tradeData, ohlcData } = useTradeData();
  const latestTradeData = tradeData[0];
  const [activeButton, setActiveButton] = useState(null);
  const [selectButton, setSelectButton] = useState(null);
  const [openTrades, setopenTrades] = useState([]);
  const [pendingTrades, setpendingTrades] = useState([]);
  const [closedTrades, setclosedTrades] = useState([]);
  const [demoBalance, setDemoBalance] = useState(null);
  const [dynamicBalance, setDynamicBalance] = useState(null);
  const [initialFixedBalance, setInitialFixedBalance] = useState(null);
  const [trades, setTrades] = useState([]);
  const [isTradeClosed, setisTradeClosed] = useState(false);
  const [isTradeActive, setisTradeActive] = useState(false);
  const [symbolPrice, setSymbolPrice] = useState(null);
  const [askPrice, setAskPrice] = useState(null);
  const [bidPrice, setBidPrice] = useState(null);
  const [symbol, setSymbol] = useState("");
  const [allProfit, setAllProfit] = useState([]);
  const [closingTradeId, setClosingTradeId] = useState(0);
  const [stopLossValue, setStopLossValue] = useState(2);
  const [takeProfitValue, setTakeProfitValue] = useState(2);
  const [pendingValue, setPendingValue] = useState("");
  const [units, setUnits] = useState(0.01);
  const [inputValue, setInputValue] = useState(units.toFixed(3));
  const dynamicBalanceRef = useRef(dynamicBalance);
  const [pendingActive, setPendingActive] = useState(false);
  const [takeProfitActive, setTakeProfitActive] = useState(false);
  const [stopLossActive, setStopLossActive] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [leverageValue, setLeverageValue] = useState(50);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);
  const [currentTotalProfitOrLoss, setCurrentTotalProfitorLoss] = useState(0);
  const previousLengthRef = useRef(closedTrades.length); // Store the initial length of closedTrades
  const [isGameOver, setIsGameOver] = useState(false);
  const [showAfterMatchPopup, setShowAfterMatchPopup] = useState(false);
  const [winner, setWinner] = useState("");
  const [looser, setLooser] = useState("");
  const [chartHeight, setChartHeight] = useState(80); // Set initial height to 80vh
  const [isDynamicHigher, setIsDynamicHigher] = useState(true);
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const [gameId, setGameId] = useState("");
  const [gameCategory, setGameCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [confirmGameOver, setConfirmGameOver] = useState(false);
  const isGameOverHandled = useRef(false);
  const isInitialLoad = useRef(true);
  const chartRef = useRef(null); // Reference for the chart component
  const resizingRef = useRef(false); // Flag for resizing status
  const lastY = useRef(0); // Store last Y position of mouse during drag
  const [oppName, setOppName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [yourBet, setYourBet] = useState(0);
  const [opponentBet, setOpponentBet] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [botId, setBotId] = useState("");

  const {
    setOpponentBalance,
    opponentBalance,
    sendDemoBalance,
    socket,
    startTrade,
    botBalance,
  } = useSocket();
  const previousClosedTrades = useRef(JSON.stringify(closedTrades));
  const [openButton, setOpenButton] = useState(false);
  const [totalMargin, setTotalMargin] = useState(null);
  const [oppData, setOppData] = useState({
    oppName: "",
    winrate: "",
    ranking: "",
  });
  const tradeSectionRef = useRef(null);
  const isOpponentHigher = opponentBalance > dynamicBalance;
  const [showPopup, setShowPopup] = useState(false);
  const [showGlow, setShowGlow] = useState(false); // Manage glow effect

  useEffect(() => {
    const isFirstTime = localStorage.getItem("loaded");
    const isMobile = window.innerWidth <= 1024; // Show only for mobile

    if (!isFirstTime && isMobile) {
      setShowPopup(true);
      setShowGlow(true); // Show glow initially
      localStorage.setItem("loaded", "true"); // Store variable
    }
  }, []);

  const handleGotItClick = () => {
    setShowPopup(false);
    setShowGlow(false); // Remove glow effect
  };

  let status = "unloading";

  let session = {
    user: {
      email: "priyanshuranjancosmicx@gmail.com",
      id: "101334696226767318614",
      name: "priyanshuranjancosmicx",
    },
  };
  useEffect(() => {
    // Redirect to dashboard immediately
    // router.replace("/dashboard");

    // Prevent back navigation
    const preventBack = () => {
      history.pushState(null, "", location.href);
    };

    const handleBackButton = () => {
      router.replace("/dashboard");
    };

    // Push dummy state to prevent going back
    preventBack();

    window.addEventListener("popstate", handleBackButton);
    window.addEventListener("load", preventBack);
    window.addEventListener("touchstart", preventBack); // Mobile & Tablet fix

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      window.removeEventListener("load", preventBack);
      window.removeEventListener("touchstart", preventBack);
    };
  }, [router]);

  //fetchin gameId and gameCategory from url
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramGameId = params.get("gameId");
    const gameCategory = params.get("category");
    const paramAmount = params.get("amount");
    const paramyourBet = params.get("yourBet");
    const paramopponentBet = params.get("opponentBet");
    const botId = params.get("botId");
    const sessionId = params.get("sessionId");
    setAmount(paramAmount); // Sets the amount from the URL query
    setGameId(paramGameId);
    setGameCategory(gameCategory);
    setOpponentBet(paramopponentBet);
    setYourBet(paramyourBet);
    setSessionId(sessionId);
    setBotId(botId);
  }, []);

  // console.log(botId);
  // useEffect(() => {
  //   // Retrieve the list of active user IDs
  //   const userList = getActiveUsers(); // Use the function to get active users
  //   console.log("Active user IDs:", userList);
  // },[symbolPrice]);

  //For changing the divs of user and opponent's Balance
  useEffect(() => {
    // Check which balance is higher and set the state accordingly
    if (dynamicBalance !== null && opponentBalance !== null) {
      setIsDynamicHigher(dynamicBalance >= opponentBalance);
    }
  }, [dynamicBalance, opponentBalance]);

  // auto leverage set according to the balance of the user.
  useEffect(() => {
    const leverageFunc = () => {
      if (demoBalance <= 20000) {
        setLeverageValue(125);
      } else if (20000 < demoBalance && demoBalance <= 60000) {
        setLeverageValue(100);
      } else {
        setLeverageValue(75);
      }
    };
    leverageFunc();
  }, [dynamicBalance]);

  //update the timer and announce gameOver
  const handleTimeEnd = () => {
    setIsGameOver(true);
  };

  //function to fetch cookies (opponent's data)
  function getCookieValue(name) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    if (match) return match[2];
    return null;
  }
  const getOpponentDataFromCookies = () => {
    const storedData = Cookies.get("oppData");
    return storedData ? JSON.parse(storedData) : null;
  };

  const getOpponentNameFromCookies = () => {
    const storedName = Cookies.get("oppName");
    return storedName ? JSON.parse(storedName) : null;
  };

  const getstartTimeFromCookies = () => {
    const storedName = Cookies.get("startTime");
    return storedName ? JSON.parse(storedName) : null;
  };

  useEffect(() => {
    const storedData = getOpponentDataFromCookies();
    const storedName = getOpponentNameFromCookies();
    const storedStartTime = getstartTimeFromCookies();
    if (storedData) {
      setOppData(storedData); // Set oppData state
    }

    if (storedName) {
      setOppName(storedName); // Set oppName state
    }
    if (storedStartTime) {
      setStartTime(storedStartTime);
    }
  }, []);

  // Function to start resizing
  const handleMouseDown = (e) => {
    resizingRef.current = true;
    lastY.current = e.clientY;
    document.body.style.cursor = "ns-resize"; // Change cursor to resize
  };

  // Function to resize the chart component
  const handleMouseMove = (e) => {
    if (!resizingRef.current) return;

    const diff = e.clientY - lastY.current; // Calculate difference in Y positions
    const sensitivityFactor = 1; // Sensitivity factor increased to make resizing more noticeable

    // Update height based on the mouse movement difference and sensitivity factor
    const newHeight = chartHeight + diff * sensitivityFactor;

    // Restrict resizing to between 50vh and 90vh
    if (newHeight >= 50 && newHeight <= 90) {
      setChartHeight(newHeight);
      lastY.current = e.clientY; // Update last Y position
    }
  };

  // Stop resizing when mouse is released
  const handleMouseUp = () => {
    resizingRef.current = false;
    document.body.style.cursor = "auto"; // Reset cursor
  };

  // UseEffect to attach mouse event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handlePendingToggle = () => {
    if (symbolPrice !== 0) {
      if (pendingActive === false && selectButton === null) {
        setPendingActive(!pendingActive);
        setSelectButton("buy");
      } else {
        setPendingActive(!pendingActive);
      }
      if (pendingActive === true) {
        setPendingActive(!pendingActive);
      }
    }
  };
  const handleTakeProfitToggle = () => setTakeProfitActive(!takeProfitActive);
  const handleStopLossToggle = () => setStopLossActive(!stopLossActive);

  useEffect(() => {
    if (latestTradeData) {
      setSymbolPrice(latestTradeData.price);
      setSymbol(latestTradeData.symbol);
      setBidPrice(latestTradeData.bidPrice);
      setAskPrice(latestTradeData.askPrice);
    }
  }, [latestTradeData]); // Update whenever latestTradeData changes

  // This effect will only set stopLossValue when stopLossActive transitions from false to true
  useEffect(() => {
    if ((askPrice === 0 || bidPrice === 0) && pendingActive) {
      setPendingValue("");
    }
    if (pendingActive && selectButton === "sell" && askPrice !== 0) {
      setPendingValue(askPrice - 12);
    }

    if (pendingActive && selectButton === "buy" && bidPrice !== 0) {
      setPendingValue(bidPrice + 12);
    }
  }, [pendingActive, selectButton]);

  // Increase function
  const handleIncrease = () => {
    const newValue = parseFloat((units + 0.01).toFixed(2));
    setUnits(newValue);
    setInputValue(newValue.toFixed(2));
  };

  // Decrease function
  const handleDecrease = () => {
    const newValue =
      units > 0.01 ? parseFloat((units - 0.01).toFixed(2)) : units;
    setUnits(newValue);
    setInputValue(newValue.toFixed(2));
  };

  // Increase Stop Loss
  const increaseStopLoss = () => {
    const newValue = stopLossValue + 1;
    setStopLossValue(newValue); // Store the value as a number
  };

  // Decrease Stop Loss with a check for non-negative values
  const decreaseStopLoss = () => {
    const newValue = stopLossValue - 1;
    if (newValue >= 0) {
      setStopLossValue(newValue); // Store the value as a number
    }
  };

  // Increase Take Profit
  const increasetakeProfit = () => {
    const newValue = takeProfitValue + 1;
    setTakeProfitValue(newValue); // Store the value as a number
  };

  // Decrease Take Profit with a check for non-negative values
  const decreasetakeProfit = () => {
    const newValue = takeProfitValue - 1;
    if (newValue >= 0) {
      setTakeProfitValue(newValue); // Store the value as a number
    }
  };

  const increasePendingValue = () => {
    const newValue = parseFloat(parseFloat(pendingValue) + 1).toFixed(1);
    setPendingValue(newValue);
  };

  // Decrease function with a check for non-negative values
  const decreasePendingValue = () => {
    const newValue = parseFloat(parseFloat(pendingValue) - 1).toFixed(1);
    if (newValue >= 0) {
      setPendingValue(newValue);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow empty input for easier typing
    if (value === "") {
      setInputValue(value);
      return;
    }

    // Validate the input value to ensure it has at most four decimal places
    const decimalPattern = /^\d*\.?\d{0,2}$/; // Regex pattern for max 4 decimal places
    if (decimalPattern.test(value)) {
      setInputValue(value); // Update inputValue if valid

      // Update units based on input value if it's a valid number
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        setUnits(parsedValue); // Update units to match the input value
      }
    }
  };

  // Update the units state when the input loses focus
  const handleBlur = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setUnits(parsedValue); // Update main units state
    } else {
      setInputValue(units.toFixed(3)); // Reset inputValue to the current units value if invalid
    }
  };

  // Function to handle button clicks
  const handleButtonClick = (button) => {
    setActiveButton(button); // Set the active button
  };

  const handleSelectClick = (button) => {
    setSelectButton(button); // Set the selectButton
    tradeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollDownFunc = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth", // Smooth scrolling effect
    });
  };

  // function  for placing Trade Order
  const placeTradeFunction = async () => {
    if (status === "loading" || !session) {
      return; // Prevent API call until session is available
    }

    try {
      let margin = 0;
      if (selectButton === "sell") {
        margin = (units * askPrice) / leverageValue;
      } else if (selectButton === "buy") {
        margin = (units * bidPrice) / leverageValue;
      }

      let marginSum = 0;
      for (let i = 0; i < openTrades.length; i++) {
        const openTradesItems = openTrades[i];
        marginSum += openTradesItems.margin;
      }

      marginSum += margin;

      if (
        marginSum < dynamicBalance &&
        symbolPrice !== null &&
        leverageValue > 0
      ) {
        // Initialize params object with the common values
        let params = {
          id: session.user.id,
          username: session.user.name,
          margin,
          leverage: leverageValue,
          units,
          buyOrSell: selectButton,
          symbol,
        };

        if (params.buyOrSell === "sell") {
          params.openingprice = askPrice;
        } else if (params.buyOrSell === "buy") {
          params.openingprice = bidPrice;
        }
        // Add stopLossValue to params if stopLossActive is true and selectButton is changed
        if (stopLossActive && selectButton) {
          params.stopLossValue = stopLossValue;
        }

        // Add takeProfitValue to params if takeProfitActive is true and selectButton is changed

        if (takeProfitActive && selectButton) {
          params.takeProfitValue = takeProfitValue;
        }

        if (pendingActive && selectButton) {
          params.pending = true;
          params.openingprice = pendingValue;
          params.margin = (units * pendingValue) / leverageValue;
        }

        if (gameId !== null) {
          params.gameId = gameId;
        }

        if (botId !== null) {
          params.botId = botId;
        }
        if (sessionId !== null) {
          params.sessionId = sessionId;
        }
        // Send the request with the updated params
        const placeResponse = await axios.post("/api/placetrade", { params });

        if (placeResponse.status === 201) {
          setDemoBalance(demoBalance);
          console.log("demoBalance", demoBalance, dynamicBalance);
          if (params.pending === true) {
            setActiveButton(2);
            setAlertMessage("Pending Order");
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 2000);
            setisTradeActive(!isTradeActive);
            setTakeProfitActive(false);
            setStopLossActive(false);
            return;
          }
          setActiveButton(1);
          setAlertMessage("Trade Placed");
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 2000);
          setisTradeActive(!isTradeActive);
          setTakeProfitActive(false);
          setStopLossActive(false);
        }
      } else if (marginSum > dynamicBalance) {
        setAlertMessage("Insufficient Balance");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const updatePendingTrades = async () => {
      if (status === "loading" || !session) {
        return; // Prevent API call until session is available
      }

      try {
        // Define a buffer for reasonable price differences (you can adjust this threshold)
        const PRICE_BUFFER = 100; // Example threshold for valid price differences (can be changed based on market volatility)

        // Filter trades based on the condition, with a tolerance to avoid unrealistic trades
        const matchingTradeIds = pendingTrades
          .filter((trade) => {
            if (trade.buyorsell === "buy") {
              // For 'buy', openingPrice must be >= symbolPrice and within buffer range
              return (
                bidPrice >= trade.openingprice &&
                trade.openingprice >= bidPrice - PRICE_BUFFER
              );
            } else if (trade.buyorsell === "sell") {
              // For 'sell', openingPrice must be <= symbolPrice and within buffer range
              return (
                askPrice <= trade.openingprice &&
                trade.openingprice <= askPrice + PRICE_BUFFER
              );
            }
            return false;
          })
          .map((trade) => trade.id);

        // Send request only if matchingTradeIds is not empty
        if (matchingTradeIds.length > 0) {
          // Sending matchingTradeIds to the backend
          const params = {
            matchingTradeIds,
            id: session.user.id,
            username: session.user.name,
          };

          if (gameId) {
            params.gameId = gameId;
          }

          if (sessionId) {
            params.sessionId = sessionId;
          }
          const response = await axios.post("/api/placetrade", { params });

          if (response.status === 201) {
            setPendingResponse(!pendingResponse);
            setActiveButton(1);
            setAlertMessage("Trade Placed");
            setShowAlert(true);
            setTimeout(() => {
              setShowAlert(false);
            }, 2000);
          }
        }
      } catch (error) {}
    };

    updatePendingTrades();
  }, [askPrice, bidPrice, pendingTrades]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (status === "loading" || !session) {
        return; // Prevent API call until session is available
      }

      const requestData = {
        id: session.user.id,
        username: session.user.name,
      };

      if (gameId) requestData.gameId = gameId;
      if (sessionId) requestData.sessionId = sessionId;
      if (botId) requestData.botId = botId;

      try {
        if (gameId || sessionId || botId) {
          const response = await axios.get("/api/placetrade", {
            params: requestData,
          });
          if (response.status === 200) {
            const trade = response.data.trades;

            // Only update state if trades have changed
            setTrades((prevTrades) =>
              JSON.stringify(prevTrades) !== JSON.stringify(trade)
                ? trade
                : prevTrades
            );
          }
        }
      } catch (error) {}
    };

    fetchBalance();
  }, [
    gameId,
    session,
    sessionId,
    botId,
    activeButton,
    selectButton,
    isTradeActive,
    isTradeClosed,
    pendingResponse,
  ]); // Keep dependencies minimal

  useEffect(() => {
    // Validate symbolPrice before running logic
    if (
      !askPrice ||
      !bidPrice ||
      bidPrice <= 0 ||
      askPrice <= 0 ||
      !symbolPrice ||
      symbolPrice <= 0
    ) {
      return;
    }

    openTrades.forEach((trade) => {
      const profitData = allProfit.find((profit) => profit.id === trade.id);

      const profitOrLoss = profitData
        ? parseFloat(profitData.profit.toFixed(3))
        : 0;

      // Check if the trade is in loss and the margin is insufficient
      if (profitOrLoss < 0 && trade.margin <= Math.abs(profitOrLoss)) {
        closeTradeFunc(trade.id, profitOrLoss); // Close the trade
      }

      // Ensure trade closure is evaluated only when valid profit/loss values exist
      if (trade.stoplossvalue && profitOrLoss <= -trade.stoplossvalue) {
        closeTradeFunc(trade.id, profitOrLoss);
      } else if (
        trade.takeprofitvalue &&
        profitOrLoss >= trade.takeprofitvalue
      ) {
        closeTradeFunc(trade.id, profitOrLoss);
      }
    });
  }, [bidPrice, askPrice, openTrades, allProfit]);

  const cancelPendingTradeFunc = async (tradeId) => {
    try {
      if (status === "loading" || !session) {
        return; // Prevent API call until session is available
      }

      const cancelResponse = await axios.post("/api/cancelPendingTradeFunc", {
        params: {
          tradeId,
          userId: session.user.id,
          username: session.user.name,
        },
      });

      if (cancelResponse.status >= 200 && cancelResponse.status < 300) {
        // Trigger UI update for closed trade
        setPendingResponse((prev) => !prev);

        // Update closedTrades after updating trades
        setclosedTrades((prevTrades) =>
          prevTrades.filter((trade) => trade.closingTime !== null)
        );

        // updateBalance();
        setAlertMessage("Pending Cancelled");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    } catch (error) {}
  };

  const closeTradeFunc = async (tradeId, profitOrLoss, buyorsell) => {
    if (status === "loading" || !session) {
      return; // Prevent API call until session is available
    }

    try {
      // Validate profitOrLoss as a number
      if (
        profitOrLoss === undefined ||
        profitOrLoss === null ||
        isNaN(profitOrLoss)
      ) {
        return;
      }

      // Prepare parameters for API request
      const params = {
        tradeId,
        userId: session.user.id,
        username: session.user.name,
        profitOrLoss: parseFloat(profitOrLoss),
      };

      if (buyorsell === "sell") {
        params.closingPrice = bidPrice;
      } else if (buyorsell === "buy") {
        params.closingPrice = askPrice;
      }

      // Validate required parameters
      if (
        !params.tradeId ||
        !params.userId ||
        !params.username ||
        isNaN(params.profitOrLoss)
      ) {
        return;
      }

      // API call to close trade
      const closetradeResponse = await axios.post("/api/closeTrade", {
        params,
      });

      if (closetradeResponse.status >= 200 && closetradeResponse.status < 300) {
        // Trigger UI update for closed trade
        setisTradeClosed((prev) => !prev);

        // Update trades
        setTrades((prevTrades) =>
          prevTrades.map((trade) =>
            trade.id === tradeId
              ? { ...trade, profitOrLoss, closingTime: new Date() }
              : trade
          )
        );

        // Update closedTrades after updating trades
        setpendingTrades((prevTrades) =>
          prevTrades.filter(
            (trade) => trade.closingtime !== null && trade.pending === true
          )
        );

        await updateBalance();
        setAlertMessage("Trade Closed");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const savedOpponentBalance = Cookies.get("opponentBalance");
    if (!opponentBalance && savedOpponentBalance) {
      setOpponentBalance(Number(savedOpponentBalance));
    }
  }, []);

  // Funtion to run the ml model from main.py file def pipeline_4
  const runPipeline_4 = async () => {
    if (status === "loading" || !session) {
      return; // Prevent API call until session is available
    }

    let params = {
      userId: session.user.id,
      username: session.user.name,
      gameId,
      sessionId,
      botId,
    };
    const response = await axios.post("/api/run_pipeline_4", {
      params,
    });

    if (response.status === 200) {
    }
  };

  //function for recording the data after demotrade
  useEffect(() => {
    if (
      isGameOver &&
      (sessionId !== null || botId !== null) &&
      gameId === null &&
      !isGameOverHandled.current
    ) {
      isGameOverHandled.current = true;
      const handledemoSessionOver = async () => {
        try {
          openTrades.map(async (trade) => {
            const profitData = allProfit.find(
              (profit) => profit.id === trade.id
            );
            const profitOrLoss = profitData ? profitData.profit.toFixed(3) : 0;
            await closeTradeFunc(trade.id, profitOrLoss, trade.buyorsell);
          });

          pendingTrades.map(async (trade) => {
            await cancelPendingTradeFunc(trade.id);
          });

          // runPipeline_4();
        } catch (error) {}
      };

      handledemoSessionOver();
    }
  }, [isGameOver, isTradeActive, isTradeClosed]);

  useEffect(() => {
    if (status === "loading" || !session) {
      return;
    }

    if (
      isGameOver &&
      (oppData || oppName) &&
      gameId !== null &&
      sessionId === null &&
      !isGameOverHandled.current
    ) {
      isGameOverHandled.current = true;

      const handleGameOver = async () => {
        try {
          openTrades.map(async (trade) => {
            const profitData = allProfit.find(
              (profit) => profit.id === trade.id
            );
            const profitOrLoss = profitData ? profitData.profit.toFixed(3) : 0;
            await closeTradeFunc(trade.id, profitOrLoss, trade.buyorsell);
          });

          // runPipeline_4();
          const savedOpponentBalance = Cookies.get("opponentBalance");
          if (!savedOpponentBalance) {
            const oneHourFromNow = new Date(
              new Date().getTime() + 60 * 60 * 1000
            );
            Cookies.set("opponentBalance", opponentBalance, {
              expires: oneHourFromNow,
            });
            setOpponentBalance(opponentBalance);
          }

          if (dynamicBalance !== null && opponentBalance !== null) {
            const [first, second] =
              dynamicBalance > opponentBalance
                ? [session.user.name, oppData.oppName || oppName]
                : [oppData.oppName || oppName, session.user.name];

            let result = "";
            if (gameCategory) {
              // List of prefixes to remove
              const prefixes = ["bg", "pl", "pr"];

              // Check if the category starts with any of the prefixes and remove it
              result = prefixes.some((prefix) =>
                gameCategory.startsWith(prefix)
              )
                ? gameCategory.slice(2)
                : gameCategory;
            }

            console.log(result);
            if (result === "automatic") {
              const paramAmount = toNumber(amount);
              const finalDynamicBalance = parseFloat(dynamicBalance.toFixed(3)); // Ensure precision
              const finalOpponentBalance = parseFloat(
                opponentBalance.toFixed(3)
              ); // Ensure precision

              const balance =
                finalDynamicBalance === finalOpponentBalance
                  ? paramAmount
                  : finalDynamicBalance > finalOpponentBalance
                  ? paramAmount + 0.9 * paramAmount
                  : 0;

              await axios.post("/api/game/afterGameWalletBalanceUpdate", {
                gameId,
                first,
                second,
                balance,
                username: session.user.name,
                userId: session.user.id,
                demoBalanceOne: dynamicBalance,
                demoBalanceTwo: opponentBalance,
              });
            } else if (result === "challenge") {
              const paramopponentBet = toNumber(opponentBet);
              const paramyourBet = toNumber(yourBet);
              let balance = 0;

              if (first === session.user.name) {
                balance = paramyourBet + 0.9 * paramopponentBet;
              }
              if (dynamicBalance === opponentBalance) {
                balance = paramyourBet;
              }

              let params = {
                gameId,
                balance,
                userId: session.user.id,
                username: session.user.name,
                oppName,
                demoBalanceOne: dynamicBalance,
                demoBalanceTwo: opponentBalance,
              };
              if (first === session.user.name || first === oppData.oppName) {
                (params.winner = first), (params.looser = second);
              }
              await axios.post("/api/game/challengeGameWalletBalanceUpdate", {
                params,
              });
            }

            setShowAfterMatchPopup(true);
          }
        } catch (error) {}
      };

      handleGameOver();
    }
  }, [
    isGameOver,
    isTradeActive,
    isTradeClosed,
    symbolPrice,
    bidPrice,
    askPrice,
  ]);

  //Delete opponent Data from Cookie after the match gets over
  useEffect(() => {
    if (confirmGameOver === true) {
      Cookies.remove("opponentBalance");
      Cookies.remove("oppData");
      Cookies.remove("oppName");
      Cookies.remove("startTime");
      Cookies.remove("gameId");
      Cookies.remove("amount");
      Cookies.remove("sessionId");
    }
  }, [confirmGameOver]);

  useEffect(() => {
    let totalProfitOrLoss = 0;
    const tempProfitArray = [];

    if (bidPrice !== null && askPrice !== null) {
      // Calculate profit/loss for open trades
      for (let i = 0; i < trades.length; i++) {
        const trade = trades[i];

        // Skip trades that are already closed
        if (trade.closingtime !== null || trade.pending === true) continue;

        let individualProfitOrLoss = 0;

        if (trade.buyorsell === "buy") {
          individualProfitOrLoss =
            askPrice * trade.unitsorlots - trade.margin * trade.leverage - 0.25;
        } else if (trade.buyorsell === "sell") {
          individualProfitOrLoss =
            trade.margin * trade.leverage - bidPrice * trade.unitsorlots - 0.25;
        }

        individualProfitOrLoss = parseFloat(individualProfitOrLoss.toFixed(3));
        totalProfitOrLoss += individualProfitOrLoss;

        const profitObject = { id: trade.id, profit: individualProfitOrLoss };
        tempProfitArray.push(profitObject);
      }

      setAllProfit(tempProfitArray);
      setCurrentTotalProfitorLoss(totalProfitOrLoss);

      // Include closed trades profits
      let closedTradesProfit = 0;
      for (let i = 0; i < closedTrades.length; i++) {
        closedTradesProfit += parseFloat(closedTrades[i].profitorloss);
      }

      // Update dynamic balance including closed trades profit/loss
      setDynamicBalance(() => {
        const newBalance = demoBalance + totalProfitOrLoss;
        return parseFloat(newBalance.toFixed(3)); // Set new balance
      });
    }
  }, [
    bidPrice,
    askPrice,
    trades,
    closedTrades,
    demoBalance,
    gameId,
    sessionId,
    botId,
    isGameOver,
    isTradeClosed,
  ]);

  useEffect(() => {
    // Update open trades
    const newOpenTrades = trades.filter(
      (trade) => trade.closingtime === null && trade.pending === null
    );
    setopenTrades(newOpenTrades);
  }, [
    session,
    isTradeActive,
    isTradeClosed,
    selectButton,
    activeButton,
    trades,
    sessionId,
    botId,
    symbolPrice,
    bidPrice,
    askPrice,
    pendingResponse,
  ]);

  useEffect(() => {
    // Calculate the total margin by summing up all trade.margin values
    const margin = openTrades
      .reduce((total, trade) => total + (trade.margin || 0), 0)
      .toFixed(3);

    // Store the result in the state
    setTotalMargin(margin);
  }, [openTrades, closedTrades, session]);

  useEffect(() => {
    // If openTrades is not empty and activeButton isn't already set to 1
    if (openTrades.length !== 0 && !openButton) {
      setActiveButton(1);
      setOpenButton(true);
    }
  }, [openTrades]); // Ensure both openTrades and activeButton are dependencies

  useEffect(() => {
    // Update closed trades
    const newClosedTrades = trades.filter(
      (trade) => trade.closingtime !== null && trade.pending === null
    );
    setclosedTrades(newClosedTrades);
  }, [
    isTradeClosed,
    trades,
    isTradeActive,
    openTrades,
    gameId,
    sessionId,
    botId,
    pendingResponse,
  ]);

  useEffect(() => {
    // Update pending trades
    const newPendingTrades = trades.filter(
      (trade) => trade.closingtime === null && trade.pending === true
    );
    setpendingTrades(newPendingTrades);
  }, [
    isTradeClosed,
    session,
    trades,
    isTradeActive,
    gameId,
    sessionId,
    botId,
    pendingResponse,
  ]);

  const [previousBalance, setPreviousBalance] = useState(null);

  useEffect(() => {
    if (oppName || oppData.oppName) {
      const balanceToSend = dynamicBalance; // Get the current balance to send
      const recipientName = oppName || oppData.oppName;

      console.log(demoBalance, recipientName);
      sendDemoBalance(recipientName, balanceToSend); // Send the new balance
      setPreviousBalance(balanceToSend); // Store the last sent balance
    }
  }, [bidPrice, askPrice, ohlcData.volume, session]);

  const updateBalance = async () => {
    try {
      if (initialFixedBalance === null || isNaN(initialFixedBalance)) {
        return;
      }
      let sum = 0;
      if (closedTrades && closedTrades.length > 0) {
        closedTrades.forEach((trade, i) => {
          const tradeProfitOrLoss = parseFloat(trade.profitorloss);
          if (!isNaN(tradeProfitOrLoss)) {
            sum += tradeProfitOrLoss;
          } else {
          }
        });
      }

      const balance = initialFixedBalance + sum + currentTotalProfitOrLoss;

      if (status === "loading" || !session) {
        return; // Prevent API call until session is available
      }

      if (balance !== null && !isNaN(balance)) {
        await axios.post("/api/changeDemoBalance", {
          demoBalance: balance,
          username: session.user.name,
          userId: session.user.id,
        });
      } else {
      }
      const newBalance = initialFixedBalance + sum;
      if (newBalance !== demoBalance) {
        setDemoBalance(newBalance); // Update state only if it changed
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (
      initialFixedBalance !== null &&
      !isNaN(initialFixedBalance) &&
      JSON.stringify(closedTrades) !== previousClosedTrades.current // Only run if closedTrades changed
    ) {
      previousClosedTrades.current = JSON.stringify(closedTrades); // Update reference
      updateBalance();
    }
  }, [closedTrades]);

  useEffect(() => {
    // Call updateBalance whenever initialFixedBalance is updated
    if (initialFixedBalance !== null && !isNaN(initialFixedBalance)) {
      updateBalance();
    }
  }, [initialFixedBalance, session]);

  const getCurrentMarketPrice = async (symbol) => {
    try {
      const response = await axios.get(`/api/marketPrice`, {
        params: { symbol },
      });

      if (response.status === 200) {
        return response.data.price; // Assuming the price is in response.data.price
      } else {
        return 0;
      }
    } catch (error) {
      return 0;
    }
  };

  // Timer initialization based on gameCategory
  useEffect(() => {
    const getInitialDemoBalance = async () => {
      let fixedBalance = 0;

      if (
        gameCategory === "bgautomatic" ||
        gameCategory === "demoTrade" ||
        gameCategory === "bgchallenge" ||
        gameCategory === "bot"
      ) {
        fixedBalance = 100;
      } else if (gameCategory === "plus") {
        fixedBalance = 500;
      } else if (gameCategory === "pro") {
        fixedBalance = 1000;
      }

      setInitialFixedBalance(fixedBalance);
    };

    if (gameCategory) {
      getInitialDemoBalance();
    }
  }, [gameCategory]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Required for the browser to show a confirmation dialog
    };

    // Add the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up the event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameCategory]);

  const [timeLeft, setTimeLeft] = useState(15 * 60); // Timer duration
  const [currentMinute, setCurrentMinute] = useState(0); // Current minute
  const [backendDataSent, setBackendDataSent] = useState(false); // Backend flag
  const [dataSent, setDataSent] = useState(false);
  const intervalRef = useRef(null); // Store interval ID
  const [isVisible, setIsVisible] = useState(false); // Track visibility state

  const stableHandleTimeEnd = useCallback(() => {
    handleTimeEnd();
  }, []); // Memoized function

  useEffect(() => {
    if (!startTime) return; // Ensure startTime is valid
    const gameStart = new Date(startTime).getTime(); // Parse startTime from the cookie
    let timerDuration;
    const selected_amount = amount;
    // Set timer duration based on selected amount
    if (
      selected_amount === "0" ||
      selected_amount === "25" ||
      gameCategory === "demoTrade" ||
      botId !== null
    ) {
      timerDuration = 5 * 60 * 1000; // 5 minutes
    } else if (selected_amount === "150") {
      timerDuration = 20 * 60 * 1000;
    } else {
      timerDuration = 15 * 60 * 1000;
    }
    const targetEndTime = gameStart + timerDuration; // Calculate the end time

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const remainingTime = Math.max(targetEndTime - now, 0);

      setTimeLeft(Math.floor(remainingTime / 1000));

      if (remainingTime <= 0) {
        stableHandleTimeEnd(); // Trigger popup

        // if (!backendDataSent && ohlcData !== null) {
        //   sendOHLCDataToBackend(currentMinute + 1, ohlcData);
        //   setTimeout(() => runPipeline_4(), 1000);
        //   setBackendDataSent(true);
        // }

        if (!dataSent) {
          setDataSent(true);
          localStorage.setItem("dataSent", "true");
        }

        clearInterval(intervalRef.current); // Stop timer
      }

      const elapsedTime = timerDuration - remainingTime;
      const currentMinuteInterval = Math.floor(elapsedTime / 60 / 1000);

      if (
        currentMinuteInterval !== currentMinute &&
        currentMinuteInterval >= 0 &&
        remainingTime > 0
      ) {
        setCurrentMinute(currentMinuteInterval);

        // if (ohlcData !== null) {
        //   sendOHLCDataToBackend(currentMinuteInterval, ohlcData);
        // }
      }
    };

    calculateTimeLeft();
    intervalRef.current = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(intervalRef.current); // Cleanup interval
  }, [
    startTime,
    stableHandleTimeEnd,
    currentMinute,
    ohlcData,
    dataSent,
    backendDataSent,
  ]);

  // Format time as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    if (symbol && (gameId || sessionId || botId)) {
      startTrade({ gameId, sessionId, startTime, amount, symbol, botId });
    }
  }, [sessionId, gameId, botId, symbol]);

  // --- UI rendering below ---
  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="containerOuter">
      {/* Top Navbar */}
      <div className={`w-[100vw] h-[40px] lg:h-[8vh] bg-zinc-950 border-b-2 lg:border-b-4 border-slate-600 text-white flex justify-around lg:justify-between items-center ${isFullScreen ? "w-[80vw]" : "w-[100vw]"}`}>
        <div className="ml-3 text-2xl lg:text-3xl lg:block hidden font-bold text-white tracking-wide hover:scale-105 transition-transform duration-300">
          Profit
          <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 inline-block text-transparent bg-clip-text ">ONN</span>
        </div>
        {/* Timer (mobile) */}
        <TimerDisplay timeLeft={timeLeft} isGameOver={isGameOver} formatTime={formatTime} isMobile={true} />
        {/* Balance (desktop) */}
        <BalanceDisplay
          dynamicBalance={dynamicBalance}
          opponentBalance={opponentBalance}
          botBalance={botBalance}
          oppName={oppName}
          oppData={oppData}
          isDynamicHigher={isDynamicHigher}
          isGameOver={isGameOver}
          isFullScreen={isFullScreen}
        />
        {/* Rotate/Popup Buttons */}
        <div className={`${isFullScreen ? "flex justify-end ml-40" : "flex ml-10"}`}>
          {showPopup && (
            <div className="fixed left-1/2 top-14 transform -translate-x-1/2 bg-zinc-950 text-white border-2 border-white rounded-lg p-4 text-center z-50 w-80 shadow-lg">
              <p className="text-sm">Click here to rotate the screen for a better experience!</p>
              <button onClick={handleGotItClick} className="mt-2 bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md w-full lg:hover:bg-indigo-500">Got it!</button>
            </div>
          )}
          <button className={`lg:hidden px-4 py-2 text-white rounded-md shadow-md flex items-center gap-2 relative ${showGlow ? "glow-effect" : ""}`} onClick={onClickRotate}>
            {isFullScreen ? <Minimize size={32} /> : <Expand size={32} />}
          </button>
          <button onClick={() => setIsVisible(!isVisible)} className={`text-white p-2 rounded-md flex items-center space-x-2 lg:hidden ${isFullScreen ? "hidden" : "sm:block"}`}>{isVisible ? (
            <svg className="h-8 w-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <div className="relative inline-block">
              <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {openTrades.length > 0 && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-700 text-[10px] text-white">{openTrades.length}<div className="absolute inset-0 -z-10 animate-ping rounded-full bg-teal-200"></div></div>
              )}
            </div>
          )}</button>
        </div>
      </div>

      {/* Game Over Popups */}
      <GameOverPopup
        isOpen={isGameOver && sessionId === null && gameId !== null}
        dynamicBalance={dynamicBalance}
        opponentBalance={opponentBalance}
        bidPrice={bidPrice}
        askPrice={askPrice}
        gameCategory={gameCategory}
        amount={amount}
        opponentBet={opponentBet}
        yourBet={yourBet}
        toNumber={toNumber}
        onExit={() => {
          setConfirmGameOver(true);
          router.push("/dashboard");
        }}
      />
      <PerformancePopup
        isOpen={isGameOver && sessionId !== null && gameId === null}
        closedTrades={closedTrades}
        dynamicBalance={dynamicBalance}
        initialFixedBalance={initialFixedBalance}
        onExit={() => {
          Cookies.remove("sessionId");
          Cookies.remove("startTime");
          router.push("/dashboard");
        }}
      />

      {/* Main Layout */}
      <div className="containerInner1 flex flex-col lg:flex-row w-[100vw] h-[100%]">
        {/* Sidebar (left) */}
        <div className="lg:w-[22vw] lg:border-r-4 lg:border-slate-600 lg:border-box w-[100vw] h-[14vh] lg:h-[92vh] bg-zinc-950 ">
          <div className="w-[100%] h-[55%] flex flex-col items-center">
            <input type="text" placeholder="Search..." className="w-[96%] mt-4 py-2 pl-10 mx-2 text-gray-700 bg-[#FFF6F6] border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 hidden lg:block" />
            {/* Balance (sidebar) */}
            <BalanceDisplay
              dynamicBalance={dynamicBalance}
              opponentBalance={opponentBalance}
              botBalance={botBalance}
              oppName={oppName}
              oppData={oppData}
              isDynamicHigher={isDynamicHigher}
              isGameOver={isGameOver}
              isFullScreen={isFullScreen}
            />
            {/* Timer (desktop) */}
            <TimerDisplay timeLeft={timeLeft} isGameOver={isGameOver} formatTime={formatTime} isMobile={false} />
          </div>
          {/* Profile List (unchanged) */}
          <div className="w-[100%] h-[25%] text-white hidden lg:block bg-zinc-950 border-t-4 mt-10 border-slate-600 border-box">
            <h1 className="pt-4 ml-5 text-xl font-semibold text-white">Your Profile</h1>
            <ul>
              <li className="w-[90%] ml-5 mx-2 p-2 border-b-2 flex items-center justify-between"><span>BTCUSDT</span><button className="text-3xl">+</button></li>
              <li className="w-[90%] ml-5 mx-2 p-2 border-b-2 flex items-center justify-between"><span>ETHUSDT</span><button className="text-3xl">+</button></li>
              <li className="w-[90%] ml-5 mx-2 p-2 border-b-2 flex items-center justify-between"><span>USDTUSD</span><button className="text-3xl">+</button></li>
            </ul>
          </div>
        </div>

        {/* Main Chart and Trading Section */}
        <div className={`lg:w-[75vw] w-[100vw] h-[100vh] lg:h-[92vh] bg-slate-80 flex flex-col ${isFullScreen ? "w-[100vw] flex lg:w-[75vw]" : "w-[100vw] lg:w-[75vw]"}`}>
          <div className="flex justify-center ">
            {/* Trading View Component */}
            <div ref={chartRef} id="chart" className={`${opponentBalance !== null && (oppData.oppName || oppName) ? "lg:mt-0" : "lg:mt-0"} terminal border-slate-600 bg-zinc-950 lg:text-8xl text-white flex items-center justify-center ${isFullScreen ? "-mt-14 w-[80vw] flex-col" : "w-[100vw] -mt-14 lg:w-[70vw]"}`}>
              <div className={`${isFullScreen ? "w-[80vw] border-b-4 border-slate-600" : "w-[100vw] lg:[80vw]"}`}>
                <TradingViewChart />
              </div>
              {/* Tabs for Open, Pending, Closed (fullscreen mobile) */}
              {isFullScreen && (
                <div className="w-full flex justify-between bg-zinc-900 text-white rounded-t-md mt-2">
                  <button
                    className={`flex-1 py-2 ${activeButton === 1 ? "bg-zinc-800 font-bold" : ""}`}
                    onClick={() => setActiveButton(1)}
                  >
                    Open ({openTrades.length})
                  </button>
                  <button
                    className={`flex-1 py-2 ${activeButton === 2 ? "bg-zinc-800 font-bold" : ""}`}
                    onClick={() => setActiveButton(2)}
                  >
                    Pending ({pendingTrades.length})
                  </button>
                  <button
                    className={`flex-1 py-2 ${activeButton === 3 ? "bg-zinc-800 font-bold" : ""}`}
                    onClick={() => setActiveButton(3)}
                  >
                    Closed ({closedTrades.length})
                  </button>
                </div>
              )}
              {/* Trade Table (mobile, fullscreen) */}
              {isFullScreen && (
                <TradeTable
                  trades={activeButton === 1 ? openTrades : activeButton === 2 ? pendingTrades : closedTrades}
                  type={activeButton === 1 ? "open" : activeButton === 2 ? "pending" : "closed"}
                  askPrice={askPrice}
                  bidPrice={bidPrice}
                  allProfit={allProfit}
                  onCloseTrade={closeTradeFunc}
                  onCancelTrade={cancelPendingTradeFunc}
                />
              )}
            </div>
          </div>
          {/* Divider for resizing */}
          {!isFullScreen && (
            <div className="h-1 cursor-ns-resize bg-slate-600" onMouseDown={handleMouseDown} style={{ cursor: "ns-resize" }}></div>
          )}
          {/* Tabs for Open, Pending, Closed (desktop, below chart) */}
          {!isFullScreen && (
            <div className="w-full flex justify-between bg-zinc-900 text-white rounded-t-md mt-2">
              <button
                className={`flex-1 py-2 ${activeButton === 1 ? "bg-zinc-800 font-bold" : ""}`}
                onClick={() => setActiveButton(1)}
              >
                Open ({openTrades.length})
              </button>
              <button
                className={`flex-1 py-2 ${activeButton === 2 ? "bg-zinc-800 font-bold" : ""}`}
                onClick={() => setActiveButton(2)}
              >
                Pending ({pendingTrades.length})
              </button>
              <button
                className={`flex-1 py-2 ${activeButton === 3 ? "bg-zinc-800 font-bold" : ""}`}
                onClick={() => setActiveButton(3)}
              >
                Closed ({closedTrades.length})
              </button>
            </div>
          )}
          {/* Trade Table (desktop, below chart) */}
          {!isFullScreen && (
            <TradeTable
              trades={activeButton === 1 ? openTrades : activeButton === 2 ? pendingTrades : closedTrades}
              type={activeButton === 1 ? "open" : activeButton === 2 ? "pending" : "closed"}
              askPrice={askPrice}
              bidPrice={bidPrice}
              allProfit={allProfit}
              onCloseTrade={closeTradeFunc}
              onCancelTrade={cancelPendingTradeFunc}
            />
          )}
        </div>

        {/* Right Sidebar: Buy/Sell Controls and Order Controls */}
        <div className="items-center hidden lg:flex border-l-4 border-slate-600 border-box flex-col lg:w-[20vw] w-[100vw] lg:h-[92vh] bg-zinc-950">
          {/* Symbol text moved above BuySellControls */}
          <div className="w-full px-4 py-2 bg-zinc-900">
            <p className="text-white text-xl font-semibold">{symbol ? symbol.toUpperCase() : "BTCUSDT"}</p>
          </div>

          {/* Buy/Sell Controls */}
          <div className="w-full px-4">
            <BuySellControls
              selectButton={selectButton}
              onSelect={handleSelectClick}
              units={units}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              askPrice={latestTradeData ? latestTradeData.askPrice : ""}
              bidPrice={latestTradeData ? latestTradeData.bidPrice : ""}
              disabled={isGameOver}
            />
          </div>

          {/* Order Controls */}
          <div className="w-full px-4 mt-2">
            <OrderControl
              label="Pending"
              isActive={pendingActive}
              value={pendingValue}
              onToggle={handlePendingToggle}
              onChange={e => setPendingValue(Number(e.target.value))}
              onIncrease={increasePendingValue}
              onDecrease={decreasePendingValue}
              unitLabel="USD"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-current"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2z" /></svg>}
            />
            <OrderControl
              label="Take Profit"
              isActive={takeProfitActive}
              value={takeProfitValue}
              onToggle={handleTakeProfitToggle}
              onChange={e => setTakeProfitValue(e.target.value)}
              onIncrease={increasetakeProfit}
              onDecrease={decreasetakeProfit}
              unitLabel="USD"
            />
            <OrderControl
              label="Stop Loss"
              isActive={stopLossActive}
              value={stopLossValue}
              onToggle={handleStopLossToggle}
              onChange={e => setStopLossValue(e.target.value)}
              onIncrease={increaseStopLoss}
              onDecrease={decreaseStopLoss}
              unitLabel="USD"
            />
          </div>

          {/* Place Trade Button */}
          <div className="w-full px-4 mt-4">
            <button
              className={`w-full py-3 rounded-md text-center ${
                units === 0 || selectButton === null 
                  ? "bg-gray-600 text-gray-300" 
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
              disabled={units === 0 || selectButton === null}
              onClick={placeTradeFunction}
            >
              {units === 0 || selectButton === null ? "Select Buy/Sell" : `${selectButton === "sell" ? "Sell" : "Buy"} ${units} units`}
            </button>
          </div>

          {/* Trading Info */}
          <div className="w-full px-4 mt-6 text-white space-y-2">
            <div className="flex justify-between">
              <span>Fees:</span>
              <span>$ 0.25 per trade</span>
            </div>
            <div className="flex justify-between">
              <span>Leverage:</span>
              <span>{leverageValue}</span>
            </div>
            <div className="flex justify-between">
              <span>Margin:</span>
              <span>$ {totalMargin}</span>
            </div>
          </div>

          {/* Alert Popup */}
          <AlertPopup show={showAlert} message={alertMessage} positionClass="absolute bottom-0 lg:right-0 lg:bottom-2" />
        </div>
      </div>
    </div>
  );
}
