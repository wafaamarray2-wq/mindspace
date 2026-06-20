import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://mind-space-ov3r.onrender.com";

// Helper to create a socket with all the right options
function createSocket(token) {
  return io(SOCKET_URL, {
    auth: {
      authorization: `dash ${token}`,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Poll for token changes (login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem("token");
      setToken((prev) => (current !== prev ? current : prev));
    }, 1500);

    const handleStorage = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Connect / disconnect based on token
  useEffect(() => {
    // Tear down old socket if it exists
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    // No token → stay disconnected
    if (!token) return;

    // Create new socket
    const s = createSocket(token);

    s.on("connect", () => {
      console.log("🟢 Socket connected:", s.id);
      setIsConnected(true);
    });

    s.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
      // Server kicked us — reconnect manually
      if (reason === "io server disconnect") {
        s.connect();
      }
    });

    s.on("connect_error", (err) => {
      console.error("⚠️ Socket connection error:", err.message);
      setIsConnected(false);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

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
