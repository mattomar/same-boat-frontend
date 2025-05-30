import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const ChatRoom = () => {
  const socket = useSocket();
  const { room } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Join the chat room
    socket.emit("join-room", { room });

    socket.on("chat message", ({ message, sender }) => {
      setMessages((msgs) => [...msgs, { message, sender }]);
      setIsTyping(false); // stop typing indicator when message received
    });

    socket.on("session ended", () => {
      alert("Chat session ended");
    });

    // Listen for partner typing event
    socket.on("partner-typing", ({ sender }) => {
      // Show typing bubble only if it's not from self
      if (sender !== socket.id) {
        setIsTyping(true);

        // Clear previous timeout if still typing
        if (typingTimeout.current) clearTimeout(typingTimeout.current);

        // Hide typing after 2 seconds of no typing events
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 7000);
      }
    });

    return () => {
      socket.off("chat message");
      socket.off("session ended");
      socket.off("partner-typing");
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [socket, room]);

  // Emit typing event when user types
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
  
    if (!socket || !room) return;
  
    if (value.trim() === "") {
      // Input is empty — notify locally to hide typing bubble
      setIsTyping(false);
    } else {
      // Input has text — emit typing event
      socket.emit("typing", { room });
    }
  };

  const sendMessage = () => {
    if (input.trim() === "") return;

    socket.emit("chat message", { room, message: input });
    setInput("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        p: 2,
        bgcolor: "#0e0e2c",
        color: "#fff",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Chat Room: {room}
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          borderRadius: 2,
          bgcolor: "#1e1e3f",
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, i) => {
          const isOwn = msg.sender === socket.id;
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  bgcolor: isOwn ? "#4fbc90" : "#2c2c55",
                  color: "#fff",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  borderTopRightRadius: isOwn ? 0 : 2,
                  borderTopLeftRadius: isOwn ? 2 : 0,
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {isOwn ? "You" : "Stranger"}
                </Typography>
                <Typography variant="body1">{msg.message}</Typography>
              </Box>
            </Box>
          );
        })}

        {/* Typing bubble */}
        {isTyping && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              mb: 1,
              maxWidth: "40%",
            }}
          >
            <Box
              sx={{
                bgcolor: "#2c2c55",
                color: "#ccc",
                px: 2,
                py: 1,
                borderRadius: 2,
                borderTopLeftRadius: 0,
                boxShadow: 1,
                fontStyle: "italic",
                fontSize: "0.9rem",
                userSelect: "none",
              }}
            >
              Stranger is typing...
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
          gap: 1,
          p: 1.5,
          bgcolor: "#1e1e3f",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <TextField
          fullWidth
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message..."
          variant="outlined"
          InputProps={{
            sx: {
              bgcolor: "#2c2c55",
              color: "#fff",
              borderRadius: 2,
              "& fieldset": { borderColor: "#4fbc90" },
              "&:hover fieldset": { borderColor: "#4fbc90" },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            height: "56px",
            px: 3,
            bgcolor: "#4fbc90",
            color: "#0e0e2c",
            "&:hover": {
              bgcolor: "#3fa87e",
            },
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;
