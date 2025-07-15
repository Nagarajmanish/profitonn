"use client"; // Ensure this is at the top if you're using Next.js
import React, { useEffect, useRef, useState } from "react";
import { useTradeData } from "./TradeDataContext"; // Import the context
import axios from "axios";
import { useSession } from "next-auth/react";

const TradingViewChart = () => {
  const chartContainerRef = useRef(null);
  // const { data: session, status } = useSession();
  const { setTradeData, setOhlcData, tradeData } = useTradeData(); // Get the setTradeData function from context
  const [indicatorName, setIndicatorName] = useState("");
  const [toolName, setToolName] = useState("");
  const [timeInterval, setTimeInetval] = useState("");
  const [data, setData] = useState([]);
    let status = "unloading";

  let session = {
    user: {
      email: "priyanshuranjancosmicx@gmail.com",
      id: "101334696226767318614",
      name: "priyanshuranjancosmicx",
    },
  };  
  class Datafeed {
    constructor() {
      this.aggregatedBar = null;
      this.aggregationInterval = 1000; // 1 second in milliseconds
      this.intervalStart = null;
    }

    onReady(callback) {
      setTimeout(
        () =>
          callback({
            exchanges: [
              { value: "BINANCE", name: "Binance", desc: "Binance Exchange" },
            ],
            symbolsTypes: [{ name: "crypto", value: "crypto" }],
            supported_resolutions: [
              "1",
              "5",
              "15",
              "30",
              "60",
              "240",
              "1D",
              "5s",
            ], // Added "5s"
          }),
        0
      );
    }

    resolveSymbol(
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback
    ) {
      const symbolStub = {
        name: symbolName,
        ticker: symbolName,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "Binance",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        intraday_multipliers: ["1", "5", "15", "30", "60", "240"], // Added 5s as well
        supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D"], // Added "5s"
        volume_precision: 8,
        data_status: "streaming",
      };
      setTimeout(() => onSymbolResolvedCallback(symbolStub), 0);
    }
    getBars(
      symbolInfo,
      resolution,
      { from, to },
      onHistoryCallback,
      onErrorCallback,
      firstDataRequest
    ) {
      
      const binanceSymbol = symbolInfo.ticker.replace("BINANCE:", "");
      const interval = this.convertResolution(resolution);
      console.log(interval)
      const BinanceUrl = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&startTime=${
        from * 1000
      }&endTime=${to * 1000}`;
    
      fetch(`http://localhost:5000/proxy?url=${encodeURIComponent(BinanceUrl)}`)
        .then((response) => response.json())
        .then((data) => {
          if (!Array.isArray(data) || data.length === 0) {
            onHistoryCallback([], { noData: true });
            return;
          }
    
          // Sorting data to ensure chronological order
          const bars = data
            .map((el) => ({
              time: el[0], // Binance returns time in milliseconds
              open: parseFloat(el[1]),
              high: parseFloat(el[2]),
              low: parseFloat(el[3]),
              close: parseFloat(el[4]),
              volume: parseFloat(el[5]),
            }))
            .sort((a, b) => a.time - b.time); // Ensure bars are sorted by time
    
          onHistoryCallback(bars, { noData: false });
        })
        .catch((err) => {
          console.error("Error fetching historical data:", err);
          onErrorCallback(err);
        });
    }
    

    subscribeBars(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) {
      const binanceSymbol = symbolInfo.ticker
        .replace("BINANCE:", "")
        .toLowerCase();
      const interval = this.convertResolution(resolution);

      // WebSocket connection for Kline data (price bars)
      this.binanceSocket = new WebSocket(
        `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${interval}`
      );
      this.binanceSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const klineData = data.k;
        const currentTime = klineData.t;
        const currentPrice = parseFloat(klineData.c);

        console.log(interval,"interval")
        const open = parseFloat(klineData.o);
        const high = parseFloat(klineData.h);
        const low = parseFloat(klineData.l);
        const close = parseFloat(klineData.c);
        const volume = parseFloat(klineData.v);

        setOhlcData({
          open,
          high,
          low,
          close,
          volume,
        });

        // Create a new bar if the interval has changed
        if (!this.aggregatedBar || currentTime !== this.intervalStart) {
          if (this.aggregatedBar) {
            onRealtimeCallback(this.aggregatedBar);
          }
          this.intervalStart = currentTime;
          this.aggregatedBar = {
            time: currentTime,
            open,
            high,
            low,
            close,
            volume,
            currentPrice,
          };

          // Update the trade data with the current price
          // setTradeData([{ time: currentTime, price: currentPrice, symbol: binanceSymbol }]);
        } else {
          // Update the existing bar with the new data
          this.aggregatedBar.high = Math.max(this.aggregatedBar.high, high);
          this.aggregatedBar.low = Math.min(this.aggregatedBar.low, low);
          this.aggregatedBar.close = close;
          this.aggregatedBar.volume += volume;

          // Update the trade data with the current price only
          // setTradeData([{ time: currentTime, price: currentPrice, symbol: binanceSymbol }]);
        }

        onRealtimeCallback(this.aggregatedBar);
      };

      // WebSocket connection for Depth (Bid/Ask) data
      this.depthSocket = new WebSocket(
        `wss://stream.binance.com:9443/ws/${binanceSymbol}@depth20`
      );
      this.depthSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Ensure bids and asks are defined and are arrays
        const bids = Array.isArray(data.bids) ? data.bids : [];
        const asks = Array.isArray(data.asks) ? data.asks : [];

        setData(bids);
        // Fetch the best bid and ask prices
        const bestBidPrice =
          bids.length > 0 && Array.isArray(bids[0])
            ? parseFloat(bids[0][0])
            : null;
        const bestAskPrice =
          asks.length > 0 && Array.isArray(asks[0])
            ? parseFloat(asks[0][0])
            : null;

        // Export the bid and ask prices along with the current price
        const tradeData = {
          time: Date.now(),
          price: this.aggregatedBar ? this.aggregatedBar.currentPrice : null, // Latest trade price
          symbol: binanceSymbol,
          bidPrice: bestBidPrice,
          askPrice: bestAskPrice,
        };

        // You can send this to a function that updates your UI or logging mechanism
        setTradeData([tradeData]);
      };

      this.depthSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.depthSocket.onclose = () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        setTimeout(
          () =>
            this.subscribeBars(
              symbolInfo,
              resolution,
              onRealtimeCallback,
              subscriberUID,
              onResetCacheNeededCallback
            ),
          1000
        );
      };
    }

    convertResolution(resolution) {
      const mapping = {
        "1": "1m",
        "5": "5m",
        "15": "15m",
        "30": "30m",
        "60": "1h",
        "120": "2h",
        "240": "4h",
        "360": "6h",
        "720": "12h",
        "1D": "1d",
        "1W": "1w",
        "1M": "1M",
      };
    
      return mapping[resolution] || "1m"; // Default to 1m if unknown resolution
    }
    
  }

  function getCookieValue(name) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    if (match) return match[2];
    return null;
  }

  const storeIndicatorCount = async () => {
    try {
      if (status === "loading" || !session) {
        return; // Prevent API call until session is available
      }
      // Check if at least one value is not null or empty
      if (indicatorName || toolName || timeInterval) {
        // Prepare the payload only if there's data
        const payload = {
          userId: session.user.id,
          username: session.user.name,
        };

        if (indicatorName) payload.indicatorName = indicatorName;
        if (toolName) payload.toolName = toolName;
        if (timeInterval) payload.timeInterval = timeInterval;

        const response = await axios.post("/api/storeIndicatorCount", payload);

        if (response.status === 201) {
          setTimeInetval(""); // Clear timeInterval
          setIndicatorName(""); // Clear indicatorName
          setToolName(""); // Clear toolName
        }
      }
    } catch (error) {
      console.error("Error storing indicator count:", error);
    }
  };

  useEffect(() => {
    storeIndicatorCount();
  }, [indicatorName, toolName, timeInterval]);

  useEffect(() => {
    const loadTradingViewScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "./charting_library/charting_library.standalone.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadTradingViewScript().then(() => {
      const widget = new window.TradingView.widget({
        symbol: "BINANCE:BTCUSDT",
        interval: "1", // default interval
        container: chartContainerRef.current,
        datafeed: new Datafeed(),
        library_path: "./charting_library/",
        locale: "en",
        timezone: "Asia/Kolkata",
        disabled_features: ["use_localstorage_for_settings"],
        theme: "Dark",
        precision: 10000,
        autosize: "autosize",
      });
      widget.onChartReady(() => {
        widget.subscribe("study", (params) => {
          setIndicatorName(params.value);
          console.log("Indicator added: ", params);
          console.log("Indicator name: ", params.value);
        });
        widget.subscribe("drawing", (params) => {
          setToolName(params.value);
          console.log("Tool Used:", params);
          console.log("Tool Name:", params.value);
        });
        const chart = widget.activeChart();
        chart.onIntervalChanged().subscribe(null, (interval) => {
          setTimeInetval(interval);
          console.log("Selected Interval: ", interval);
        });
      });

      return () => {
        // Clean up WebSocket connections here if needed
      };
    });
  }, []);
  return (
    <div
      ref={chartContainerRef}
      className="w-full  h-[64vh] sm:h-[90vh] lg:h-[72vh] xl:h-[72vh]" // Responsive height adjustments
    />
  );
};

export default TradingViewChart;
