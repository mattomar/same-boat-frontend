import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const ChatRoom = () => {
  const { socket } = useSocket();
  const { room } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;
  
    // Join the chat room
    socket.emit("join-room", { room });
  
    socket.on("chat message", ({ message, sender }) => {
      console.log(`Received message from sender session: ${sender}`);  // <--- Log sender session here
      setMessages((msgs) => [...msgs, { message, sender }]);
    });
  
    socket.on("session ended", () => {
      alert("Chat session ended");
    });
  
    return () => {
      socket.off("chat message");
      socket.off("session ended");
    };
  }, [socket, room]);
  
  const sendMessage = () => {
    if (input.trim() === "") return;
  
    console.log(`Sending message from session: ${socket.id}`);  // <--- Log own session here
  
    socket.emit("chat message", { room, message: input });
    setMessages((msgs) => [...msgs, { message: input, sender: socket.id }]);
    setInput("");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat Room: {room}
      </Typography>
      <Box
        sx={{
          height: 300,
          overflowY: "auto",
          mb: 2,
          border: "1px solid #ccc",
          p: 2,
        }}
      >
        {messages.map((msg, i) => (
          <Typography
            key={i}
            sx={{ color: msg.sender === socket.id ? "blue" : "green" }}
          >
            <strong>{msg.sender === socket.id ? "You" : "Partner"}:</strong>{" "}
            {msg.message}
          </Typography>
        ))}
      </Box>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Type your message..."
      />
      <Button variant="contained" onClick={sendMessage} sx={{ mt: 1 }}>
        Send
      </Button>
    </Box>
  );
};

export default ChatRoom;