import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Logged-in users send their JWT so the server can offer "Reveal names".
    // Anonymous users connect exactly as before (no token).
    const token = localStorage.getItem("token");
    const newSocket = io(
      "http://localhost:3079",
      token ? { auth: { token } } : {},
    ); // your server URL
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
