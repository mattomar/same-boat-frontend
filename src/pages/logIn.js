import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/authForm";
import { Container, Typography, CircularProgress, Box, Alert } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { logIn } from "../utils/api"; // your async function

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Assuming formData is FormData, convert to plain object
      const data = await logIn(formData);


      const decoded = jwtDecode(data.token);
      const userId = decoded.userId;

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);

      navigate(`/profile/${userId}`);
    } catch (err) {
      setError(typeof err === "string" ? err : err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>

        <AuthForm
          type="login"
          onSubmit={handleLogin}
          disabled={loading}
          error={error}
        />

        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Login;