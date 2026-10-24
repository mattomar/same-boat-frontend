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
      await acceptFriendRequest(notification.friendRequestId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                type: "friend_accepted",
                message: "Friend request accepted",
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
      await declineFriendRequest(notification.friendRequestId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                type: "friend_declined",
                message: "Friend request declined",
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
          <CircularProgress />
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
          mt: 5,
          px: 2,
          pb: 5,
        }}
      >
        {/* Page title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
          }}
        >
          Notifications
        </Typography>

        {notifications.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">No notifications yet</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((n, index) => (
              <React.Fragment key={n.id}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    px: 2,
                    py: 2,
                    borderRadius: 3,
                    backgroundColor: n.isRead
                      ? "transparent"
                      : "rgba(25, 118, 210, 0.08)",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: n.isRead
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(25, 118, 210, 0.13)",
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
                      backgroundColor:
                        n.type === "friend_request"
                          ? "rgba(25, 118, 210, 0.12)"
                          : "rgba(76, 175, 80, 0.12)",
                    }}
                  >
                    {n.type === "friend_request" ? "👥" : "✔"}
                  </Avatar>

                  {/* Notification content */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                      }}
                    >
                      {n.type === "friend_request"
                        ? "Friend Request"
                        : "Friend Update"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        cursor: n.senderId ? "pointer" : "default",
                        "&:hover": n.senderId
                          ? {
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
                            }}
                          >
                            Accept
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDecline(n)}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              px: 2,
                              fontWeight: 600,
                            }}
                          >
                            Decline
                          </Button>
                        </Box>
                      )}
                  </Box>
                </ListItem>

                {index < notifications.length - 1 && <Divider sx={{ ml: 8 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

export default Notifications;
