import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const WaitingRoom = () => {
  const [status, setStatus] = useState("Connecting to server...");
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Update connection status
    const onConnect = () => {
      setConnected(true);
      setStatus("Waiting for another user...");
      socket.emit("find-match");
    };

    const onDisconnect = () => {
      setConnected(false);
      setStatus("Disconnected. Trying to reconnect...");
    };

    // If already connected
    if (socket.connected) {
      onConnect();
    } else {
      socket.once("connect", onConnect);
    }

    socket.on("disconnect", onDisconnect);

    const onWaiting = () => {
      setStatus("Please wait while we find someone for you to talk to...");
    };

    const onMatched = ({ room }) => {
      setStatus("Match found! Redirecting...");
      setTimeout(() => {
        navigate(`/chat/${room}`);
      }, 1500);
    };

    socket.on("waiting", onWaiting);
    socket.on("matched", onMatched);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("waiting", onWaiting);
      socket.off("matched", onMatched);
    };
  }, [socket, navigate]);

  if (!socket || !connected) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0e0e2c",
          color: "#fff",
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0e0e2c",
          color: "#fff",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Waiting Room
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          {status}
        </Typography>

        <CircularProgress color="inherit" />
      </Box>
    </motion.div>
  );
};
export default WaitingRoom;