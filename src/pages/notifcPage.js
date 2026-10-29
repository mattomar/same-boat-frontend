import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  acceptFriendRequest,
  declineFriendRequest,
} from "../utils/api";
import Header from "../components/header";
import { formatTimestamp } from "../utils/dmFormat";

// Theme: page background #0e0e2c, accent green #4fbc90 (same as the chat room)
const ACCENT = "#4fbc90";
const ACCENT_DARK = "#3fa87e";

const typeStyle = {
  friend_request: {
    icon: "👥",
    title: "Friend Request",
    bg: "rgba(79, 188, 144, 0.18)",
  },
  friend_accepted: {
    icon: "✔",
    title: "Friend Request Accepted",
    bg: "rgba(79, 188, 144, 0.18)",
  },
  friend_declined: {
    icon: "✖",
    title: "Friend Request Declined",
    bg: "rgba(239, 83, 80, 0.18)",
  },
};
const fallbackStyle = {
  icon: "🔔",
  title: "Notification",
  bg: "rgba(255, 255, 255, 0.1)",
};
const senderNameOf = (n) =>
  (n.message || "").replace(/ sent you a friend request$/, "") || "this user";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 const handleAccept = async (notification) => {
   try {
     const res = await acceptFriendRequest(notification.friendRequestId);
     const message =
       (res && res.notificationMessage) ||
       `You accepted ${senderNameOf(notification)}'s friend request`;

     setNotifications((prev) =>
       prev.map((n) =>
         n.id === notification.id
           ? {
               ...n,
               type: "friend_accepted",
               message,
               handled: true,
               isRead: true,
             }
           : n,
       ),
     );
   } catch (err) {
     console.error("Failed to accept friend request:", err);
   }
 };

 const handleDecline = async (notification) => {
   try {
     const res = await declineFriendRequest(notification.friendRequestId);
     const message =
       (res && res.notificationMessage) ||
       `You declined ${senderNameOf(notification)}'s friend request`;

     setNotifications((prev) =>
       prev.map((n) =>
         n.id === notification.id
           ? {
               ...n,
               type: "friend_declined",
               message,
               handled: true,
               isRead: true,
             }
           : n,
       ),
     );
   } catch (err) {
     console.error("Failed to decline friend request:", err);
   }
 };

  if (loading) {
    return (
      <>
        <Header />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 8,
          }}
        >
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />

      <Box
        sx={{
          maxWidth: 650,
          mx: "auto",
          mt: 4,
          mb: 5,
          px: 3,
          py: 3,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: 4,
          backdropFilter: "blur(4px)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          color: "white",
        }}
      >
        {/* Page title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: "white",
          }}
        >
          Notifications
        </Typography>

        {notifications.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
            }}
          >
            <Typography variant="body1" sx={{ color: "gray" }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((n, index) => {
              const style = typeStyle[n.type] || fallbackStyle;
              const when = formatTimestamp(n.createdAt);

              return (
                <React.Fragment key={n.id}>
                  <ListItem
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      px: 2,
                      py: 2,
                      borderRadius: 3,
                      // unread = soft green tint + green edge, read = transparent
                      backgroundColor: n.isRead
                        ? "transparent"
                        : "rgba(79, 188, 144, 0.1)",
                      borderLeft: n.isRead
                        ? "3px solid transparent"
                        : `3px solid ${ACCENT}`,
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: n.isRead
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(79, 188, 144, 0.16)",
                      },
                    }}
                  >
                    {/* Notification icon */}
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        fontSize: "20px",
                        flexShrink: 0,
                        color: "white",
                        backgroundColor: style.bg,
                      }}
                    >
                      {style.icon}
                    </Avatar>

                    {/* Notification content */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography sx={{ fontWeight: 600, color: "white" }}>
                          {style.title}
                        </Typography>
                        {when && (
                          <Typography
                            variant="caption"
                            sx={{ color: "gray", flexShrink: 0 }}
                          >
                            {when}
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#c8c8e0",
                          wordBreak: "break-word",
                          cursor: n.senderId ? "pointer" : "default",
                          "&:hover": n.senderId
                            ? {
                                color: ACCENT,
                                textDecoration: "underline",
                              }
                            : {},
                        }}
                        onClick={() => {
                          if (n.senderId) {
                            navigate(`/profile/${n.senderId}`);
                          }
                        }}
                      >
                        {n.message}
                      </Typography>

                      {/* Accept / Decline */}
                      {n.type === "friend_request" &&
                        n.friendRequestId &&
                        !n.handled && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 1.5,
                            }}
                          >
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleAccept(n)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 2,
                                fontWeight: 600,
                                backgroundColor: ACCENT,
                                color: "#0e0e2c",
                                "&:hover": { backgroundColor: ACCENT_DARK },
                              }}
                            >
                              Accept
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleDecline(n)}
                              sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                px: 2,
                                fontWeight: 600,
                                color: "#ff8a80",
                                borderColor: "rgba(255, 138, 128, 0.6)",
                                "&:hover": {
                                  borderColor: "#ff8a80",
                                  backgroundColor: "rgba(255, 138, 128, 0.1)",
                                },
                              }}
                            >
                              Decline
                            </Button>
                          </Box>
                        )}
                    </Box>
                  </ListItem>

                  {index < notifications.length - 1 && (
                    <Divider
                      sx={{ ml: 8, borderColor: "rgba(255, 255, 255, 0.1)" }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </>
  );
};

export default Notifications;
