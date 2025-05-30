import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/authForm";
import { signUp } from "../utils/api";
import { Container, Typography, Box } from "@mui/material";

const Signup = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e, formData) => {
    e.preventDefault();
    setError("");

    try {
      await signUp(formData); // Calls your signup API
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Typography variant="h4" align="center" gutterBottom>
          Create an Account
        </Typography>
        <AuthForm type="signup" onSubmit={handleSignup} error={error} />
        {error && (
          <Typography color="error" align="center" mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Signup;