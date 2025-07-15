"use client";

import React, { use, useEffect, useState } from "react";
import ToogleButton from "./ToggleButton";
import TradingViewChart from "./ChartComponent";
import { useTradeData } from "./TradeDataContext";
import axios from "axios";
import Timer from "./Timer";
import { useRef } from "react";
import Cookies from "js-cookie";
import { set, toNumber } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSocket } from "../../../context/SocketContext";
// import { useSession } from "next-auth/react";
import Loader from "./Loader";
import { Expand, Minimize } from "lucide-react";

export default function Terminal({
  onClickRotate,
  isFullScreen,
  isRotateOnly,
}) {
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
  // const [opponentBalance, setOpponentBalance] = useState(null);
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

  //next-auth , useSession
  // const { data: session, status } = useSession({
  //   required: true,
  //   onUnauthenticated() {
  //     router.replace("/"); // Redirect if not authenticated
  //   },
  // });

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

  // const [timeLeft, setTimeLeft] = useState(15 * 60); // Timer duration
  // const [currentMinute, setCurrentMinute] = useState(0); // Current minute
  // const [backendDataSent, setBackendDataSent] = useState(false); // Backend flag
  // const [dataSent, setDataSent] = useState(false);
  // const intervalRef = useRef(null); // Store interval ID
  // const [isVisible, setIsVisible] = useState(false); // Track visibility state

  // const stableHandleTimeEnd = useCallback(() => {
  //   handleTimeEnd();
  // }, []); // Memoized function

  // useEffect(() => {
  //   const storedDataSent = localStorage.getItem("dataSent") === "true";
  //   setDataSent(storedDataSent);
  // }, []);

  // const [openPrice, setOpenPrice] = useState(null);
  // const [highPrice, setHighPrice] = useState(null);
  // const [lowPrice, setLowPrice] = useState(null);

  // const lastMinute = Cookies.get("lastMinute");
  // const storedOpenPrice = Cookies.get("openPrice");
  // const storedHighPrice = Cookies.get("highPrice");
  // const storedLowPrice = Cookies.get("lowPrice");

  // // Ensure numeric values or set defaults
  // const initialOpenPrice = storedOpenPrice
  //   ? parseFloat(storedOpenPrice)
  //   : ohlcData.open;
  // const initialHighPrice = storedHighPrice
  //   ? parseFloat(storedHighPrice)
  //   : ohlcData.high;
  // const initialLowPrice = storedLowPrice
  //   ? parseFloat(storedLowPrice)
  //   : ohlcData.low;

  // useEffect(() => {
  //   // Set default values in state
  //   if (!ohlcData || ohlcData.open === null || ohlcData.open === undefined) {
  //     return;
  //   }

  //   setOpenPrice(initialOpenPrice);
  //   setHighPrice(initialHighPrice);
  //   setLowPrice(initialLowPrice);

  //   // If cookies don't exist, initialize them
  //   if (!storedOpenPrice)
  //     Cookies.set("openPrice", ohlcData.open, { expires: 15 / (24 * 60) });
  //   if (!storedHighPrice)
  //     Cookies.set("highPrice", ohlcData.high, { expires: 15 / (24 * 60) });
  //   if (!storedLowPrice)
  //     Cookies.set("lowPrice", ohlcData.low, { expires: 15 / (24 * 60) });

  //   // Check if it's a new minute and update open price
  //   if (lastMinute !== currentMinute.toString()) {
  //     Cookies.set("openPrice", ohlcData.open, { expires: 15 / (24 * 60) });
  //     Cookies.set("lastMinute", currentMinute, { expires: 15 / (24 * 60) });
  //     setOpenPrice(ohlcData.open);

  //     // Reset high and low prices for the new minute
  //     Cookies.set("highPrice", ohlcData.high, { expires: 15 / (24 * 60) });
  //     Cookies.set("lowPrice", ohlcData.low, { expires: 15 / (24 * 60) });
  //     setHighPrice(ohlcData.high);
  //     setLowPrice(ohlcData.low);
  //   }
  // }, [currentMinute, ohlcData]);

  // // Track High and Low Prices Dynamically
  // useEffect(() => {
  //   if (ohlcData.high > highPrice) {
  //     Cookies.set("highPrice", ohlcData.high, { expires: 15 / (24 * 60) });
  //     setHighPrice(ohlcData.high);
  //   }

  //   if (ohlcData.low < lowPrice) {
  //     Cookies.set("lowPrice", ohlcData.low, { expires: 15 / (24 * 60) });
  //     setLowPrice(ohlcData.low);
  //   }
  // }, [ohlcData]);

  // useEffect(() => {
  //   if (!startTime) return; // Ensure startTime is valid
  //   const gameStart = new Date(startTime).getTime(); // Parse startTime from the cookie
  //   const timerDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  //   const targetEndTime = gameStart + timerDuration; // Calculate the end time

  //   const calculateTimeLeft = () => {
  //     const now = new Date().getTime();
  //     const remainingTime = Math.max(targetEndTime - now, 0);

  //     setTimeLeft(Math.floor(remainingTime / 1000));

  //     if (remainingTime <= 0) {
  //       stableHandleTimeEnd(); // Trigger popup

  //       if (!backendDataSent && ohlcData !== null) {
  //         sendOHLCDataToBackend(currentMinute + 1, ohlcData);
  //         setTimeout(() => runPipeline_4(), 1000);
  //         setBackendDataSent(true);
  //       }

  //       if (!dataSent) {
  //         setDataSent(true);
  //         localStorage.setItem("dataSent", "true");
  //       }

  //       clearInterval(intervalRef.current); // Stop timer
  //     }

  //     const elapsedTime = timerDuration - remainingTime;
  //     const currentMinuteInterval = Math.floor(elapsedTime / 60 / 1000);

  //     if (
  //       currentMinuteInterval !== currentMinute &&
  //       currentMinuteInterval >= 0 &&
  //       remainingTime > 0
  //     ) {
  //       setCurrentMinute(currentMinuteInterval);

  //       if (ohlcData !== null) {
  //         sendOHLCDataToBackend(currentMinuteInterval, ohlcData);
  //       }
  //     }
  //   };

  //   calculateTimeLeft();
  //   intervalRef.current = setInterval(calculateTimeLeft, 1000);

  //   return () => clearInterval(intervalRef.current); // Cleanup interval
  // }, [
  //   startTime,
  //   stableHandleTimeEnd,
  //   currentMinute,
  //   ohlcData,
  //   dataSent,
  //   backendDataSent,
  // ]);

  // // Format time as MM:SS
  // const formatTime = (time) => {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = time % 60;
  //   return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
  //     2,
  //     "0"
  //   )}`;
  // };

  // const sendOHLCDataToBackend = async (minute, ohlcData) => {
  //   if (status === "loading" || !session) {
  //     return; // Prevent API call until session is available
  //   }

  //   try {
  //     const response = await axios.post("/api/store-ohlc-data", {
  //       symbol,
  //       gameId: gameId,
  //       sessionId: sessionId,
  //       userId: session.user.id,
  //       username: session.user.name,
  //       startTime,
  //       currentMinute: minute,
  //       ohlc: {
  //         open: openPrice,
  //         high: highPrice,
  //         low: lowPrice,
  //         close: ohlcData.close,
  //       },
  //       currentTime: new Date(),
  //     });
  //   } catch (error) {}
  // };

  // console.log(timeLeft, "hello world",ohlcData);

  const [timeLeft, setTimeLeft] = useState(15 * 60); // Timer duration
  const [currentMinute, setCurrentMinute] = useState(0); // Current minute
  const [backendDataSent, setBackendDataSent] = useState(false); // Backend flag
  const [dataSent, setDataSent] = useState(false);
  const intervalRef = useRef(null); // Store interval ID
  const [isVisible, setIsVisible] = useState(false); // Track visibility state

  const stableHandleTimeEnd = useCallback(() => {
    handleTimeEnd();
  }, []); // Memoized function

  // useEffect(() => {
  //   const storedDataSent = localStorage.getItem("dataSent") === "true";
  //   setDataSent(storedDataSent);
  // }, []);

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

  // const sendOHLCDataToBackend = async (minute, ohlcData) => {
  //   if (status === "loading" || !session) {
  //     return; // Prevent API call until session is available
  //   }

  //   try {
  //     const response = await axios.post("/api/store-ohlc-data", {
  //       symbol,
  //       gameId: gameId,
  //       sessionId: sessionId,
  //       userId: session.user.id,
  //       username: session.user.name,
  //       startTime,
  //       currentMinute: minute,
  //       ohlc: ohlcData,
  //       currentTime: new Date(),
  //     });
  //   } catch (error) {}
  // };

  useEffect(() => {
    if (symbol && (gameId || sessionId || botId)) {
      startTrade({ gameId, sessionId, startTime, amount, symbol, botId });
    }
  }, [sessionId, gameId, botId, symbol]);

  // useEffect(() => {
  //   if (!socket) return;

  //   const handleDisconnect = () => {
  //     let params = {
  //       userId: session.user.id,
  //       username: session.user.name,
  //       gameId,
  //       sessionId,
  //       isGameOver
  //     };

  //     console.log("Sending data on disconnect:", params);

  //     onDisconnectSendTradeData(params);
  //   };

  //   // Ensure no duplicate listeners
  //   socket.off("disconnect", handleDisconnect);
  //   window.removeEventListener("beforeunload", handleDisconnect);

  //   // Listen for the socket disconnect event
  //   socket.on("disconnect", handleDisconnect);

  //   // Also trigger onDisconnectSendTradeData when user closes the tab or reloads
  //   window.addEventListener("beforeunload", handleDisconnect);

  //   return () => {
  //     socket.off("disconnect", handleDisconnect);
  //     window.removeEventListener("beforeunload", handleDisconnect);
  //   };
  // }, [
  //   socket,
  //   session,
  //   isGameOver,
  //   timeLeft,
  //   currentMinute,
  //   symbol,
  //   gameId,
  //   sessionId,
  //   startTime,
  // ]);

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="containerOuter">
      <div
        className={` w-[100vw] h-[40px] lg:h-[8vh]  bg-zinc-950 border-b-2 lg:border-b-4 border-slate-600 text-white flex justify-around lg:justify-between items-center ${
          isFullScreen ? "w-[80vw]" : "w-[100vw]"
        }`}
      >
        <div className="ml-3 text-2xl lg:text-3xl lg:block hidden font-bold text-white  tracking-wide hover:scale-105 transition-transform duration-300">
          Profit
          <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 inline-block text-transparent bg-clip-text ">
            ONN
          </span>
        </div>
        <div className="lg:hidden">
          {!isGameOver && timeLeft > 0 ? (
            <>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "28px", // Font size for a compact design
                  fontWeight: "600", // Bold for emphasis
                  color: "#E5E7EB", // Soft light gray for the text
                  textShadow:
                    "2px 2px 12px rgba(255, 99, 71, 0.6), 0 0 14px rgba(255, 99, 71, 0.4)", // Redish glow + dark shadow for depth
                  maxWidth: "220px", // Compact max width
                  margin: "0 auto",
                }}
              >
                {formatTime(timeLeft)}
              </div>
            </>
          ) : (
            <h1 className="font-bold text-2xl text-red-600 mt-5 text-center animate-blink">
              Time&apos;s Up!
            </h1>
          )}
        </div>
        <div
          className={`flex lg:text-lg lg:hidden items-center ${
            isFullScreen ? "hidden" : "hidden"
          }`}
        >
          <div className="font-bold flex justify-center items-center gap-x-1">
            <div className="text-xl font-thin">$</div>{" "}
            {dynamicBalance !== null ? Number(dynamicBalance).toFixed(3) : " "}
          </div>
        </div>

        {/* Your balance in navbar */}
        <div
          className={`flex justify-around  gap-x-2 ${
            isFullScreen ? "flex " : "hidden sm:flex"
          } `}
        >
          <div
            className={`flex lg:text-lg lg:hidden items-center border-[1px] justify-center h-[7vh] gap-x-4 w-40 rounded-md ${
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
              {dynamicBalance !== null
                ? Number(dynamicBalance).toFixed(3)
                : "-----"}
            </div>
          </div>
          {/* opponent balance in navbar */}
          {((opponentBalance !== null && (oppData.oppName || oppName)) ||
            botBalance) && (
            <div className="flex justify-around lg:text-lg lg:hidden items-center   rounded-md bg-transparent border-slate-600 border-2 h-[7vh] w-48">
              <span>
                {" "}
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

        {/*  */}
        {/* <div
                className={`transition-transform duration-500 ${
                  isSlidingUp
                    ? "translate-y-0"
                    : isDynamicHigher
                    ? "translate-y-0" // Ensure consistency for dynamic higher state
                    : "translate-y-[46px] lg:translate-y-[60px]"
                } ${
                  isFullScreen
                    ? ""
                    : "  flex lg:hidden md:hidden"
                }`}
              >
                <li
                  className={`h-[40px] lg:h-[50px] text-base font-semibold text-white mb-2 rounded-lg flex items-center justify-between px-4 bg-transparent border-2 border-slate-500 
                }`}
                >
                  <div className="flex flex-col items-start">
                    <span>Opponent</span>
                  </div>
                  
                </li>
              </div> */}
        {/* //  )} */}
        <style jsx>{`
          @keyframes blink {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              opacity: 1;
            }
          }

          .animate-blink {
            animation: blink 1s infinite;
          }
        `}</style>

        <div
          className={`${
            isFullScreen ? "flex  justify-end ml-40" : "flex ml-10 "
          }`}
        >
          {showPopup && (
            <div className="fixed  left-1/2 top-14 transform -translate-x-1/2 bg-zinc-950 text-white border-2 border-white rounded-lg p-4 text-center z-50 w-80 shadow-lg">
              <p className="text-sm">
                Click here to rotate the screen for a better experience!
              </p>
              <button
                onClick={handleGotItClick}
                className="mt-2 bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md w-full lg:hover:bg-indigo-500"
              >
                Got it!
              </button>
            </div>
          )}

          {/* Rotate Screen Button */}
          <button
            className={` lg:hidden px-4 py-2 text-white rounded-md shadow-md flex items-center gap-2 relative  ${
              showGlow ? "glow-effect" : "" // Glow effect only before clicking "Got it!"
            }`}
            onClick={onClickRotate}
          >
            {isFullScreen ? <Minimize size={32} /> : <Expand size={32} />}
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)} // Toggle visibility on click
            className={`text-white p-2 rounded-md flex items-center space-x-2 lg:hidden  ${
              isFullScreen ? "hidden " : " sm:block"
            } `}
          >
            {isVisible ? (
              // Cross (X) icon when visible
              <svg
                className="h-8 w-8 text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <div className="relative inline-block">
                <svg
                  className="h-7 w-7 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {/* Notification Badge (Only when openTrades exist) */}
                {openTrades.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-700 text-[10px] text-white">
                    {openTrades.length}
                    <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-teal-200"></div>
                  </div>
                )}
              </div>
            )}
          </button>
        </div>
        {/* Conditionally render the page based on isVisible */}
        {isVisible && (
          // <div className="h-[100vh] w-full fixed top-[50px] left-0 bg-gray-950 text-white border-slate-600 z-50 lg:flex flex-col">
          <div className="h-[100vh] w-full fixed top-[50px] left-0 bg-gray-950 text-white border-slate-600 z-50 lg:flex flex-col">
            <div className="flex text-base font-thin border-b-[1px] border-slate-200 text-slate-500 justify-start h-[36px] lg:mt-0">
              <button
                onClick={() => handleButtonClick(1)}
                className={`w-[100px] ml-1 ${
                  activeButton === 1
                    ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900 border-r-2 font-normal "
                } hover:bg-slate-800 border-slate-600`}
              >
                Open ({openTrades.length})
              </button>
              <button
                onClick={() => handleButtonClick(2)}
                className={`w-[100px] ${
                  activeButton === 2
                    ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900 border-r-2 "
                } hover:bg-slate-800 border-slate-600`}
              >
                Pending ({pendingTrades.length})
              </button>
              <button
                onClick={() => handleButtonClick(3)}
                className={`w-[100px] ${
                  activeButton === 3
                    ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900"
                } hover:bg-slate-800`}
              >
                Closed ({closedTrades.length})
              </button>
            </div>

            {/* Table Section */}
            <div className="h-[100%] overflow-hidden text-[13px]">
              {activeButton !== null && (
                <div className="overflow-y-auto h-[100%] max-h-[190px] custom-scrollbar overflow-x-auto ">
                  {/* Header */}
                  <div className="flex bg-gray-800 text-slate-300 text-[0.7rem] h-8 sticky top-0 gap-x-2">
                    <div className="min-w-[3rem] p-2 text-center flex-1">
                      Symbol
                    </div>
                    <div className="min-w-[3rem] p-2 text-center flex-1">
                      Sell/Buy
                    </div>
                    <div className="min-w-[3rem] p-2 text-center flex-1">
                      Volume
                    </div>
                    {activeButton === 1 && (
                      <div className="min-w-[5rem] p-2 text-center flex-1">
                        CloseTrade
                      </div>
                    )}
                    {activeButton === 2 && (
                      <div className="min-w-[5rem] p-2 text-center flex-1">
                        CancelOrder
                      </div>
                    )}
                    {(activeButton === 1 || activeButton === 3) && (
                      <div className="min-w-[3rem] p-2 text-center flex-1">
                        Profit
                      </div>
                    )}
                    <div className="min-w-[3rem] p-2 text-center flex-1">
                      Margin
                    </div>

                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      OpeningPrice
                    </div>
                    {activeButton === 3 && (
                      <div className="min-w-[5rem] p-2 text-center flex-1">
                        ClosingPrice
                      </div>
                    )}
                    {(activeButton === 1 || activeButton === 2) && (
                      <div className="min-w-[5rem] p-2 text-center flex-1">
                        CurrentPrice
                      </div>
                    )}

                    {(activeButton === 1 || activeButton === 3) && (
                      <div className="min-w-[7rem] p-2 text-center flex-1">
                        OpeningTime
                      </div>
                    )}
                    {activeButton === 3 && (
                      <div className="min-w-[7rem] p-2 text-center flex-1">
                        ClosingTime
                      </div>
                    )}
                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      TakeProfit
                    </div>
                    <div className="min-w-[5rem] p-2 text-center flex-1">
                      StopLoss
                    </div>
                  </div>

                  {/* Render Table Content Based on Active Button */}
                  {openTrades.length === 0 && activeButton === 1 ? (
                    <div className="text-center text-slate-600 text-lg p-3 ">
                      No Open Trade
                    </div>
                  ) : openTrades.length > 0 && activeButton === 1 ? (
                    <>
                      {/* Scrollable Table Body */}
                      <div className="flex flex-col">
                        {openTrades
                          .slice() // Create a shallow copy to avoid mutating the original array
                          .reverse() // Reverse the order of trades
                          .map((row, index) => {
                            // Find the profit for the current trade from allProfit
                            const profitData = allProfit.find(
                              (profit) => profit.id === row.id
                            );
                            const profitOrLoss = profitData
                              ? profitData.profit.toFixed(3)
                              : "0.00";

                            // Convert openingTime to desired format
                            const formattedTime = new Date(
                              row.openingtime
                            ).toLocaleString("en-US", {
                              // month: "short",
                              // day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              second: "numeric",
                              hour12: true,
                            });

                            return (
                              <div key={index} className="flex gap-x-2">
                                <div className="min-w-[3rem] p-2  flex  justify-center">
                                  {row.symbol}
                                </div>
                                <div className="min-w-[3rem] p-2 text-center">
                                  {row.buyorsell}
                                </div>
                                <div className="min-w-[3rem] p-2 text-center">
                                  {row.unitsorlots}
                                </div>
                                <div className="min-w-[5rem] p-2 text-center ">
                                  <button
                                    onClick={() => {
                                      closeTradeFunc(
                                        row.id,
                                        profitOrLoss,
                                        row.buyorsell
                                      );
                                    }}
                                    className={`h-6 rounded-full min-w-[5rem] ${
                                      row.buyorsell === "buy"
                                        ? "bg-blue-700 lg:hover:bg-blue-600"
                                        : "bg-red-700 lg:hover:bg-red-500"
                                    }`}
                                  >
                                    Close
                                  </button>
                                </div>
                                <div className="min-w-[3rem] p-2 text-center ">
                                  <span
                                    className={`${
                                      profitOrLoss < 0
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {profitOrLoss > 0 ? "+" : null}
                                    {profitOrLoss}
                                  </span>
                                </div>
                                <div className="min-w-[3rem] p-2 text-center">
                                  {row.margin}
                                </div>
                                <div className="min-w-[5rem] p-2 text-center ">
                                  {row.openingprice}
                                </div>
                                <div className="min-w-[5rem] p-2 text-center ">
                                  {row.buyorsell === "buy"
                                    ? askPrice
                                    : bidPrice}
                                </div>
                                <div className="min-w-[7rem] p-2 text-[12px] whitespace-nowrap">
                                  {formattedTime}
                                </div>
                                {row.takeprofitvalue === null ? (
                                  <div className="min-w-[5rem] p-2 text-center">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="min-w-[5rem] p-2 text-center ">
                                    {row.takeprofitvalue}
                                  </div>
                                )}
                                {row.stoplossvalue === null ? (
                                  <div className="min-w-[5rem] p-2 text-center">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="min-w-[5rem] p-2 text-center">
                                    {row.stoplossvalue}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : null}

                  {pendingTrades.length === 0 && activeButton === 2 ? (
                    <div className="text-center text-slate-600 text-lg p-3">
                      No Pending Trades
                    </div>
                  ) : pendingTrades.length > 0 && activeButton === 2 ? (
                    <div>
                      {pendingTrades
                        .slice() // Create a shallow copy of the array to avoid mutating the state directly
                        .sort(
                          (a, b) =>
                            new Date(b.closingtime) - new Date(a.closingtime)
                        ) // Sort in descending order by closingTime
                        .map((row, index) => {
                          const openformattedTime = new Date(
                            row.openingtime
                          ).toLocaleString();
                          const closedformattedTime = new Date(
                            row.closingtime
                          ).toLocaleString();
                          return (
                            <div key={index} className="flex gap-x-2">
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.symbol}
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.buyorsell}
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.unitsorlots}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                <button
                                  onClick={() => cancelPendingTradeFunc(row.id)}
                                  className={`h-6 rounded-full min-w-[5rem] ${
                                    row.buyorsell === "buy"
                                      ? "bg-blue-700 hover:bg-blue-600"
                                      : "bg-red-700 hover:bg-red-500"
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.margin}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                {row.openingprice}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                {row.buyorsell === "buy" ? askPrice : bidPrice}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                {row.takeprofitvalue ?? "- - - -"}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                {row.stoplossvalue ?? "- - - -"}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : null}

                  {closedTrades.length === 0 && activeButton === 3 ? (
                    <div className="text-center text-slate-600 text-lg p-3">
                      No Trade History
                    </div>
                  ) : closedTrades.length > 0 && activeButton === 3 ? (
                    <div>
                      {closedTrades
                        .slice() // Create a shallow copy of the array to avoid mutating the state directly
                        .sort(
                          (a, b) =>
                            new Date(b.closingtime) - new Date(a.closingtime)
                        ) // Sort in descending order by closingTime
                        .map((row, index) => {
                          const openformattedTime = new Date(
                            row.openingtime
                          ).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short", // "Jan", "Feb", etc.
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // For AM/PM format
                          });

                          const closedformattedTime = new Date(
                            row.closingtime
                          ).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });
                          return (
                            <div key={index} className="flex gap-x-2 ">
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.symbol}
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.buyorsell}
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.unitsorlots}
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                <span
                                  className={`${
                                    row.profitorloss < 0
                                      ? "text-red-500"
                                      : "text-green-600"
                                  }`}
                                >
                                  {row.profitorloss > 0 ? "+" : null}
                                  {row.profitorloss}
                                </span>
                              </div>
                              <div className="min-w-[3rem] p-2 text-center">
                                {row.margin}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center">
                                {row.openingprice}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center ">
                                {row.closingprice}
                              </div>
                              <div className="min-w-[7rem] p-2 text-[10px] whitespace-nowrap">
                                {openformattedTime}
                              </div>
                              <div className="min-w-[7rem] p-2 text-[10px] whitespace-nowrap">
                                {closedformattedTime}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center">
                                {row.takeprofitvalue ?? "- - - -"}
                              </div>
                              <div className="min-w-[5rem] p-2 text-center">
                                {row.stoplossvalue ?? "- - - -"}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* {isVisible && ();}; */}
        <div className="lg:flex mr-10 gap-x-6 lg:text-lg hidden items-center ">
          <div className="font-bold flex justify-center items-center gap-x-1">
            <div className="text-xl font-thin">$</div>{" "}
            {dynamicBalance !== null ? Number(dynamicBalance).toFixed(3) : " "}
          </div>
        </div>
      </div>

      {/* Popup after the match is over */}
      {isGameOver && sessionId === null && gameId !== null && (
        <div className=" z-50  fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-11/12 max-w-lg bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-3xl shadow-xl p-6 glow-effect">
            <h1 className="mb-4 font-mono text-center text-3xl text-white font-semibold tracking-widest">
              Game Results
            </h1>

            <div className="flex justify-between items-center mb-6 px-4">
              {/* Player Balance */}
              <div className="text-center">
                <div className="text-gray-400 text-sm font-light">
                  Your Balance
                </div>
                <div className="font-bold font-mono text-xl text-green-400 mt-2">
                  {dynamicBalance !== null ? dynamicBalance.toFixed(3) : "--"}
                </div>
              </div>

              {/* Opponent Balance */}
              <div className="text-center">
                <div className="text-gray-400 text-sm font-light">
                  {"Opponent"}&apos;s Balance
                </div>
                <div className="font-bold font-mono text-xl text-red-400 mt-2">
                  {opponentBalance !== null && !isNaN(opponentBalance)
                    ? Number(opponentBalance).toFixed(3)
                    : "--"}
                </div>
              </div>
            </div>

            {/* Outcome Section */}
            <div className="text-center text-white mb-6">
              {dynamicBalance > opponentBalance &&
              bidPrice !== null &&
              askPrice !== null &&
              dynamicBalance !== 0 ? (
                <div>
                  <p className="text-green-500 text-xl font-semibold mb-2">
                    🎉 Victory!
                  </p>
                  <p className="text-gray-300 text-sm">
                    You won by {(dynamicBalance - opponentBalance).toFixed(3)}!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    ₹
                    {["bgchallenge", "plchallenge", "prchallenge"].includes(
                      gameCategory
                    )
                      ? 0.9 * toNumber(opponentBet)
                      : 0.9 * toNumber(amount)}{" "}
                    has been transferred to your wallet.
                  </p>
                </div>
              ) : dynamicBalance < opponentBalance &&
                bidPrice !== null &&
                askPrice !== null &&
                dynamicBalance !== 0 ? (
                <div>
                  <p className="text-red-500 text-xl font-semibold mb-2">
                    😢 You Just Missed
                  </p>
                  <p className="text-gray-300 text-sm">
                    Better luck next time!
                  </p>
                </div>
              ) : Math.abs(dynamicBalance - opponentBalance) < 0.0001 &&
                bidPrice !== null &&
                askPrice !== null &&
                dynamicBalance !== 0 ? (
                <div>
                  <p className="text-yellow-400 text-xl font-semibold mb-2">
                    🤝 It&apos;s a Tie!
                  </p>
                  <p className="text-gray-300 text-sm">No winners this time.</p>
                </div>
              ) : (
                <p className="text-yellow-400 text-lg font-medium animate-pulse">
                  Fetching results...
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setConfirmGameOver(true);
                  router.push("/dashboard");
                }}
                className="w-[45%] font-mono text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg shadow-md"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup after demo trade session */}
      {isGameOver && sessionId !== null && gameId === null && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative w-11/12 max-w-lg bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl p-8 glow-effect">
            <h1 className="mb-6 font-mono text-center text-4xl text-white font-semibold tracking-widest">
              Your Performance
            </h1>

            {/* Display demo trade performance details */}
            <div className="text-white space-y-6">
              {/* Total Trades */}
              <div className="flex justify-between">
                <span className="font-semibold text-indigo-400 text-lg">
                  Total Trades:
                </span>
                <span className="text-lg text-yellow-300">
                  {closedTrades.length}
                </span>
              </div>

              {/* Total Profit/Loss */}
              <div className="flex justify-between">
                <span className="font-semibold text-indigo-400 text-lg">
                  Total Profit/Loss:
                </span>
                <span
                  className={`text-lg ${
                    dynamicBalance - initialFixedBalance < 0
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {(dynamicBalance - initialFixedBalance).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Exit Button at the Bottom */}
            <div className="mt-8 flex justify-center w-full">
              <button
                onClick={() => {
                  Cookies.remove("sessionId");
                  Cookies.remove("startTime");
                  router.push("/dashboard");
                }}
                className="px-8 py-3 w-2/4 text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="containerInner1 flex flex-col lg:flex-row w-[100vw] h-[100%]">
        <div className="lg:w-[22vw] lg:border-r-4 lg:border-slate-600 lg:border-box w-[100vw] h-[14vh] lg:h-[92vh] bg-zinc-950 ">
          <div className="w-[100%] h-[55%] flex flex-col items-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-[96%] mt-4 py-2 pl-10 mx-2 text-gray-700 bg-[#FFF6F6] border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 hidden lg:block"
            />
            {/* 
            <div
              className={`w-[96%] mx-2 mt-3 lg:block flex justify-around gap-x-2 z-10 lg:z-0 lg:mt-6 ${
                isGameOver ? "opacity-50" : ""
              } ${isFullScreen ? "hidden" : "sm:hidden lg:block xl:block"}`}
            >
              {dynamicBalance >= opponentBalance ? (
                <>
                  <div
                    className={`transition-transform duration-500 translate-y-0`}
                  >
                    <li
                      className={`h-[40px] lg:w-auto w-[46vw] lg:h-[50px] text-base font-semibold text-white border-[1px] mb-2 rounded-lg flex items-center justify-between px-4 
            border-green-500 animate-pulseGreen`}
                    >
                      <div className="flex flex-col items-start">
                        <span>You</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>
                          {dynamicBalance !== null
                            ? `$${dynamicBalance.toFixed(3)}`
                            : "-------"}
                        </span>
                      </div>
                    </li>
                  </div>

                  {(opponentBalance !== null && (oppData.oppName || oppName)) ||
                    (botBalance && (
                      <div
                        className={`transition-transform duration-500 translate-y-0`}
                      >
                        <li
                          className={`h-[40px] w-[46vw] lg:w-auto lg:h-[50px] text-base font-semibold text-white mb-2 rounded-lg flex items-center justify-between px-4 
              border-[1px] border-slate-500`}
                        >
                          <div className="flex flex-col items-start">
                            <span>
                              {" "}
                              {opponentBalance !== null
                                ? "Opponent"
                                : botBalance !== null
                                ? `Bot`
                                : "-------"}
                            </span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span>
                              {opponentBalance !== null
                                ? `$${Number(opponentBalance).toFixed(3)}`
                                : botBalance !== null
                                ? `$${Number(botBalance).toFixed(3)}`
                                : "-------"}
                            </span>
                          </div>
                        </li>
                      </div>
                    ))}
                </>
              ) : (
                <>
                  <div
                    className={`transition-transform duration-500 translate-y-0`}
                  >
                    <li
                      className={`h-[40px] w-[46vw] lg:w-auto lg:h-[50px] text-base font-semibold text-white mb-2 rounded-lg flex items-center justify-between px-4 border-[1px]`}
                    >
                      <div className="flex flex-col items-start">
                        <span>
                          {" "}
                          {opponentBalance !== null
                            ? "Opponent"
                            : botBalance !== null
                            ? `Bot`
                            : "-------"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span>
                          {opponentBalance !== null
                            ? `$${Number(opponentBalance).toFixed(3)}`
                            : botBalance !== null
                            ? ` $${Number(botBalance).toFixed(3)}`
                            : "-------"}
                        </span>
                      </div>
                    </li>
                  </div>

                  <div
                    className={`transition-transform duration-500 translate-y-0`}
                  >
                    <li
                      className={`h-[40px] lg:w-auto w-[46vw] lg:h-[50px] text-base font-semibold text-white border-[1px] mb-2 rounded-lg flex items-center justify-between px-4 
                      border-red-500 animate-pulseRed`}
                    >
                      <div className="flex flex-col items-start">
                        <span>You</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span>
                          {dynamicBalance !== null
                            ? `$${dynamicBalance.toFixed(3)}`
                            : "-------"}
                        </span>
                      </div>
                    </li>
                  </div>
                </>
              )}
            </div> */}

            <div
              className={`w-[96%] mx-2 mt-3 lg:block flex justify-around gap-x-2 z-10 lg:z-0 lg:mt-6 ${
                isGameOver ? "opacity-50" : ""
              } ${isFullScreen ? "hidden" : "sm:hidden lg:block xl:block"}`}
            >
              <div
                className={` h-[40px] lg:w-auto w-[46vw] lg:h-[50px] text-base font-semibold text-white border-[1px] mb-2 rounded-lg flex items-center justify-between px-4  ${
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
                  {dynamicBalance !== null
                    ? Number(dynamicBalance).toFixed(3)
                    : "-----"}
                </div>
              </div>
              {/* opponent balance in navbar */}
              {((opponentBalance !== null && (oppData.oppName || oppName)) ||
                botBalance) && (
                <div
                  className="h-[40px] w-[46vw] lg:w-auto lg:h-[50px] text-base font-semibold text-white mb-2 rounded-lg flex items-center justify-between px-4 
              border-[1px] border-slate-500"
                >
                  <span>
                    {" "}
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

            {/* <div className="text-4xl font-bold text-white mt-2">Timer</div>
            <Timer startTime={oppData.startTime}  />
          </div> */}

            {/* Timer of the trade session */}
            <div className="hidden lg:block mt-8">
              {!isGameOver && timeLeft > 0 ? (
                <>
                  <h1
                    className="text-center font-bold"
                    style={{
                      fontSize: "40px", // Adjusted font size for balance
                      color: "#F9F8EB", // Light color for professional look
                      textShadow: "3px 3px 6px rgba(0, 0, 0, 0.7)", // Subtle shadow for depth
                      fontFamily: "'Poppins', sans-serif", // Added Poppins font for a professional appearance
                    }}
                  >
                    Time Left:
                  </h1>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "50px", // Font size for a compact design
                      fontWeight: "700", // Bold for emphasis
                      color: "#E5E7EB", // Soft light gray for the text
                      textShadow:
                        "2px 2px 8px rgba(255, 99, 71, 0.6), 0 0 25px rgba(0, 0, 0, 0.7)", // Redish glow + dark shadow for depth
                      maxWidth: "220px", // Compact max width
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
          </div>
          <div className="w-[100%] h-[25%] text-white hidden lg:block bg-zinc-950 border-t-4 mt-10  border-slate-600 border-box">
            <h1 className="pt-4 ml-5 text-xl font-semibold text-white">
              Your Profile
            </h1>
            <ul className="">
              <li className="w-[90%] ml-5 mx-2 p-2  border-b-2 flex items-center justify-between">
                <span>BTCUSDT</span>
                <button className="text-3xl">+</button>
              </li>
              <li className="w-[90%] ml-5 mx-2 p-2 border-b-2 flex items-center justify-between">
                <span>ETHUSDT</span>
                <button className="text-3xl">+</button>
              </li>
              <li className="w-[90%] ml-5 mx-2 p-2  border-b-2 flex items-center justify-between">
                <span>USDTUSD</span>
                <button className="text-3xl">+</button>
              </li>
            </ul>
          </div>
        </div>

        {/* div2 charts*/}
        <div
          className={` lg:w-[75vw] w-[100vw] h-[100vh] lg:h-[92vh] bg-slate-80 flex flex-col ${
            isFullScreen
              ? "w-[100vw] flex lg:w-[75vw]"
              : "w-[100vw] lg:w-[75vw]"
          }`}
        >
          <div className="flex justify-center ">
            {/* Trading View Component */}
            <div
              ref={chartRef}
              id="chart"
              className={`
                ${
                  opponentBalance !== null && (oppData.oppName || oppName)
                    ? " lg:mt-0"
                    : "lg:mt-0 "
                } terminal border-slate-600 bg-zinc-950 lg:text-8xl text-white flex items-center justify-center ${
                isFullScreen
                  ? "-mt-14  w-[80vw]  flex-col "
                  : "w-[100vw] -mt-14 lg:w-[70vw]"
              }  `}
            >
              <div
                className={`${
                  isFullScreen
                    ? "w-[80vw] border-b-4 border-slate-600"
                    : " w-[100vw] lg:[80vw]"
                }`}
              >
                <TradingViewChart />
              </div>

              <div
                className={`  h-[30vh] w-[80vw]  bg-gray-950 text-white border-slate-600  lg:flex ${
                  isFullScreen ? "flex-row lg:hidden" : "hidden lg:hidden"
                }`}
              >
                <div className="flex text-base font-thin border-b-[1px] border-slate-200 text-slate-500 justify-start h-[36px] lg:mt-0">
                  <button
                    onClick={() => handleButtonClick(1)}
                    className={`w-[100px] ml-1 ${
                      activeButton === 1
                        ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                        : "bg-slate-900 border-r-2 font-normal "
                    } hover:bg-slate-800 border-slate-600`}
                  >
                    Open ({openTrades.length})
                  </button>
                  <button
                    onClick={() => handleButtonClick(2)}
                    className={`w-[100px] ${
                      activeButton === 2
                        ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                        : "bg-slate-900 border-r-2 "
                    } hover:bg-slate-800 border-slate-600`}
                  >
                    Pending ({pendingTrades.length})
                  </button>
                  <button
                    onClick={() => handleButtonClick(3)}
                    className={`w-[100px] ${
                      activeButton === 3
                        ? "bg-slate-700 text-white border-t-2 border-yellow-500"
                        : "bg-slate-900"
                    } hover:bg-slate-800`}
                  >
                    Closed ({closedTrades.length})
                  </button>
                </div>

                {/* Table Section */}
                <div className="h-[100%] overflow-hidden text-[13px]">
                  {activeButton !== null && (
                    <div className="overflow-y-auto h-[100%] max-h-[190px] custom-scrollbar overflow-x-auto ">
                      {/* Header */}
                      <div className="flex bg-gray-800 text-slate-300 text-[1.5vw] h-8 sticky top-0 gap-x-2">
                        <div className="min-w-[6vw] p-2 text-center flex-1">
                          Symbol
                        </div>
                        <div className="min-w-[6vw] p-2 text-center flex-1">
                          Sell/Buy
                        </div>
                        <div className="min-w-[6vw] p-2 text-center flex-1">
                          Volume
                        </div>
                        <div className="min-w-[6vw] p-2 text-center flex-1">
                          Margin
                        </div>
                        <div className="min-w-[9vw] p-2 text-center flex-1">
                          OpeningPrice
                        </div>
                        {activeButton === 3 && (
                          <div className="min-w-[9vw] p-2 text-center flex-1">
                            ClosingPrice
                          </div>
                        )}
                        {(activeButton === 1 || activeButton === 2) && (
                          <div className="min-w-[9vw] p-2 text-center flex-1">
                            CurrentPrice
                          </div>
                        )}
                        {(activeButton === 1 || activeButton === 3) && (
                          <div className="min-w-[6vw] p-2 text-center flex-1">
                            Profit
                          </div>
                        )}
                        {activeButton === 1 && (
                          <div className="min-w-[9vw] p-2 text-center flex-1">
                            CloseTrade
                          </div>
                        )}
                        {(activeButton === 1 || activeButton === 3) && (
                          <div className="min-w-[14vw] p-2 text-center flex-1">
                            OpeningTime
                          </div>
                        )}
                        {activeButton === 3 && (
                          <div className="min-w-[14vw] p-2 text-center flex-1">
                            ClosingTime
                          </div>
                        )}
                        <div className="min-w-[9vw] p-2 text-center flex-1">
                          TakeProfit
                        </div>
                        <div className="min-w-[9vw] p-2 text-center flex-1">
                          StopLoss
                        </div>
                        {activeButton === 2 && (
                          <div className="min-w-[9vw] p-2 text-center flex-1">
                            CancelOrder
                          </div>
                        )}
                      </div>

                      {/* Render Table Content Based on Active Button */}
                      {openTrades.length === 0 && activeButton === 1 ? (
                        <div className="text-center text-slate-600 text-lg p-3 ">
                          No Open Trade
                        </div>
                      ) : openTrades.length > 0 && activeButton === 1 ? (
                        <>
                          {/* Scrollable Table Body */}
                          <div className="flex flex-col">
                            {openTrades
                              .slice() // Create a shallow copy to avoid mutating the original array
                              .reverse() // Reverse the order of trades
                              .map((row, index) => {
                                // Find the profit for the current trade from allProfit
                                const profitData = allProfit.find(
                                  (profit) => profit.id === row.id
                                );
                                const profitOrLoss = profitData
                                  ? profitData.profit.toFixed(3)
                                  : "0.00";

                                // Convert openingTime to desired format
                                const formattedTime = new Date(
                                  row.openingtime
                                ).toLocaleString("en-US", {
                                  // month: "short",
                                  // day: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  second: "numeric",
                                  hour12: true,
                                });

                                return (
                                  <div key={index} className="flex gap-x-2">
                                    <div className="min-w-[6vw] p-2  flex  justify-center">
                                      {row.symbol}
                                    </div>
                                    <div className="min-w-[6vw] p-2 text-center">
                                      {row.buyorsell}
                                    </div>
                                    <div className="min-w-[6vw] p-2 text-center">
                                      {row.unitsorlots}
                                    </div>
                                    <div className="min-w-[6vw] p-2 text-center">
                                      {row.margin}
                                    </div>
                                    <div className="min-w-[9vw] p-2 text-center ">
                                      {row.openingprice}
                                    </div>
                                    <div className="min-w-[9vw] p-2 text-center ">
                                      {row.buyorsell === "buy"
                                        ? askPrice
                                        : bidPrice}
                                    </div>
                                    <div className="min-w-[6vw] p-2 text-center ">
                                      <span
                                        className={`${
                                          profitOrLoss < 0
                                            ? "text-red-500"
                                            : "text-green-600"
                                        }`}
                                      >
                                        {profitOrLoss > 0 ? "+" : null}
                                        {profitOrLoss}
                                      </span>
                                    </div>
                                    <div className="min-w-[9vw] p-2 text-center ">
                                      <button
                                        onClick={() => {
                                          closeTradeFunc(
                                            row.id,
                                            profitOrLoss,
                                            row.buyorsell
                                          );
                                        }}
                                        className={`h-6 rounded-full min-w-[9vw] ${
                                          row.buyorsell === "buy"
                                            ? "bg-blue-700 hover:bg-blue-600"
                                            : "bg-red-700 hover:bg-red-500"
                                        }`}
                                      >
                                        Close
                                      </button>
                                    </div>
                                    <div className="min-w-[14vw] p-2 text-[12px] whitespace-nowrap">
                                      {formattedTime}
                                    </div>
                                    {row.takeprofitvalue === null ? (
                                      <div className="min-w-[9vw] p-2 text-center">
                                        - - - -
                                      </div>
                                    ) : (
                                      <div className="min-w-[9vw] p-2 text-center ">
                                        {row.takeprofitvalue}
                                      </div>
                                    )}
                                    {row.stoplossvalue === null ? (
                                      <div className="min-w-[9vw] p-2 text-center">
                                        - - - -
                                      </div>
                                    ) : (
                                      <div className="min-w-[9vw] p-2 text-center">
                                        {row.stoplossvalue}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </>
                      ) : null}

                      {pendingTrades.length === 0 && activeButton === 2 ? (
                        <div className="text-center text-slate-600 text-lg p-3">
                          No Pending Trades
                        </div>
                      ) : pendingTrades.length > 0 && activeButton === 2 ? (
                        <div>
                          {pendingTrades
                            .slice() // Create a shallow copy of the array to avoid mutating the state directly
                            .sort(
                              (a, b) =>
                                new Date(b.closingtime) -
                                new Date(a.closingtime)
                            ) // Sort in descending order by closingTime
                            .map((row, index) => {
                              const openformattedTime = new Date(
                                row.openingtime
                              ).toLocaleString();
                              const closedformattedTime = new Date(
                                row.closingtime
                              ).toLocaleString();
                              return (
                                <div key={index} className="flex gap-x-2">
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.symbol}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.buyorsell}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.unitsorlots}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.margin}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    {row.openingprice}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    {row.buyorsell === "buy"
                                      ? askPrice
                                      : bidPrice}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    {row.takeprofitvalue ?? "- - - -"}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    {row.stoplossvalue ?? "- - - -"}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    <button
                                      onClick={() =>
                                        cancelPendingTradeFunc(row.id)
                                      }
                                      className={`h-6 rounded-full min-w-[9vw] ${
                                        row.buyorsell === "buy"
                                          ? "bg-blue-700 hover:bg-blue-600"
                                          : "bg-red-700 hover:bg-red-500"
                                      }`}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : null}

                      {closedTrades.length === 0 && activeButton === 3 ? (
                        <div className="text-center text-slate-600 text-lg p-3">
                          No Trade History
                        </div>
                      ) : closedTrades.length > 0 && activeButton === 3 ? (
                        <div>
                          {closedTrades
                            .slice() // Create a shallow copy of the array to avoid mutating the state directly
                            .sort(
                              (a, b) =>
                                new Date(b.closingtime) -
                                new Date(a.closingtime)
                            ) // Sort in descending order by closingTime
                            .map((row, index) => {
                              const openformattedTime = new Date(
                                row.openingtime
                              ).toLocaleString("en-US", {
                                day: "numeric",
                                month: "short", // "Jan", "Feb", etc.
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // For AM/PM format
                              });

                              const closedformattedTime = new Date(
                                row.closingtime
                              ).toLocaleString("en-US", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              });
                              return (
                                <div key={index} className="flex gap-x-2 ">
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.symbol}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.buyorsell}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.unitsorlots}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    {row.margin}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center">
                                    {row.openingprice}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center ">
                                    {row.closingprice}
                                  </div>
                                  <div className="min-w-[6vw] p-2 text-center">
                                    <span
                                      className={`${
                                        row.profitorloss < 0
                                          ? "text-red-500"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {row.profitorloss > 0 ? "+" : null}
                                      {row.profitorloss}
                                    </span>
                                  </div>
                                  <div className="min-w-[14vw] p-2 text-[10px] whitespace-nowrap">
                                    {openformattedTime}
                                  </div>
                                  <div className="min-w-[14vw] p-2 text-[10px] whitespace-nowrap">
                                    {closedformattedTime}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center">
                                    {row.takeprofitvalue ?? "- - - -"}
                                  </div>
                                  <div className="min-w-[9vw] p-2 text-center">
                                    {row.stoplossvalue ?? "- - - -"}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`items-center hidden border-l-2 border-zinc-950 border-box flex-col lg:w-[20vw]  w-[22vw] h-[100vh] lg:h-[92vh] bg-zinc-950  ${
                isFullScreen ? "sm:flex w-[20vw] -mt-32" : "  "
              }`}
            >
              <div className="absolute top-15 ">
                <p
                  className={` text-slate-300 p-2  text-base ${
                    symbol ? "" : "invisible"
                  }  ${isGameOver === true ? "opacity-50" : ""}`}
                >
                  {symbol ? symbol.toUpperCase() : "Placeholder"}
                </p>
              </div>

              <div className="flex justify-center gap-x-1  w-[100%] mt-10">
                <button
                  onClick={() => handleSelectClick("sell")}
                  className={`transition-colors duration-50 p-3 w-[45%] h-16 rounded-lg border-2 -ml-3  text-center ${
                    selectButton === "sell"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-gray-950 text-red-400 border-red-600"
                  } hover:bg-red-600 hover:text-slate-100`}
                >
                  <span>Sell</span>
                  <br />
                  <p className="text-[14px] ">
                    {latestTradeData ? latestTradeData.askPrice : ""}
                    {/* {latestTradeData.price} */}
                  </p>
                </button>
                <button
                  onClick={() => handleSelectClick("buy")}
                  className={`transition-colors duration-50 p-3 w-[45%] h-16 rounded-lg border-2 text-center ${
                    selectButton === "buy"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-gray-950 text-blue-400 border-blue-600"
                  } hover:bg-blue-600 hover:text-slate-100`}
                >
                  <span>Buy </span>
                  <br />
                  <p className="text-[14px] ">
                    {latestTradeData ? latestTradeData.bidPrice : ""}
                  </p>
                </button>
              </div>
              <div className="flex w-[91%] -ml-3 h-[60px] text-white items-center bg-slate-900 mt-1">
                <div className="w-[69%] flex ml-2 justify-between">
                  <input
                    className="w-16 ml-4 text-slate-200 bg-slate-900 h-12 no-spinner"
                    placeholder="0.01"
                    step="0.01"
                    type="number"
                    inputMode="decimal"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    style={{
                      border: "none",
                      outline: "none",
                      MozAppearance: "textfield", // Specific for Firefox
                    }}
                  />

                  {/* Units selecting Buttons */}
                  <div
                    className={`relative cursor-pointer  flex items-center " ${
                      isGameOver === true ? "opacity-50" : ""
                    }`}
                  >
                    <span className="-ml-2 ">units</span>
                    {/* <button className=" text-xs mt-1 bg-slate-900">
                      ▽
                    </button> */}
                  </div>
                </div>
                <div className="w-[25%]  flex flex-col text-2xl ml-2 font-semibold mr-1">
                  <button
                    onClick={handleIncrease}
                    className="ring-2  text-slate-400  hover:bg-slate-700 opacity-80"
                  >
                    +
                  </button>
                  <button
                    onClick={handleDecrease}
                    className="ring-2 text-slate-400  hover:bg-slate-700 opacity-60"
                  >
                    -
                  </button>
                </div>
              </div>

              <div className="pending flex flex-col items-center w-[100%] h-auto mt-1">
                <div className="flex items-center w-full lg:h-[50px] h-[28px]">
                  <ToogleButton
                    onToggle={handlePendingToggle}
                    isActive={pendingActive}
                  />
                  <span className="ml-4 text-sm text-white">Pending</span>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                    </svg>
                  </span>
                </div>
                {pendingActive && (
                  <div className="dropdown-content  bg-zinc-950 text-white rounded w-full -mb-4">
                    <div className="flex border-2 border-slate-600 rounded w-[100%] h-[25px]">
                      <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                        <input
                          className="ml-1 bg-zinc-950  w-20 border-none outline-none"
                          type="number"
                          inputMode="decimal"
                          placeholder={`${pendingValue}`}
                          value={pendingValue}
                          style={{
                            border: "none",
                            outline: "none",
                            MozAppearance: "textfield", // Specific for Firefox
                          }}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (newValue >= 0) {
                              setPendingValue(newValue);
                            }
                          }}
                        />
                        <span className="-ml-10  text-xs">USD</span>
                      </div>
                      <button
                        onClick={decreasePendingValue}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                      >
                        -
                      </button>
                      <button
                        onClick={increasePendingValue}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="Take Profit flex flex-col items-center w-[100%] h-auto mt-1">
                <div className="flex items-center w-full h-[50px]">
                  <ToogleButton
                    onToggle={handleTakeProfitToggle}
                    isActive={takeProfitActive}
                    value={takeProfitValue}
                    inputMode="decimal"
                  />
                  <span className="ml-4 text-sm text-white">Take Profit</span>
                </div>

                {takeProfitActive && (
                  <div className="dropdown-content bg-zinc-950  text-white rounded w-full -mb-4 -mt-3">
                    <div className="flex border-2 border-slate-600  rounded w-[100%] h-[25px]">
                      <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                        <input
                          className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                          type="number"
                          inputMode="decimal"
                          placeholder={takeProfitValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                          value={takeProfitValue || ""}
                          style={{
                            border: "none",
                            outline: "none",
                            MozAppearance: "textfield", // Specific for Firefox
                          }}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // If the value is empty, set it to an empty string, otherwise set the number
                            if (newValue === "" || !isNaN(Number(newValue))) {
                              setTakeProfitValue(newValue);
                            }
                          }}
                        />

                        <span className="-ml-10 text-xs">USD</span>
                      </div>
                      <button
                        onClick={decreasetakeProfit}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                      >
                        -
                      </button>
                      <button
                        onClick={increasetakeProfit}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="Stop Loss flex flex-col items-center w-[100%] h-auto mt-1">
                <div className="flex items-center w-full h-[50px]">
                  <ToogleButton
                    onToggle={handleStopLossToggle}
                    isActive={stopLossActive}
                    value={stopLossValue}
                    inputMode="decimal"
                  />
                  <span className="ml-4 text-sm   text-white">Stop Loss</span>
                </div>

                {stopLossActive && (
                  <div className="dropdown-content bg-zinc-950 text-white   w-full -mb-4 -mt-3">
                    <div className="flex border-2 rounded border-slate-600 w-[100%] h-[25px]">
                      <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                        <input
                          className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                          type="number"
                          inputMode="decimal"
                          placeholder={stopLossValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                          value={stopLossValue || ""}
                          style={{
                            border: "none",
                            outline: "none",
                            MozAppearance: "textfield", // Specific for Firefox
                          }}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // If the value is empty, set it to an empty string, otherwise set the number
                            if (newValue === "" || !isNaN(Number(newValue))) {
                              setStopLossValue(newValue);
                            }
                          }}
                        />

                        <span className="-ml-10 text-xs">USD</span>
                      </div>
                      <button
                        onClick={decreaseStopLoss}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800 "
                      >
                        -
                      </button>
                      <button
                        onClick={increaseStopLoss}
                        className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className={`flex items-center justify-center w-[91%] -ml-3 rounded mt-5 h-[60px] text-slate-900 
              ${
                units === 0 || selectButton === null
                  ? "bg-slate-500 cursor-not-allowed"
                  : selectButton === "sell"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : selectButton === "buy"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-500"
              }`}
                disabled={units === 0 || selectButton === null} // Disable button if units are 0 or no active button
                onClick={() => {
                  placeTradeFunction();
                  scrollDownFunc();
                }}
              >
                <span className="text-base">
                  {units === 0 || selectButton === null
                    ? "Select Buy/Sell"
                    : selectButton === "sell"
                    ? `Sell ${units} units`
                    : selectButton === "buy"
                    ? `Buy ${units} units`
                    : "Select Buy/Sell"}
                </span>
              </button>

              {selectButton &&
                units > 0 && ( // Only show second button when selectButton is set and units are greater than 0
                  <button
                    onClick={() => {
                      setSelectButton(null);
                    }}
                    className={`text-white w-[90%] h-[32px] flex items-center justify-center -ml-3 mt-2 rounded p-2 
                  ${
                    selectButton === "sell"
                      ? "border-2 border-red-400 hover:bg-zinc-800"
                      : selectButton === "buy"
                      ? "border-2 border-blue-500 hover:bg-zinc-800"
                      : ""
                  }`}
                  >
                    Cancel
                  </button>
                )}

              <div className="mt-4 w-[90%] text-white">
                <div className="flex justify-between items-center w-[90%]">
                  <span>Fees: </span>
                  <span>$0.25/trade</span>
                </div>
                <div className="flex justify-between items-center w-[90%]">
                  <span>Leverage: </span>
                  <span>{leverageValue}</span>
                </div>
                <div className="flex justify-between items-center w-[90%]">
                  <span>Margin: </span>
                  <span>$ {totalMargin}</span>
                </div>
              </div>
              {showAlert && (
                <div className="absolute bottom-0 lg:right-0 lg:bottom-2 lg:flex lg:justify-center lg:items-center z-40">
                  <p className="w-56 min-h-16 max-h-32 p-2 flex justify-center items-center text-center rounded-lg text-base text-white bg-black shadow-lg border-2 border-slate-400 overflow-hidden break-words">
                    {alertMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider for resizing */}
          {!isFullScreen && (
            <div
              className="h-1  cursor-ns-resize bg-slate-600"
              onMouseDown={handleMouseDown}
              style={{ cursor: "ns-resize" }}
            ></div>
          )}

          {/* div 3 for mobile buy and sell button */}
          <div
            className={`items-center lg:hidden border-l-4 border-slate-600 border-box flex-col lg:w-[20vw] w-[100vw] h-[10vh] lg:h-[92vh] bg-zinc-950 mb-10 ${
              isFullScreen ? "hidden" : ""
            }`}
          >
            {/* <div className="absolute">
              <p
                className={` text-slate-300 p-2  text-base ${
                  symbol ? "" : "invisible"
                }  ${isGameOver === true ? "opacity-50" : ""}`}
              >
                {symbol ? symbol.toUpperCase() : "Placeholder"}
              </p>
            </div> */}

            <div
              className={`flex justify-between w-[100%] h-14 gap-x-4 mt-2 ${
                isFullScreen
                  ? "block lg:hidden md:hidden "
                  : " lg:hidden  md:flex"
              }`}
            >
              <button
                onClick={() => handleSelectClick("sell")}
                className={`transition-colors duration-50 p-3 w-[49%] h-full rounded-lg border-2  text-center flex items-center justify-center ${
                  selectButton === "sell"
                    ? "bg-red-600 text-white border-red-500"
                    : "bg-gray-950 text-red-400 border-red-600"
                } hover:bg-red-600 hover:text-slate-100`}
              >
                <div className="gap-x-1">
                  <span className="text-base ">Sell </span>
                  <br />
                  <p className="text-[14px] ">
                    {latestTradeData ? latestTradeData.askPrice : ""}
                    {/* {latestTradeData.price} */}
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleSelectClick("buy")}
                className={`transition-colors duration-50 p-3 w-[49%] h-full rounded-lg border-2 text-center flex items-center justify-center ${
                  selectButton === "buy"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-gray-950 text-blue-400 border-blue-600"
                } hover:bg-blue-600 hover:text-slate-100`}
              >
                <div className="gap-x-1">
                  <span className="text-base ">Buy </span>
                  <br />
                  <p className="text-[14px] ">
                    {latestTradeData ? latestTradeData.bidPrice : ""}
                    {/* {latestTradeData.price} */}
                  </p>
                </div>
              </button>
            </div>
            <div className="flex w-[100%] h-[80px] text-white items-center bg-slate-900 mt-5">
              <div className="w-[70%] flex ml-2 justify-between">
                <input
                  className="w-16 text-slate-200 bg-slate-900 h-12 no-spinner"
                  placeholder="0.01"
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  style={{
                    border: "none",
                    outline: "none",
                    MozAppearance: "textfield", // Specific for Firefox
                  }}
                />

                {/* Units selecting Buttons */}
                <div
                  className={`relative cursor-pointer  flex items-center" ${
                    isGameOver === true ? "opacity-50" : ""
                  }`}
                >
                  <span className="mt-3">units</span>
                  <button className="ml-3 text-xs mt-1 bg-slate-900">▽</button>
                </div>
              </div>
              <div className="w-[25%] border-l-[1px] border-gray-400 flex flex-col text-2xl ml-4 font-semibold mr-1">
                <button onClick={handleIncrease} className="mb-1 opacity-60">
                  +
                </button>
                <div className="w-[100%] h-[1px] bg-gray-400"></div>
                <button
                  onClick={handleDecrease}
                  className="text-4xl opacity-60"
                >
                  -
                </button>
              </div>
            </div>
            {/* pending */}
            <div className="pending flex flex-col items-center w-[90%] h-auto mt-1">
              <div className="flex items-center w-full h-[50px]">
                <ToogleButton
                  onToggle={handlePendingToggle}
                  isActive={pendingActive}
                />
                <span className="ml-4 text-m text-white">Pending</span>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                  </svg>
                </span>
              </div>
              {pendingActive && (
                <div className="dropdown-content  bg-zinc-950 text-white rounded w-full -mb-4 -mt-1">
                  <div className="flex border-2 border-slate-600 rounded w-[100%] h-[32px]">
                    <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                      <input
                        className="ml-1 bg-zinc-950  w-20 border-none outline-none"
                        type="number"
                        inputMode="decimal"
                        placeholder={`${pendingValue}`}
                        value={pendingValue}
                        style={{
                          border: "none",
                          outline: "none",
                          MozAppearance: "textfield", // Specific for Firefox
                        }}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          if (newValue >= 0) {
                            setPendingValue(newValue);
                          }
                        }}
                      />
                      <span className="mr-1">USD</span>
                    </div>
                    <button
                      onClick={decreasePendingValue}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                    >
                      -
                    </button>
                    <button
                      onClick={increasePendingValue}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* take profit */}
            <div className="Take Profit flex flex-col items-center w-[90%] h-auto mt-2">
              <div className="flex items-center w-full h-[50px]">
                <ToogleButton
                  onToggle={handleTakeProfitToggle}
                  isActive={takeProfitActive}
                  value={takeProfitValue}
                  inputMode="decimal"
                />
                <span className="ml-4 text-m text-white">Take Profit</span>
              </div>

              {takeProfitActive && (
                <div className="dropdown-content bg-zinc-950  text-white rounded w-full -mb-4 -mt-1">
                  <div className="flex border-2 border-slate-600  rounded w-[100%] h-[32px]">
                    <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                      <input
                        className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                        type="number"
                        inputMode="decimal"
                        placeholder={takeProfitValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                        value={takeProfitValue || ""}
                        style={{
                          border: "none",
                          outline: "none",
                          MozAppearance: "textfield", // Specific for Firefox
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // If the value is empty, set it to an empty string, otherwise set the number
                          if (newValue === "" || !isNaN(Number(newValue))) {
                            setTakeProfitValue(newValue);
                          }
                        }}
                      />

                      <span className="mr-1">USD</span>
                    </div>
                    <button
                      onClick={decreasetakeProfit}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                    >
                      -
                    </button>
                    <button
                      onClick={increasetakeProfit}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* stop loss */}
            <div className="Stop Loss flex flex-col items-center w-[90%]  h-auto mt-2">
              <div className="flex items-center w-full h-[50px]">
                <ToogleButton
                  onToggle={handleStopLossToggle}
                  isActive={stopLossActive}
                  value={stopLossValue}
                  inputMode="decimal"
                />
                <span className="ml-4 text-m text-white">Stop Loss</span>
              </div>

              {stopLossActive && (
                <div className="dropdown-content bg-zinc-950 text-white w-full">
                  <div className="flex border-2 rounded border-slate-600 w-[100%] h-[32px]">
                    <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                      <input
                        className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                        type="number"
                        inputMode="decimal"
                        placeholder={stopLossValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                        value={stopLossValue || ""}
                        style={{
                          border: "none",
                          outline: "none",
                          MozAppearance: "textfield", // Specific for Firefox
                        }}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          // If the value is empty, set it to an empty string, otherwise set the number
                          if (newValue === "" || !isNaN(Number(newValue))) {
                            setStopLossValue(newValue);
                          }
                        }}
                      />

                      <span className="mr-1">USD</span>
                    </div>
                    <button
                      onClick={decreaseStopLoss}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800 "
                    >
                      -
                    </button>
                    <button
                      onClick={increaseStopLoss}
                      className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* buy sell confirm button */}
            <div
              ref={tradeSectionRef}
              className="w-[100%] gap-x-1 flex justify-evenly"
            >
              {selectButton &&
                units > 0 && ( // Only show the "Cancel" button when selectButton is set and units are greater than 0
                  <button
                    onClick={() => {
                      setSelectButton(null); // Reset selection
                    }}
                    className={`text-white mt-2 rounded p-2 
        ${
          selectButton === "sell"
            ? "border-2 border-red-400 hover:bg-zinc-800"
            : selectButton === "buy"
            ? "border-2 border-blue-500 hover:bg-zinc-800"
            : ""
        }
        ${
          units === 0 || selectButton === null ? "w-[90%]" : "w-[49%]"
        }  // Dynamic width logic
      `}
                  >
                    Cancel
                  </button>
                )}
              <button
                className={`flex items-center justify-center mt-2 rounded h-[60px] text-slate-900 
    ${
      units === 0 || selectButton === null
        ? "bg-slate-500 cursor-not-allowed w-[100%]" // Set width to 90% when no selection is made
        : selectButton === "sell"
        ? "bg-red-500 text-white hover:bg-red-600 w-[49%]"
        : selectButton === "buy"
        ? "bg-blue-600 text-white hover:bg-blue-700 w-[48%]"
        : "bg-slate-500"
    }`}
                disabled={units === 0 || selectButton === null} // Disable button if units are 0 or no active button
                onClick={placeTradeFunction}
              >
                <span className="text-base">
                  {units === 0 || selectButton === null
                    ? "Select Buy/Sell"
                    : selectButton === "sell"
                    ? `Sell ${units} units`
                    : selectButton === "buy"
                    ? `Buy ${units} units`
                    : "Select Buy/Sell"}
                </span>
              </button>
            </div>

            <div className="mt-4 w-[90%] text-white">
              <div className="flex justify-between items-center w-[100%]">
                <span>Fees: </span>
                <span>$0.25/order</span>
              </div>
              <div className="flex justify-between items-center w-[100%]">
                <span>Leverage: </span>
                <span>{leverageValue}</span>
              </div>
              <div className="flex justify-between items-center w-[100%]">
                <span>Margin: </span>
                <span>$ {totalMargin}</span>
              </div>
            </div>
            {showAlert && (
              <div className="absolute right-0 bottom-2 flex justify-center items-center z-40">
                <p className="w-56 min-h-16 max-h-32 p-2 flex justify-center items-center text-center rounded-lg text-base text-white bg-black shadow-lg border-2 border-slate-400 overflow-hidden break-words">
                  {alertMessage}
                </p>
              </div>
            )}
          </div>

          {/* Buttons and Table Section */}
          <div className="h-[20vh] w-[100%] hidden bg-zinc-950 text-white  border-slate-600 lg:flex flex-col">
            <div className="flex text-base font-thin text-slate-500 justify-start h-[30%] w-[40%]  mt-8 lg:mt-0">
              <button
                onClick={() => handleButtonClick(1)}
                className={`w-[120px] ${
                  activeButton === 1
                    ? "bg-slate-800 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900"
                } hover:bg-slate-800 border-slate-600`}
              >
                Open ({openTrades.length})
              </button>
              <button
                onClick={() => handleButtonClick(2)}
                className={`w-[120px] ${
                  activeButton === 2
                    ? "bg-slate-800 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900"
                } hover:bg-slate-800 border-slate-600`}
              >
                Pending ({pendingTrades.length})
              </button>
              <button
                onClick={() => handleButtonClick(3)}
                className={`w-[120px] ${
                  activeButton === 3
                    ? "bg-slate-800 text-white border-t-2 border-yellow-500"
                    : "bg-slate-900"
                } hover:bg-slate-800`}
              >
                Closed ({closedTrades.length})
              </button>
            </div>

            {/* Table Section */}
            <div className="h-[80%] overflow-hidden text-[13px]">
              {activeButton !== null && (
                <div className="overflow-y-auto h-full max-h-[190px] custom-scrollbar overflow-x-auto w-full">
                  {/* Header */}
                  <div className="flex bg-gray-900 text-slate-400 text-[12px] h-8 sticky top-0 z-10 gap-x-2 w-full">
                    <div className="w-[70px] p-2   text-center flex-shrink-0">
                      Symbol
                    </div>
                    <div className="w-[70px]  p-2 text-center flex-shrink-0">
                      Sell/Buy
                    </div>
                    <div className="w-[70px] p-2 text-center flex-shrink-0">
                      Volume
                    </div>
                    <div className="w-[70px]  p-2 text-center flex-shrink-0">
                      Margin
                    </div>
                    <div className="w-[85px]  p-2 text-center flex-shrink-0">
                      OpeningPrice
                    </div>
                    {activeButton === 3 && (
                      <div className="w-[85px] p-2   text-center flex-shrink-0">
                        ClosingPrice
                      </div>
                    )}
                    {(activeButton === 1 || activeButton === 2) && (
                      <div className="w-[85px]  p-2  text-center flex-shrink-0">
                        CurrentPrice
                      </div>
                    )}
                    {(activeButton === 1 || activeButton === 3) && (
                      <div className="w-[70px]  p-2 text-center flex-shrink-0">
                        Profit
                      </div>
                    )}
                    {activeButton === 1 && (
                      <div className="w-[85px] p-2  text-center flex-shrink-0">
                        CloseTrade
                      </div>
                    )}

                    {(activeButton === 1 || activeButton === 3) && (
                      <div className="w-[115px] p-2 text-center flex-shrink-0">
                        OpeningTime
                      </div>
                    )}
                    {activeButton === 3 && (
                      <div className="w-[115px]   p-2 text-center  ">
                        ClosingTime
                      </div>
                    )}
                    <div className="w-[70px]  p-2 text-center ">TakeProfit</div>
                    <div className="w-[70px]  p-2  text-center">StopLoss</div>
                    {activeButton === 2 && (
                      <div className="w-[90px]  p-2  text-center">
                        CancelOrder
                      </div>
                    )}
                  </div>

                  {openTrades.length === 0 && activeButton === 1 ? (
                    <div className="text-center text-slate-600 text-lg p-3">
                      No Open Trade
                    </div>
                  ) : openTrades.length > 0 && activeButton === 1 ? (
                    <>
                      {/* Scrollable Table Body */}
                      <div className="flex flex-col">
                        {openTrades
                          .slice() // Create a shallow copy to avoid mutating the original array
                          .reverse() // Reverse the order of trades
                          .map((row, index) => {
                            // Find the profit for the current trade from allProfit
                            const profitData = allProfit.find(
                              (profit) => profit.id === row.id
                            );
                            const profitOrLoss = profitData
                              ? profitData.profit.toFixed(3)
                              : "0.00";

                            // Convert openingTime to desired format
                            const formattedTime = new Date(
                              row.openingtime
                            ).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              second: "numeric",
                              hour12: true,
                            });

                            return (
                              <div key={index} className="flex gap-x-2">
                                <div className="w-[70px] p-2 text-center">
                                  {row.symbol}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.buyorsell}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.unitsorlots}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.margin}
                                </div>
                                <div className="w-[85px] p-2 text-center ">
                                  {row.openingprice}
                                </div>
                                <div className="w-[85px] p-2 text-center ">
                                  {row.buyorsell === "buy"
                                    ? askPrice
                                    : bidPrice}
                                </div>
                                <div className="w-[70px] p-2 text-center ">
                                  <span
                                    className={`${
                                      profitOrLoss < 0
                                        ? "text-red-500"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {profitOrLoss > 0 ? "+" : null}
                                    {profitOrLoss}
                                  </span>
                                </div>
                                <div className="w-[85px] p-2 text-center ">
                                  <button
                                    onClick={() => {
                                      closeTradeFunc(
                                        row.id,
                                        profitOrLoss,
                                        row.buyorsell
                                      );
                                    }}
                                    className={`h-6 rounded-full w-[60px] ${
                                      row.buyorsell === "buy"
                                        ? "bg-blue-700 hover:bg-blue-600"
                                        : "bg-red-700 hover:bg-red-500"
                                    }`}
                                  >
                                    Close
                                  </button>
                                </div>
                                <div className="w-[115px] p-2 text-[12px] whitespace-nowrap">
                                  {formattedTime}
                                </div>
                                {row.takeprofitvalue === null ? (
                                  <div className="w-[70px] p-2 text-center">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="w-[70px] p-2 text-center ">
                                    {row.takeprofitvalue}
                                  </div>
                                )}
                                {row.stoplossvalue === null ? (
                                  <div className="w-[70px] p-2 text-center">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="w-[70px] p-2 text-center">
                                    {row.stoplossvalue}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : null}

                  {pendingTrades.length === 0 && activeButton === 2 ? (
                    <div className="text-center text-slate-600 text-lg p-3">
                      No Pending Trades
                    </div>
                  ) : pendingTrades.length > 0 && activeButton === 2 ? (
                    <>
                      <div>
                        {pendingTrades
                          .slice() // Create a shallow copy of the array to avoid mutating the state directly
                          .sort(
                            (a, b) =>
                              new Date(b.closingtime) - new Date(a.closingtime)
                          ) // Sort in descending order by closingTime
                          .map((row, index) => {
                            const openformattedTime = new Date(
                              row.openingtime
                            ).toLocaleString();
                            const closedformattedTime = new Date(
                              row.closingtime
                            ).toLocaleString();
                            return (
                              <div key={index} className="flex gap-x-2">
                                <div className="w-[70px] p-2 text-center">
                                  {row.symbol}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.buyorsell}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.unitsorlots}
                                </div>
                                <div className="w-[70px] p-2 text-center">
                                  {row.margin}
                                </div>
                                <div className="w-[85px] p-2 text-center ">
                                  {row.openingprice}
                                </div>
                                <div className="w-[85px] p-2 text-center ">
                                  {row.buyorsell === "buy"
                                    ? askPrice
                                    : bidPrice}
                                </div>
                                {row.takeprofitvalue === null ? (
                                  <div className="w-[70px] p-2 text-center ">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="w-[70px] p-2 text-center ">
                                    {row.takeprofitvalue}
                                  </div>
                                )}
                                {row.stoplossvalue === null ? (
                                  <div className="w-[70px] p-2 text-center ">
                                    - - - -
                                  </div>
                                ) : (
                                  <div className="w-[70px] p-2 text-center ">
                                    {row.stoplossvalue}
                                  </div>
                                )}
                                <div className="w-[90px] p-2 text-center ">
                                  <button
                                    onClick={() => {
                                      cancelPendingTradeFunc(row.id);
                                    }}
                                    className={`h-6 rounded-full w-[60px] ${
                                      row.buyorsell === "buy"
                                        ? "bg-blue-700 hover:bg-blue-600"
                                        : "bg-red-700 hover:bg-red-500"
                                    }`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : null}

                  {closedTrades.length === 0 && activeButton === 3 ? (
                    <div className="text-center text-slate-600 text-lg p-3">
                      No Trade History
                    </div>
                  ) : closedTrades.length > 0 && activeButton === 3 ? (
                    <div>
                      {closedTrades
                        .slice() // Create a shallow copy of the array to avoid mutating the state directly
                        .sort(
                          (a, b) =>
                            new Date(b.closingtime) - new Date(a.closingtime)
                        ) // Sort in descending order by closingTime
                        .map((row, index) => {
                          const openformattedTime = new Date(
                            row.openingtime
                          ).toLocaleString();
                          const closedformattedTime = new Date(
                            row.closingtime
                          ).toLocaleString();
                          return (
                            <div key={index} className="flex gap-x-2 ">
                              <div className="w-[70px] p-2 text-center">
                                {row.symbol}
                              </div>
                              <div className="w-[70px] p-2 text-center">
                                {row.buyorsell}
                              </div>
                              <div className="w-[70px] p-2 text-center">
                                {row.unitsorlots}
                              </div>
                              <div className="w-[70px] p-2 text-center">
                                {row.margin}
                              </div>
                              <div className="w-[85px] p-2 text-center">
                                {row.openingprice}
                              </div>
                              <div className="w-[85px] p-2 text-center ">
                                {row.closingprice}
                              </div>
                              <div className="w-[70px] p-2 text-center">
                                <span
                                  className={` ${
                                    row.profitorloss < 0
                                      ? "text-red-500"
                                      : "text-green-600"
                                  }`}
                                >
                                  {row.profitorloss > 0 ? "+" : null}
                                  {row.profitorloss}
                                </span>
                              </div>
                              <div className="w-[115px] p-2  text-[10px] whitespace-nowrap">
                                {openformattedTime}
                              </div>
                              <div className="w-[115px] p-2 text-[10px] whitespace-nowrap">
                                {closedformattedTime}
                              </div>
                              {row.takeprofitvalue === null ? (
                                <div className="w-[70px] p-2 text-center">
                                  - - - -
                                </div>
                              ) : (
                                <div className="w-[70px] p-2 text-center">
                                  {row.takeprofitvalue}
                                </div>
                              )}
                              {row.stoplossvalue === null ? (
                                <div className="w-[70px] p-2 text-center">
                                  - - - -
                                </div>
                              ) : (
                                <div className="w-[70px] p-2 text-center">
                                  {row.stoplossvalue}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* div 3 */}
        <div className="items-center hidden lg:flex border-l-4 border-slate-600 border-box flex-col lg:w-[20vw]  w-[100vw]  lg:h-[92vh] bg-zinc-950 ">
          <div className="absolute top-15 ">
            <p
              className={` text-slate-300 p-2 lg:block hidden text-base ${
                symbol ? "" : "invisible"
              }  ${isGameOver === true ? "opacity-50" : ""}`}
            >
              {symbol ? symbol.toUpperCase() : "Placeholder"}
            </p>
          </div>

          <div className="flex justify-between w-[90%] h-[80px] mt-10">
            <button
              onClick={() => handleSelectClick("sell")}
              className={`transition-colors duration-50 p-3 w-[49%] h-full rounded-lg border-2  text-center ${
                selectButton === "sell"
                  ? "bg-red-600 text-white border-red-500"
                  : "bg-gray-950 text-red-400 border-red-600"
              } hover:bg-red-600 hover:text-slate-100`}
            >
              <span>Sell </span>
              <br />
              <p className="text-[14px] ">
                {latestTradeData ? latestTradeData.askPrice : ""}
                {/* {latestTradeData.price} */}
              </p>
            </button>
            <button
              onClick={() => handleSelectClick("buy")}
              className={`transition-colors duration-50 p-3 w-[49%] h-full rounded-lg border-2 text-center ${
                selectButton === "buy"
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-gray-950 text-blue-400 border-blue-600"
              } hover:bg-blue-600 hover:text-slate-100`}
            >
              <span>Buy </span>
              <br />
              <p className="text-[14px] ">
                {latestTradeData ? latestTradeData.bidPrice : ""}
              </p>
            </button>
          </div>
          <div className="flex w-[90%] h-[70px] text-white items-center bg-slate-900 mt-5">
            <div className="w-[70%] flex ml-2 justify-between">
              <input
                className="w-16 text-slate-200 bg-slate-900 h-12 no-spinner"
                placeholder="0.01"
                step="0.01"
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                style={{
                  border: "none",
                  outline: "none",
                  MozAppearance: "textfield", // Specific for Firefox
                }}
              />

              {/* Units selecting Buttons */}
              <div
                className={`relative cursor-pointer  flex items-center" ${
                  isGameOver === true ? "opacity-50" : ""
                }`}
              >
                <span className="mt-3">units</span>
                <button className="ml-3 text-xs mt-1 bg-slate-900">▽</button>
              </div>
            </div>
            <div className="w-[25%] flex flex-col text-2xl ml-4 font-semibold mr-1">
              <button
                onClick={handleIncrease}
                className="ring-2 text-slate-400 mb-1 hover:bg-slate-700 opacity-80"
              >
                +
              </button>
              <button
                onClick={handleDecrease}
                className="ring-2 text-slate-400 hover:bg-slate-700 opacity-60"
              >
                -
              </button>
            </div>
          </div>

          <div className="pending flex flex-col items-center w-[90%] h-auto mt-1">
            <div className="flex items-center w-full lg:h-[50px] h-[28px]">
              <ToogleButton
                onToggle={handlePendingToggle}
                isActive={pendingActive}
              />
              <span className="ml-4 text-m text-white">Pending</span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              </span>
            </div>
            {pendingActive && (
              <div className="dropdown-content  bg-zinc-950 text-white rounded w-full -mb-4 -mt-1">
                <div className="flex border-2 border-slate-600 rounded w-[100%] h-[32px]">
                  <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                    <input
                      className="ml-1 bg-zinc-950  w-20 border-none outline-none"
                      type="number"
                      inputMode="decimal"
                      placeholder={`${pendingValue}`}
                      value={pendingValue}
                      style={{
                        border: "none",
                        outline: "none",
                        MozAppearance: "textfield", // Specific for Firefox
                      }}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        if (newValue >= 0) {
                          setPendingValue(newValue);
                        }
                      }}
                    />
                    <span className="mr-1">USD</span>
                  </div>
                  <button
                    onClick={decreasePendingValue}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                  >
                    -
                  </button>
                  <button
                    onClick={increasePendingValue}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="Take Profit flex flex-col items-center w-[90%] h-auto mt-2">
            <div className="flex items-center w-full h-[50px]">
              <ToogleButton
                onToggle={handleTakeProfitToggle}
                isActive={takeProfitActive}
                value={takeProfitValue}
                inputMode="decimal"
              />
              <span className="ml-4 text-m text-white">Take Profit</span>
            </div>

            {takeProfitActive && (
              <div className="dropdown-content bg-zinc-950  text-white rounded w-full -mb-4 -mt-1">
                <div className="flex border-2 border-slate-600  rounded w-[100%] h-[32px]">
                  <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                    <input
                      className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                      type="number"
                      inputMode="decimal"
                      placeholder={takeProfitValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                      value={takeProfitValue || ""}
                      style={{
                        border: "none",
                        outline: "none",
                        MozAppearance: "textfield", // Specific for Firefox
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // If the value is empty, set it to an empty string, otherwise set the number
                        if (newValue === "" || !isNaN(Number(newValue))) {
                          setTakeProfitValue(newValue);
                        }
                      }}
                    />

                    <span className="mr-1">USD</span>
                  </div>
                  <button
                    onClick={decreasetakeProfit}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                  >
                    -
                  </button>
                  <button
                    onClick={increasetakeProfit}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="Stop Loss flex flex-col items-center w-[90%] h-auto mt-2">
            <div className="flex items-center w-full h-[50px]">
              <ToogleButton
                onToggle={handleStopLossToggle}
                isActive={stopLossActive}
                value={stopLossValue}
                inputMode="decimal"
              />
              <span className="ml-4 text-m text-white">Stop Loss</span>
            </div>

            {stopLossActive && (
              <div className="dropdown-content bg-zinc-950 text-white   w-full -mb-4 -mt-1">
                <div className="flex border-2 rounded border-slate-600 w-[100%] h-[32px]">
                  <div className="w-[60%] h-[100%] text-sm flex items-center justify-between">
                    <input
                      className="ml-1 bg-zinc-950 w-20 border-none outline-none"
                      type="number"
                      inputMode="decimal"
                      placeholder={stopLossValue === "" ? "" : "0"} // Empty placeholder when input is cleared
                      value={stopLossValue || ""}
                      style={{
                        border: "none",
                        outline: "none",
                        MozAppearance: "textfield", // Specific for Firefox
                      }}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // If the value is empty, set it to an empty string, otherwise set the number
                        if (newValue === "" || !isNaN(Number(newValue))) {
                          setStopLossValue(newValue);
                        }
                      }}
                    />

                    <span className="mr-1">USD</span>
                  </div>
                  <button
                    onClick={decreaseStopLoss}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800 "
                  >
                    -
                  </button>
                  <button
                    onClick={increaseStopLoss}
                    className="w-[20%] h-[100%] border-l-2 border-slate-600 text-xl flex items-center justify-center hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className={`flex items-center justify-center mt-8 w-[90%] rounded h-[60px] text-slate-900 
        ${
          units === 0 || selectButton === null
            ? "bg-slate-500 cursor-not-allowed"
            : selectButton === "sell"
            ? "bg-red-500 text-white hover:bg-red-600"
            : selectButton === "buy"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-slate-500"
        }`}
            disabled={units === 0 || selectButton === null} // Disable button if units are 0 or no active button
            onClick={placeTradeFunction}
          >
            <span className="text-base">
              {units === 0 || selectButton === null
                ? "Select Buy/Sell"
                : selectButton === "sell"
                ? `Sell ${units} units`
                : selectButton === "buy"
                ? `Buy ${units} units`
                : "Select Buy/Sell"}
            </span>
          </button>

          {selectButton &&
            units > 0 && ( // Only show second button when selectButton is set and units are greater than 0
              <button
                onClick={() => {
                  setSelectButton(null);
                }}
                className={`text-white w-[90%] mt-2 rounded p-2 
            ${
              selectButton === "sell"
                ? "border-2 border-red-400 hover:bg-zinc-800"
                : selectButton === "buy"
                ? "border-2 border-blue-500 hover:bg-zinc-800"
                : null
            }`}
              >
                Cancel
              </button>
            )}

          <div className="mt-4 w-[90%] text-white">
            <div className="flex justify-between items-center w-[90%]">
              <span className="mb-2">Fees: </span>
              <span>$ 0.25 per trade</span>
            </div>
            <div className="flex justify-between items-center w-[90%]">
              <span className="mb-2">Leverage: </span>
              <span>{leverageValue}</span>
            </div>
            <div className="flex justify-between items-center w-[90%]">
              <span className="mb-2">Margin: </span>
              <span>$ {totalMargin}</span>
            </div>
          </div>
          {showAlert && (
            <div className="absolute bottom-0 lg:right-0 lg:bottom-2 lg:flex lg:justify-center lg:items-center z-40">
              <p className="w-[80%] max-w-72 sm:max-w-64 md:max-w-80 min-h-12 md:min-h-16 p-2 flex justify-center items-center text-center rounded-lg text-sm md:text-base text-white bg-black shadow-lg border-2 border-slate-400 overflow-hidden break-words">
                {alertMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
