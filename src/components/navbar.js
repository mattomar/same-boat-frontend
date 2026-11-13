import React, { useState, useEffect } from "react";
import { Box, Link, ClickAwayListener, Badge } from "@mui/material";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

import UserSearch from "../components/userSearch";
import { disconnectDmSocket } from "../utils/dmSocket";
import { getUnreadNotificationCount, getConversations } from "../utils/api";

const neonStyle = {
  fontSize: "0.9rem",
  filter: `
    brightness(1.2)
    contrast(1.1)
    drop-shadow(0 0 4px #ffffff)
    drop-shadow(0 0 8px #ffffff)
    drop-shadow(0 0 16px #ffffff)
  `,
  transition: "transform 0.3s ease, filter 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    filter: `
      brightness(1.4)
      contrast(1.2)
      drop-shadow(0 0 6px #ffffff)
      drop-shadow(0 0 12px #ffffff)
      drop-shadow(0 0 24px #ffffff)
    `,
  },
};

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch unread message count
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadMessages(0);
      return;
    }

    let active = true;

    const fetchUnreadMessages = async () => {
      try {
        const conversations = await getConversations();

        const count = conversations.filter(
          (c) => (c.unreadCount || 0) > 0,
        ).length;

        if (active) {
          setUnreadMessages(count);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages:", err);
      }
    };

    // Fetch immediately
    fetchUnreadMessages();

    // Refresh when a conversation is marked as read
    window.addEventListener("dm:unread-updated", fetchUnreadMessages);

    // Keep the periodic refresh as a backup
    const interval = setInterval(fetchUnreadMessages, 15000);

    return () => {
      active = false;
      window.removeEventListener("dm:unread-updated", fetchUnreadMessages);
      clearInterval(interval);
    };
  }, [isLoggedIn, location.pathname]);

  // Fetch unread message count
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadMessages(0);
      return;
    }

    let active = true;

    const fetchUnreadMessages = async () => {
      try {
        const conversations = await getConversations();

        const count = conversations.filter(
          (c) => (c.unreadCount || 0) > 0,
        ).length;

        if (active) {
          setUnreadMessages(count);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages:", err);
      }
    };

    fetchUnreadMessages();

    const interval = setInterval(fetchUnreadMessages, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLoggedIn, location.pathname]);

  const handleLogout = () => {
    disconnectDmSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUnreadNotifications(0);
    setUnreadMessages(0);
    setOpenSearch(false);
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "transparent",
        padding: "10px 0",
        width: "100%",
        boxSizing: "border-box",
        gap: "20px",
      }}
    >
      <Link
        component={RouterLink}
        to="/"
        underline="none"
        color="white"
        sx={neonStyle}
      >
        Home
      </Link>

      <Link
        component={RouterLink}
        to="/community"
        underline="none"
        color="white"
        sx={neonStyle}
      >
        Commuinity
      </Link>

      {!isLoggedIn && (
        <Link
          component={RouterLink}
          to="/login"
          underline="none"
          color="white"
          sx={neonStyle}
        >
          Login
        </Link>
      )}

      {isLoggedIn && (
        <>
          <Link
            component={RouterLink}
            to={`/profile/${localStorage.getItem("userId")}`}
            underline="none"
            color="white"
            sx={neonStyle}
          >
            My Profile
          </Link>

          <ClickAwayListener onClickAway={() => setOpenSearch(false)}>
            <Box sx={{ display: "contents" }}>
              <Link
                underline="none"
                color="white"
                sx={{ ...neonStyle, cursor: "pointer" }}
                onClick={() => setOpenSearch((prev) => !prev)}
              >
                Search
              </Link>

              {openSearch && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "60px",
                    right: "20px",
                    backgroundColor: "#151515",
                    color: "#fff",
                    padding: 2,
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 2,
                    width: 300,
                    zIndex: 999,
                    boxShadow: "0 0 12px rgba(255,255,255,0.15)",
                    "& input": {
                      color: "#fff",
                      backgroundColor: "#222",
                    },
                    "& input::placeholder": {
                      color: "#aaa",
                      opacity: 1,
                    },
                    "& label": {
                      color: "#ccc",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      backgroundColor: "#222",
                      "& fieldset": {
                        borderColor: "#666",
                      },
                      "&:hover fieldset": {
                        borderColor: "#fff",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#fff",
                      },
                    },
                    "& .MuiTypography-root": {
                      color: "#fff",
                    },
                    "& a": {
                      color: "#fff",
                    },
                    "& button": {
                      color: "#fff",
                    },
                  }}
                >
                  <UserSearch onClose={() => setOpenSearch(false)} />
                </Box>
              )}
            </Box>
          </ClickAwayListener>

          <Link
            component={RouterLink}
            to="/notifications"
            underline="none"
            color="white"
            sx={neonStyle}
          >
            <Badge
              badgeContent={unreadNotifications}
              color="error"
              max={99}
              invisible={unreadNotifications === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              Notifications
            </Badge>
          </Link>

          <Link
            component={RouterLink}
            to="/messages"
            underline="none"
            color="white"
            sx={neonStyle}
          >
            <Badge
              badgeContent={unreadMessages}
              color="error"
              max={99}
              invisible={unreadMessages === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              Messages
            </Badge>
          </Link>

          <Link
            component={RouterLink}
            to="/settings"
            underline="none"
            color="white"
            sx={neonStyle}
          >
            Settings
          </Link>

          <Link
            underline="none"
            color="white"
            sx={{ ...neonStyle, cursor: "pointer" }}
            onClick={handleLogout}
          >
            Logout
          </Link>
        </>
      )}
    </Box>
  );
}

export default Navbar;
