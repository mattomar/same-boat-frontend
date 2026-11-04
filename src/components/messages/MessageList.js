import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { formatTimestamp } from "../../utils/dmFormat";

const MessageList = ({
  messages,
  currentUserId,
  loading,
  error,
  onRetry,
  hasMore,
  loadingOlder,
  onLoadOlder,
  onDeleteMessage,
  deletingId,
  bottomRef,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

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
      onDeleteMessage(messageId);
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
    background: mine ? "rgba(0, 229, 255, 0.18)" : "rgba(255, 255, 255, 0.08)",
    border: mine
      ? "1px solid rgba(0, 229, 255, 0.6)"
      : "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: mine ? "0 0 8px rgba(0, 229, 255, 0.35)" : "none",
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>

        <Button variant="outlined" color="inherit" onClick={onRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      {hasMore && (
        <Button
          size="small"
          color="inherit"
          onClick={onLoadOlder}
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
        const mine = Number(m.senderId) === currentUserId;
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
              }}
            >
              {mine && !deleted && (
                <IconButton
                  className="message-menu-button"
                  size="small"
                  aria-label="Message options"
                  onClick={(event) => handleMenuOpen(event, m.id)}
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
                {deleted ? "This message was deleted." : m.text}
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
    </>
  );
};

export default MessageList;
