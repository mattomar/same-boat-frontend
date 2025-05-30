import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthForm = ({ type, onSubmit, disabled, error }) => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (type === "signup") {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("bio", bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      onSubmit(e, formData);
    } else {
      onSubmit(e, { email, password });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        {type === "signup" ? "Sign Up" : "Log In"}
      </Typography>

      <Stack spacing={2}>
        {type === "signup" && (
          <>
            <TextField
              label="First Name"
              variant="outlined"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Last Name"
              variant="outlined"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={disabled}
              fullWidth
            />
            <TextField
              label="Bio"
              variant="outlined"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={3}
              disabled={disabled}
              fullWidth
            />

            {/* Avatar upload button */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Upload Avatar
              </Typography>
              <Button
                variant="outlined"
                component="label"
                disabled={disabled}
                fullWidth
              >
                {avatarFile ? avatarFile.name : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </Button>
            </Box>
          </>
        )}

        <TextField
          label="Email"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={disabled}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={disabled}
          fullWidth
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={disabled}
          fullWidth
        >
          {disabled
            ? type === "signup"
              ? "Signing Up..."
              : "Logging In..."
            : type === "signup"
            ? "Sign Up"
            : "Log In"}
        </Button>

        <Typography variant="body2" align="center" mt={2}>
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/login")}
              >
                Log in
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                style={{
                  color: "#1976d2",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </>
          )}
        </Typography>
      </Stack>
    </Box>
  );
};

export default AuthForm;