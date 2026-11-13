import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import { getBlockedUsers, unblockUser } from "../utils/api";

const BlockedUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBlockedUsers();

        setUsers(
          Array.isArray(data) ? data.filter((block) => block.blockedUser) : [],
        );
      } catch (err) {
        console.error("Error loading blocked users:", err);
        setError("Could not load blocked users.");
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, []);

  const handleUnblock = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to unblock this user?",
    );

    if (!confirmed) return;

    try {
      setUnblockingId(userId);

      await unblockUser(userId);

      setUsers((previous) =>
        previous.filter(
          (block) => Number(block.blockedUser.id) !== Number(userId),
        ),
      );
    } catch (err) {
      console.error("Error unblocking user:", err);
      alert("Could not unblock this user.");
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <>
      <Header />

      <Container maxWidth="md" sx={{ mt: 4, color: "white" }}>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Blocked Users
        </Typography>

        <Typography color="gray" mb={3}>
          Manage the accounts you've blocked.
        </Typography>

        <Divider sx={{ borderColor: "#555", mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        ) : users.length === 0 ? (
          <Typography color="gray" textAlign="center" mt={5}>
            You haven't blocked anyone.
          </Typography>
        ) : (
          <List>
            {users.map((block) => {
              const user = block.blockedUser;

              return (
                <React.Fragment key={block.id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={unblockingId === user.id}
                        onClick={() => handleUnblock(user.id)}
                      >
                        {unblockingId === user.id
                          ? "Please wait..."
                          : "Unblock"}
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={user.username}
                      secondary={`@${user.username}`}
                      primaryTypographyProps={{ color: "white" }}
                      secondaryTypographyProps={{ color: "gray" }}
                    />
                  </ListItem>

                  <Divider sx={{ borderColor: "#444" }} />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Container>
    </>
  );
};

export default BlockedUsers;
