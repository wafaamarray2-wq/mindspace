import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // We only connect the socket if we have an authenticated user/token
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize Socket connection
    // Using environment variable or default to the Render deployment URL
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://mind-space-ov3r.onrender.com";

    const socketInstance = io(SOCKET_URL, {
      auth: {
        authorization: `dash ${token}`,
      },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount or user change
    return () => {
      console.log("🧹 Cleaning up socket connection...");
      socketInstance.disconnect();
    };
  }, [user]); // Re-run connection check when user state changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
