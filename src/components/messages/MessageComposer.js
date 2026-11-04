import React from "react";
import { Alert, Box, Button, TextField } from "@mui/material";
import { MAX_MESSAGE_LENGTH } from "../../utils/dmFormat";

const MessageComposer = ({
  text,
  onTextChange,
  onSend,
  onKeyDown,
  sending,
  loading,
  sendError,
  onClearError,
}) => {
  return (
    <Box sx={{ p: 2, borderTop: "1px solid #555" }}>
      {sendError && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 1 }}>
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
          onChange={(event) => onTextChange(event.target.value)}
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
          onClick={onSend}
          disabled={loading || sending || !text.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessageComposer;
