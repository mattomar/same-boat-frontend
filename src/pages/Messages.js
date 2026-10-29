import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Header from "../components/header";
import useDmEvents from "../hooks/useDmEvents";
import {
  acceptMessageRequest,
  declineMessageRequest,
  getConversations,
  getIncomingMessageRequests,
  getOutgoingMessageRequests,
} from "../utils/api";
import { displayName, formatTimestamp } from "../utils/dmFormat";

const panelSx = {
  mt: 4,
  px: 3,
  py: 3,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: 4,
  backdropFilter: "blur(4px)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
  color: "white",
};

const statusColor = { pending: "warning", accepted: "success", declined: "error" };

const Messages = () => {
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("userId"));
  const [tab, setTab] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [c, i, o] = await Promise.all([
        getConversations(),
        getIncomingMessageRequests(),
        getOutgoingMessageRequests(),
      ]);
      setConversations(c);
      console.log("CONVERSATIONS:", c); // ADD THIS LINE
      console.log("LOAD FUNCTION RAN");
      console.log("CONVERSATIONS:", c);

      setIncoming(i);
      setOutgoing(o);
      setError("");
    } catch (err) {
      setError(err?.message || "Could not load your messages.");
    } finally {
      setLoading(false);
    }
    
  }, []);
  const unreadTotal = conversations.filter(
    (c) => (c.unreadCount || 0) > 0,
  ).length;

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    load();
  }, [load, navigate]);

  const refresh = () => load(true);
  useDmEvents({
    "dm:conversation:updated": refresh,
    "dm:request:new": refresh,
    "dm:request:accepted": refresh,
    "dm:request:declined": refresh,
  });

  const respond = async (request, accept) => {
    setBusyId(request.id);
    setError("");
    try {
      if (accept) {
        const res = await acceptMessageRequest(request.id);
        navigate(`/messages/${res.conversationId}`);
        return;
      }
      await declineMessageRequest(request.id);
      await load(true);
    } catch (err) {
      setError(err?.message || "Could not update that request.");
      load(true);
    } finally {
      setBusyId(null);
    }
  };

  const empty = (text) => (
    <Typography variant="body2" sx={{ color: "gray", textAlign: "center", py: 4 }}>
      {text}
    </Typography>
  );

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={panelSx}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Messages
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="inherit"
          variant="fullWidth"
          sx={{ borderBottom: "1px solid #555", mb: 2 }}
        >
          <Tab
            label={
              <Badge
                color="error"
                badgeContent={unreadTotal}
                max={99}
                sx={{ pr: unreadTotal ? 2 : 0 }}
              >
                Chats
              </Badge>
            }
          />{" "}
          <Tab
            label={
              <Badge
                color="error"
                badgeContent={incoming.length}
                sx={{ pr: incoming.length ? 2 : 0 }}
              >
                Requests
              </Badge>
            }
          />
          <Tab label="Sent" />
        </Tabs>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => load()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tab === 0 &&
              (conversations.length === 0 ? (
                empty(
                  "No conversations yet. Visit a profile and tap Message to start one.",
                )
              ) : (
                <List>
                  {conversations.map((c) => {
                    const last = c.lastMessage;
                    const preview = last
                      ? `${last.senderId === currentUserId ? "You: " : ""}${last.text}`
                      : "No messages yet";
                    return (
                      <ListItemButton
                        key={c.id}
                        onClick={() => navigate(`/messages/${c.id}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        <ListItemAvatar>
                          <Avatar src={c.otherUser?.avatarUrl || undefined}>
                            {displayName(c.otherUser)[0]}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={displayName(c.otherUser)}
                          secondary={preview}
                          primaryTypographyProps={{
                            color: "white",
                            fontWeight: c.unreadCount > 0 ? 700 : 400,
                          }}
                          secondaryTypographyProps={{
                            color: c.unreadCount > 0 ? "white" : "gray",
                            fontWeight: c.unreadCount > 0 ? 600 : 400,
                            noWrap: true,
                          }}
                        />
                        {c.unreadCount > 0 && (
                          <Box
                            sx={{
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              bgcolor: "#3797F0",
                              flexShrink: 0,
                              ml: 1,
                            }}
                          />
                        )}

                        <Typography
                          variant="caption"
                          sx={{ color: "gray", ml: 2 }}
                        >
                          {formatTimestamp(last?.createdAt || c.lastMessageAt)}
                        </Typography>
                      </ListItemButton>
                    );
                  })}
                </List>
              ))}

            {tab === 1 &&
              (incoming.length === 0 ? (
                empty("No message requests.")
              ) : (
                <List>
                  {incoming.map((r) => (
                    <ListItem
                      key={r.id}
                      alignItems="flex-start"
                      sx={{ gap: 1, flexWrap: "wrap" }}
                    >
                      <ListItemAvatar>
                        <Avatar src={r.sender?.avatarUrl || undefined}>
                          {displayName(r.sender)[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${displayName(r.sender)} (@${r.sender?.username})`}
                        secondary={r.initialMessage}
                        primaryTypographyProps={{ color: "white" }}
                        secondaryTypographyProps={{
                          color: "gray",
                          sx: { wordBreak: "break-word" },
                        }}
                        sx={{ minWidth: 200, flex: 1 }}
                      />
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={busyId === r.id}
                          onClick={() => respond(r, true)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          disabled={busyId === r.id}
                          onClick={() => respond(r, false)}
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ))}

            {tab === 2 &&
              (outgoing.length === 0 ? (
                empty("You haven't sent any message requests.")
              ) : (
                <List>
                  {outgoing.map((r) => (
                    <ListItem
                      key={r.id}
                      secondaryAction={
                        <Chip
                          size="small"
                          label={r.status}
                          color={statusColor[r.status] || "default"}
                          onClick={
                            r.status === "accepted" && r.conversationId
                              ? () => navigate(`/messages/${r.conversationId}`)
                              : undefined
                          }
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={r.receiver?.avatarUrl || undefined}>
                          {displayName(r.receiver)[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={displayName(r.receiver)}
                        secondary={r.initialMessage}
                        primaryTypographyProps={{ color: "white" }}
                        secondaryTypographyProps={{
                          color: "gray",
                          noWrap: true,
                        }}
                        sx={{ pr: 10 }}
                      />
                    </ListItem>
                  ))}
                </List>
              ))}
          </>
        )}
      </Container>
    </>
  );
};

export default Messages;
