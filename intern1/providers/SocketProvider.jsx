"use client";

const { SocketContextProvider } = require("../context/SocketContext");

const SocketProvider = ({ children }) => {
  return (<SocketContextProvider>{children}</SocketContextProvider>);
};

export default SocketProvider;
