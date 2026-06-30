import React, { useState } from "react";
import { Box, TextField, List, ListItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { searchUsers } from "../utils/api";
import FriendButton from "./friendButton";
import { setBulkStatuses } from "../store/friendSlice";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = async (value) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const data = await searchUsers(value);

      setResults(data);

      // 🔥 store ALL statuses in redux
      const statuses = Object.fromEntries(data.map((u) => [u.id, u.status]));

      dispatch(setBulkStatuses(statuses));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mx: "auto", mt: 4 }}>
      <TextField
        fullWidth
        placeholder="Search users..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <List>
        {results.map((user) => (
          <ListItem
            key={user.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box onClick={() => navigate(`/profile/${user.id}`)}>
              <Typography fontWeight="bold">{user.username}</Typography>
              <Typography variant="caption" color="gray">
                View profile
              </Typography>
            </Box>

            <FriendButton userId={user.id} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UserSearch;
