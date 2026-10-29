import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@mui/material";
import { removeFriend } from "../utils/api";
import { setFriendStatus } from "../store/friendSlice";

const buttonSx = {
  color: "white",
  borderColor: "rgba(255, 255, 255, 0.7)",
  borderRadius: "8px",
  textTransform: "none",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    boxShadow: "0 0 8px rgba(255, 255, 255, 0.25)",
  },
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
};

const RemoveFriendButton = ({ userId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRemoveFriend = async () => {
    // Avoid removing someone accidentally.
    const confirmed = window.confirm(
      "Are you sure you want to remove this friend?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await removeFriend(userId);

      dispatch(
        setFriendStatus({
          userId,
          status: "none",
        }),
      );
    } catch (err) {
      console.error("Failed to remove friend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleRemoveFriend}
      disabled={loading}
      sx={buttonSx}
    >
      {loading ? "Removing..." : "Remove Friend"}
    </Button>
  );
};

export default RemoveFriendButton;
