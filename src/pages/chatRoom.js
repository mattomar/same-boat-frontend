import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
} from "@mui/material";
import FriendButton from "../components/friendButton";
import { getFriendStatus } from "../utils/api";
import { displayName } from "../utils/dmFormat";

const ChatRoom = () => {
  const socket = useSocket();
  const { room } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  // Reveal-names state. "available" is only true when BOTH people are logged in.
  // status: none | requested_by_me | requested_by_them | declined | revealed
  const [reveal, setReveal] = useState({
    available: false,
    status: "none",
    partner: null,
  });
  const [revealError, setRevealError] = useState("");
  const [friendInfo, setFriendInfo] = useState(null);

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

    // ----- Reveal names -----
    const onRevealRequested = () =>
      setReveal((r) => ({
        ...r,
        available: true,
        status: "requested_by_them",
      }));
    const onRevealAccepted = ({ partner }) => {
      setRevealError("");
      setReveal({ available: true, status: "revealed", partner });
    };
    const onRevealDeclined = () =>
      setReveal((r) => ({ ...r, status: "declined" }));

    socket.on("reveal:requested", onRevealRequested);
    socket.on("reveal:accepted", onRevealAccepted);
    socket.on("reveal:declined", onRevealDeclined);

    // Ask the server whether reveal is available for this room (both users logged in?)
    socket.emit("reveal:state", { room }, (state) => {
      if (state) {
        setReveal({
          available: !!state.available,
          status: state.status || "none",
          partner: state.partner || null,
        });
      }
    });

    return () => {
      socket.off("chat message");
      socket.off("session ended");
      socket.off("partner-typing");
      socket.off("reveal:requested", onRevealRequested);
      socket.off("reveal:accepted", onRevealAccepted);
      socket.off("reveal:declined", onRevealDeclined);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [socket, room]);

  // Once names are revealed, check the friendship status with that person
  useEffect(() => {
    if (reveal.status !== "revealed" || !reveal.partner) return undefined;
    let cancelled = false;
    getFriendStatus(reveal.partner.id)
      .then((data) => {
        if (!cancelled) setFriendInfo(data);
      })
      .catch(() => {
        if (!cancelled) setFriendInfo(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reveal.status, reveal.partner]);

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

  const requestReveal = () => {
    setRevealError("");
    socket.emit("reveal:request", { room }, (res) => {
      if (res && res.ok) {
        setReveal((r) => ({ ...r, status: "requested_by_me" }));
      } else {
        setRevealError(
          (res && res.error) || "Could not send the reveal request.",
        );
      }
    });
  };

  const respondReveal = (accept) => {
    setRevealError("");
    socket.emit("reveal:respond", { room, accept }, (res) => {
      if (!res || !res.ok) {
        setRevealError(
          (res && res.error) || "Could not respond to the request.",
        );
      } else if (!accept) {
        setReveal((r) => ({ ...r, status: "declined" }));
      }
      // on accept, the "reveal:accepted" event updates the screen
    });
  };

  // After names are revealed, "Stranger" becomes their real name
  const partnerLabel = reveal.partner
    ? displayName(reveal.partner)
    : "Stranger";

  const revealPanel = () => {
    if (!reveal.available) return null; // anonymous chats never see any of this

    let body = null;
    if (reveal.status === "none") {
      body = (
        <>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            You're both logged in. Want to reveal who you are?
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={requestReveal}
            sx={{ color: "#4fbc90", borderColor: "#4fbc90" }}
          >
            Reveal names
          </Button>
        </>
      );
    } else if (reveal.status === "requested_by_me") {
      body = (
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          Reveal request sent. Waiting for the stranger to accept...
        </Typography>
      );
    } else if (reveal.status === "requested_by_them") {
      body = (
        <>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            The stranger wants to reveal names with you.
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => respondReveal(true)}
            sx={{
              bgcolor: "#4fbc90",
              color: "#0e0e2c",
              "&:hover": { bgcolor: "#3fa87e" },
            }}
          >
            Accept
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => respondReveal(false)}
          >
            Decline
          </Button>
        </>
      );
    } else if (reveal.status === "declined") {
      body = (
        <Typography variant="body2" sx={{ color: "#aaa" }}>
          Names stay hidden. You can keep chatting anonymously.
        </Typography>
      );
    } else if (reveal.status === "revealed" && reveal.partner) {
      const p = reveal.partner;
      body = (
        <>
          <Avatar src={p.avatarUrl || undefined} sx={{ width: 40, height: 40 }}>
            {displayName(p)[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 120 }}>
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {displayName(p)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              @{p.username}
            </Typography>
          </Box>
          {friendInfo && (
            <FriendButton
              key={`${friendInfo.status}-${friendInfo.requestId}`}
              userId={p.id}
              requestId={friendInfo.requestId}
              initialStatus={friendInfo.status}
            />
          )}
          <Button
            component="a"
            href={`/profile/${p.id}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            color="inherit"
            variant="outlined"
          >
            Open profile
          </Button>
        </>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
          p: 1.5,
          bgcolor: "#1e1e3f",
          border: "1px solid #4fbc90",
          borderRadius: 2,
        }}
      >
        {body}
        {revealError && (
          <Alert
            severity="error"
            sx={{ width: "100%" }}
            onClose={() => setRevealError("")}
          >
            {revealError}
          </Alert>
        )}
      </Box>
    );
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

      {revealPanel()}

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
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  {isOwn ? "You" : partnerLabel}
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
              {partnerLabel} is typing...
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
