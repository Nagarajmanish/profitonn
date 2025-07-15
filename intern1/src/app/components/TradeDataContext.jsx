"use client"

import React, { createContext, useContext, useState } from 'react';

const TradeDataContext = createContext();

export const TradeDataProvider = ({ children }) => {
    const [tradeData, setTradeData] = useState([]);
    const [ohlcData, setOhlcData] = useState({});
    return (
        <TradeDataContext.Provider value={{ tradeData, setTradeData , ohlcData , setOhlcData}}>
            {children}
        </TradeDataContext.Provider>
    );
};

export const useTradeData = () => {
    return useContext(TradeDataContext);
};
