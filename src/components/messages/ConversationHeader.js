import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { displayName } from "../../utils/dmFormat";

const ConversationHeader = ({
  otherUser,
  onBack,
  onDeleteConversation,
  deletingConversation,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleClose = () => setMenuAnchor(null);

  const handleDelete = () => {
    handleClose();
    onDeleteConversation();
  };

  return (
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
        onClick={onBack}
        aria-label="Back to messages"
      >
        &larr; Back
      </Button>

      <Avatar src={otherUser?.avatarUrl || undefined}>
        {otherUser ? displayName(otherUser)[0] : ""}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
          {otherUser ? displayName(otherUser) : "Conversation"}
        </Typography>

        {otherUser && (
          <Typography variant="caption" sx={{ color: "gray" }}>
            @{otherUser.username}
          </Typography>
        )}
      </Box>

      <IconButton
        color="inherit"
        aria-label="Conversation options"
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        disabled={deletingConversation}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={handleDelete}
          disabled={deletingConversation}
          sx={{ color: "error.main" }}
        >
          Delete conversation
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConversationHeader;
