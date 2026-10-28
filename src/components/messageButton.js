import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import useDmEvents from "../hooks/useDmEvents";
import {
  acceptMessageRequest,
  declineMessageRequest,
  getMessageStatus,
  openConversationWith,
  sendMessageRequest,
} from "../utils/api";
import { MAX_MESSAGE_LENGTH } from "../utils/dmFormat";

// Props: userId (the profile being viewed). Render only for OTHER users.
const MessageButton = ({ userId }) => {
  const navigate = useNavigate();
  const [rel, setRel] = useState(null);
  const [dialog, setDialog] = useState(null); // "compose" | "respond" | null
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setRel(await getMessageStatus(userId));
    } catch (err) {
      setError(err?.message || "Could not check messaging status.");
    }
  }, [userId]);

  useEffect(() => {
    setRel(null);
    load();
  }, [load]);

  useDmEvents({
    "dm:request:accepted": load,
    "dm:request:declined": load,
    "dm:request:new": load,
  });

  const close = () => {
    setDialog(null);
    setText("");
    setError("");
  };

  const openChat = async () => {
    setBusy(true);
    setError("");
    try {
      const { conversationId } = await openConversationWith(userId);
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      setError(err?.message || "Could not open the conversation.");
      load();
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = async () => {
    setBusy(true);
    setError("");
    try {
      await sendMessageRequest(userId, text);
      close();
      await load();
    } catch (err) {
      setError(err?.message || "Could not send the request.");
      if (err?.code) load(); // state changed under us (e.g. already pending)
    } finally {
      setBusy(false);
    }
  };

  const respond = async (accept) => {
    setBusy(true);
    setError("");
    try {
      if (accept) {
        const res = await acceptMessageRequest(rel.requestId);
        close();
        navigate(`/messages/${res.conversationId}`);
        return;
      }
      await declineMessageRequest(rel.requestId);
      close();
      await load();
    } catch (err) {
      setError(err?.message || "Could not respond to the request.");
    } finally {
      setBusy(false);
    }
  };

  if (!rel) {
    return error ? <Alert severity="error">{error}</Alert> : null;
  }

  let control;
  if (rel.status === "friends" || rel.status === "conversation") {
    control = <Button variant="outlined" color="inherit" disabled={busy} onClick={openChat}>Message</Button>;
  } else if (rel.status === "pending_sent") {
    control = <Chip label="Message request pending" color="warning" variant="outlined" />;
  } else if (rel.status === "pending_received") {
    control = <Button variant="contained" onClick={() => setDialog("respond")}>Respond to message request</Button>;
  } else if (rel.status === "declined" && !rel.canRequestAgain) {
    control = <Chip label="Message request declined" color="error" variant="outlined" />;
  } else {
    control = <Button variant="outlined" color="inherit" onClick={() => setDialog("compose")}>Message</Button>;
  }

  return (
    <>
      {control}
      {error && !dialog && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      <Dialog open={dialog === "compose"} onClose={busy ? undefined : close} fullWidth maxWidth="sm">
        <DialogTitle>Send a message request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You're not friends yet. They'll see your message and can accept or decline before you can chat.
          </DialogContentText>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder="Write your first message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: MAX_MESSAGE_LENGTH }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={submitRequest} disabled={busy || !text.trim()}>
            Send request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === "respond"} onClose={busy ? undefined : close} fullWidth maxWidth="sm">
        <DialogTitle>Message request</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <DialogContentText sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {rel.initialMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => respond(false)} disabled={busy} color="inherit">Decline</Button>
          <Button variant="contained" onClick={() => respond(true)} disabled={busy}>Accept</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessageButton;
