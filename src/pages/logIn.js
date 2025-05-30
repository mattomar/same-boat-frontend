import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn } from "../utils/api";
import AuthForm from "../components/authForm";
import { Container, Typography, CircularProgress, Box } from "@mui/material";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, formData) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await logIn(formData);
      localStorage.setItem("token", response.token);
      // optional: set expiry if your backend sends it
      // localStorage.setItem("tokenExpiry", response.expiry || "");

      // optional: dispatch a global event for auth change
      window.dispatchEvent(new Event("storage"));

      navigate("/folders"); // or whatever your protected route is
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
      </Box>
    </Container>
  );
};

export default Login;