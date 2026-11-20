import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Alert,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { getBanStatus, submitModerationAppeal } from "../utils/api";

const BannedAppeal = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const data = await getBanStatus();
      if (!data.banned) return navigate("/");
      setInfo(data);
    } catch (err) {
      setError(err.error || err.message || "Could not load ban details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await submitModerationAppeal(info.moderationLogId, explanation);
      await load();
    } catch (err) {
      setError(err.error || err.message || "Could not send appeal");
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading && !info) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  const appeal = info && info.appeal;

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          Your account is banned
        </Typography>

        {info && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {info.reason
              ? `Reason: ${info.reason}`
              : "Your account has been banned by a moderator."}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {appeal ? (
          <Box>
            <Alert
              severity={
                appeal.status === "pending"
                  ? "info"
                  : appeal.status === "accepted"
                    ? "success"
                    : "warning"
              }
            >
              {appeal.status === "pending" && "Your appeal is being reviewed."}
              {appeal.status === "accepted" &&
                "Your appeal was accepted. Log in again."}
              {appeal.status === "rejected" && "Your appeal was rejected."}
            </Alert>

            {appeal.adminResponse && (
              <Typography sx={{ mt: 2 }}>
                <strong>Admin response:</strong> {appeal.adminResponse}
              </Typography>
            )}
          </Box>
        ) : (
          info &&
          info.moderationLogId && (
            <Box>
              <TextField
                label="Why should this ban be reviewed?"
                multiline
                rows={5}
                fullWidth
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                helperText={`${explanation.length}/3000`}
                inputProps={{ maxLength: 3000 }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading || explanation.trim().length < 10}
                onClick={handleSubmit}
              >
                Submit appeal
              </Button>
            </Box>
          )
        )}

        <Button fullWidth sx={{ mt: 3 }} onClick={logout}>
          Log out
        </Button>
      </Box>
    </Container>
  );
};

export default BannedAppeal;
