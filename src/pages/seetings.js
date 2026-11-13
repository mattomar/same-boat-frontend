import React from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ShieldOutlined, BlockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ mt: 4, color: "white" }}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Settings
        </Typography>

        <Typography color="gray" mb={3}>
          Manage your account and preferences.
        </Typography>

        <Divider sx={{ borderColor: "#555", mb: 3 }} />

        <Typography variant="h6" fontWeight="bold" mb={1}>
          Privacy
        </Typography>

        <List disablePadding>
          <ListItemButton
            onClick={() => navigate("/blocked-users")}
            sx={{ borderRadius: 2, py: 2 }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 45 }}>
              <BlockOutlined />
            </ListItemIcon>

            <ListItemText
              primary="Blocked Users"
              secondary="Manage the accounts you've blocked"
              secondaryTypographyProps={{ color: "gray" }}
            />
          </ListItemButton>
        </List>
      </Container>
    </>
  );
};

export default Settings;
