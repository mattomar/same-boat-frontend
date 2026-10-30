import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Header from "../components/header";
import useDmEvents from "../hooks/useDmEvents";
import {
  getConversationMessages,
  sendDirectMessage,
  markConversationRead,
  deleteDirectMessage,
} from "../utils/api";
import { getDmSocket } from "../utils/dmSocket";
import {
  MAX_MESSAGE_LENGTH,
  displayName,
  formatTimestamp,
} from "../utils/dmFormat";

const addUnique = (list, msg) =>
  list.some((m) => String(m.id) === String(msg.id))
    ? list
    : [...list, msg];

const sendViaSocket = (socket, conversationId, text) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject({ message: "Message timed out. Please try again." }),
      8000,
    );

    socket.emit("dm:send", { conversationId, text }, (res) => {
      clearTimeout(timer);
      if (res && res.ok) resolve(res.message);
      else reject({ message: (res && res.error) || "Could not send message." });
    });
  });

const Conversation = () => {
  const { conversationId } = useParams();
  const convId = Number(conversationId);
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("userId"));

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Message menu
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const bottomRef = useRef(null);
  const skipScroll = useRef(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  // Initial history
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getConversationMessages(conversationId, {
        limit: 50,
      });

      setOtherUser(data.conversation.otherUser);
      setMessages(data.messages);
      setHasMore(data.hasMore);

      await markConversationRead(conversationId);
    } catch (err) {
      setError(err?.message || "Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    loadHistory();
  }, [loadHistory]);

  // Join private room and rejoin after reconnects
  useEffect(() => {
    const socket = getDmSocket();
    if (!socket || !Number.isInteger(convId)) return undefined;

    const join = () =>
      socket.emit("dm:join", { conversationId: convId }, (res) => {
        if (res && !res.ok) {
          setError(res.error || "Could not join this conversation.");
        }
      });

    if (socket.connected) join();

    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
      socket.emit("dm:leave", { conversationId: convId });
    };
  }, [convId]);

  // Live message events
  useDmEvents({
    "dm:message": (msg) => {
      if (Number(msg.conversationId) !== convId) return;

      setMessages((prev) => addUnique(prev, msg));

      if (Number(msg.senderId) !== currentUserId) {
        markConversationRead(convId).catch((err) => {
          console.error("Could not mark conversation as read:", err);
        });
      }
    },

    "dm:message:deleted": (msg) => {
      if (Number(msg.conversationId) !== convId) return;

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(msg.id) ? { ...m, ...msg } : m,
        ),
      );
    },
  });

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Load older messages
  const loadOlder = async () => {
    if (!messages.length) return;

    setLoadingOlder(true);

    try {
      const data = await getConversationMessages(conversationId, {
        limit: 50,
        before: messages[0].id,
      });

      skipScroll.current = true;

      setMessages((prev) => [
        ...data.messages.filter(
          (m) => !prev.some((p) => String(p.id) === String(m.id)),
        ),
        ...prev,
      ]);

      setHasMore(data.hasMore);
    } catch (err) {
      setSendError(err?.message || "Could not load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  // Send message
  const handleSend = async () => {
    const body = text.trim();

    if (!body || sending) return;

    setSending(true);
    setSendError("");

    try {
      const socket = getDmSocket();

      const message =
        socket && socket.connected
          ? await sendViaSocket(socket, convId, body)
          : await sendDirectMessage(conversationId, body);

      setMessages((prev) => addUnique(prev, message));
      setText("");
    } catch (err) {
      setSendError(err?.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDelete = async (messageId) => {
    if (deletingId !== null) return;

    const confirmed = window.confirm("Delete this message?");

    if (!confirmed) return;

    setDeletingId(messageId);
    setSendError("");

    try {
      const deletedMessage = await deleteDirectMessage(messageId);

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(messageId)
            ? { ...m, ...deletedMessage }
            : m,
        ),
      );
    } catch (err) {
      setSendError(
        err?.message || "Could not delete message.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Open message menu
  const handleMenuOpen = (event, messageId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(messageId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  const handleMenuDelete = () => {
    const messageId = selectedMessage;
    handleMenuClose();

    if (messageId !== null) {
      handleDelete(messageId);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bubble = (mine) => ({
    maxWidth: "75%",
    px: 1.5,
    py: 1,
    borderRadius: 3,
    color: "white",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    background: mine
      ? "rgba(0, 229, 255, 0.18)"
      : "rgba(255, 255, 255, 0.08)",
    border: mine
      ? "1px solid rgba(0, 229, 255, 0.6)"
      : "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: mine
      ? "0 0 8px rgba(0, 229, 255, 0.35)"
      : "none",
  });

  return (
    <>
      <Header />

      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          px: 0,
          display: "flex",
          flexDirection: "column",
          height: "75vh",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 4,
          backdropFilter: "blur(4px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderBottom: "1px solid #555",
            color: "white",
          }}
        >
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate("/messages")}
            aria-label="Back to messages"
          >
            &larr; Back
          </Button>

          <Avatar src={otherUser?.avatarUrl || undefined}>
            {otherUser ? displayName(otherUser)[0] : ""}
          </Avatar>

          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
              {otherUser ? displayName(otherUser) : "Conversation"}
            </Typography>

            {otherUser && (
              <Typography variant="caption" sx={{ color: "gray" }}>
                @{otherUser.username}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box textAlign="center" py={4}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>

              <Button
                variant="outlined"
                color="inherit"
                onClick={loadHistory}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <>
              {hasMore && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={loadOlder}
                  disabled={loadingOlder}
                  sx={{ alignSelf: "center" }}
                >
                  {loadingOlder ? "Loading..." : "Load older messages"}
                </Button>
              )}

              {messages.length === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "gray",
                    textAlign: "center",
                    py: 4,
                  }}
                >
                  No messages yet. Say hi!
                </Typography>
              )}

              {messages.map((m) => {
                const mine =
                  Number(m.senderId) === currentUserId;
                const deleted = Boolean(m.deletedAt);

                return (
                  <Box
                    key={m.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: mine ? "flex-end" : "flex-start",
                      width: "100%",
                      "&:hover .message-menu-button": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        maxWidth: "100%",
                        flexDirection: mine ? "row" : "row",
                      }}
                    >
                      {mine && !deleted && (
                        <IconButton
                          className="message-menu-button"
                          size="small"
                          aria-label="Message options"
                          onClick={(e) => handleMenuOpen(e, m.id)}
                          sx={{
                            color: "gray",
                            opacity: { xs: 1, sm: 0 },
                            transition: "opacity 0.2s",
                            "&:hover": {
                              color: "white",
                              backgroundColor: "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}

                      <Box
                        sx={{
                          ...bubble(mine),
                          ...(deleted && {
                            color: "gray",
                            fontStyle: "italic",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "none",
                          }),
                        }}
                      >
                        {deleted
                          ? "This message was deleted."
                          : m.text}
                      </Box>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "gray",
                        mt: 0.25,
                        mr: mine ? 0.5 : 0,
                      }}
                    >
                      {formatTimestamp(m.createdAt)}
                    </Typography>
                  </Box>
                );
              })}

              <div ref={bottomRef} />
            </>
          )}
        </Box>

        {/* Message options menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={handleMenuDelete}
            disabled={deletingId !== null}
            sx={{ color: "error.main" }}
          >
            Delete message
          </MenuItem>
        </Menu>

        {/* Input */}
        {!error && (
          <Box sx={{ p: 2, borderTop: "1px solid #555" }}>
            {sendError && (
              <Alert
                severity="error"
                onClose={() => setSendError("")}
                sx={{ mb: 1 }}
              >
                {sendError}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-end",
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder="Type a message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
                inputProps={{
                  maxLength: MAX_MESSAGE_LENGTH,
                }}
                sx={{
                  "& .MuiInputBase-root": { color: "white" },
                  "& fieldset": { borderColor: "#666" },
                }}
              />

              <Button
                variant="contained"
                onClick={handleSend}
                disabled={loading || sending || !text.trim()}
              >
                Send
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Conversation;

