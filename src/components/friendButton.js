import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Box } from "@mui/material";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptFriendRequest(requestId);

      dispatch(
        setFriendStatus({
          userId,
          status: "friends",
        }),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDecline = async () => {
    try {
      await declineFriendRequest(requestId);

      dispatch(
        setFriendStatus({
          userId,
          status: "none",
        }),
      );
    } catch (err) {
      console.log(err);
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
        <Button variant="outlined" onClick={handleAccept} sx={buttonSx}>
          Accept
        </Button>
        <Button variant="outlined" onClick={handleDecline} sx={buttonSx}>
          Decline
        </Button>
      </Box>
    );
  }

  if (status === "friends") {
    return (
      <Button variant="outlined" disabled sx={buttonSx}>
        Friends
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
