import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Box } from "@mui/material";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../utils/api";
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

const FriendButton = ({ userId, requestId, initialStatus }) => {
  const dispatch = useDispatch();
  const reduxStatus = useSelector((state) => state.friends.relations[userId]);

  const status = reduxStatus || initialStatus || "none";
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);
      await sendFriendRequest(userId);

      dispatch(
        setFriendStatus({
          userId,
          status: "pending_sent",
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptFriendRequest(requestId);

      dispatch(
        setFriendStatus({
          userId,
          status: "friends",
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      await declineFriendRequest(requestId);

      dispatch(
        setFriendStatus({
          userId,
          status: "none",
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this friend?",
    );

    if (!confirmed) return;

    try {
     
setLoading(true);

const result = await removeFriend(userId);
console.log("REMOVE RESPONSE:", result);

dispatch(
  setFriendStatus({
    userId,
    status: "none",
  }),
);

console.log("Friend removed from Redux:", userId);

    } catch (err) {
      console.error("Failed to remove friend:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "pending_sent") {
    return (
      <Button variant="outlined" disabled sx={buttonSx}>
        Requested
      </Button>
    );
  }

  if (status === "pending_received") {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={handleAccept}
          sx={buttonSx}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={handleDecline}
          sx={buttonSx}
        >
          Decline
        </Button>
      </Box>
    );
  }

  if (status === "friends") {
    return (
      <Button
        variant="outlined"
        disabled={loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleRemoveFriend}
        sx={{
          ...buttonSx,
          ...(isHovered && {
            color: "#ff7777",
            borderColor: "#ff7777",
            backgroundColor: "rgba(255, 80, 80, 0.1)",
            "&:hover": {
              color: "#ff7777",
              borderColor: "#ff7777",
              backgroundColor: "rgba(255, 80, 80, 0.15)",
            },
          }),
        }}
      >
        {loading ? "Removing..." : isHovered ? "Remove Friend" : "Friends"}
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      disabled={loading}
      onClick={handleAddFriend}
      sx={buttonSx}
    >
      {loading ? "Sending..." : "Add Friend"}
    </Button>
  );
};

export default FriendButton;
