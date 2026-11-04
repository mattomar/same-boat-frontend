import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Container } from "@mui/material";

import Header from "../components/header";
import ConversationHeader from "../components/messages/ConversationHeader";
import MessageList from "../components/messages/MessageList";
import MessageComposer from "../components/messages/MessageComposer";

import useDmEvents from "../hooks/useDmEvents";
import {
  getConversationMessages,
  sendDirectMessage,
  markConversationRead,
  deleteDirectMessage,
  deleteConversation,
} from "../utils/api";

import { getDmSocket } from "../utils/dmSocket";
import { displayName } from "../utils/dmFormat";

const addUnique = (list, msg) =>
  list.some((m) => String(m.id) === String(msg.id)) ? list : [...list, msg];

const sendViaSocket = (socket, conversationId, text) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject({ message: "Message timed out. Please try again." }),
      8000,
    );

    socket.emit("dm:send", { conversationId, text }, (res) => {
      clearTimeout(timer);

      if (res && res.ok) {
        resolve(res.message);
      } else {
        reject({
          message: (res && res.error) || "Could not send message.",
        });
      }
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
  const [deletingConversation, setDeletingConversation] = useState(false);

  const bottomRef = useRef(null);
  const skipScroll = useRef(false);

  // Authentication
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  // Load conversation history
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

  // Join conversation socket room
  useEffect(() => {
    const socket = getDmSocket();

    if (!socket || !Number.isInteger(convId)) {
      return undefined;
    }

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

  // Scroll to newest message
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

  // Enter sends, Shift + Enter creates a new line
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Delete individual message
  const handleDeleteMessage = async (messageId) => {
    if (deletingId !== null) return;

    const confirmed = window.confirm("Delete this message?");

    if (!confirmed) return;

    setDeletingId(messageId);
    setSendError("");

    try {
      const deletedMessage = await deleteDirectMessage(messageId);

      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(messageId) ? { ...m, ...deletedMessage } : m,
        ),
      );
    } catch (err) {
      setSendError(err?.message || "Could not delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  // Delete conversation for current user only
  const handleDeleteConversation = async () => {
    if (deletingConversation) return;

    const confirmed = window.confirm(
      `Delete your conversation with ${
        otherUser ? displayName(otherUser) : "this user"
      }?`,
    );

    if (!confirmed) return;

    setDeletingConversation(true);
    setError("");

    try {
      await deleteConversation(convId);
      navigate("/messages");
    } catch (err) {
      setError(err?.message || "Could not delete conversation.");
      setDeletingConversation(false);
    }
  };

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
        <ConversationHeader
          otherUser={otherUser}
          onBack={() => navigate("/messages")}
          onDeleteConversation={handleDeleteConversation}
          deletingConversation={deletingConversation}
        />

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
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            loading={loading}
            error={error}
            onRetry={loadHistory}
            hasMore={hasMore}
            loadingOlder={loadingOlder}
            onLoadOlder={loadOlder}
            onDeleteMessage={handleDeleteMessage}
            deletingId={deletingId}
            bottomRef={bottomRef}
          />
        </Box>

        {!error && (
          <MessageComposer
            text={text}
            onTextChange={setText}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            sending={sending}
            loading={loading}
            sendError={sendError}
            onClearError={() => setSendError("")}
          />
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ display: "none" }}>
            {error}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default Conversation;
