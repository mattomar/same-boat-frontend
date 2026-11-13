import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { blockUser, unblockUser, checkBlockStatus } from "../utils/api";

const BlockButton = ({ userId, onBlockStatusChange }) => {
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBlockStatus = async () => {
      try {
        setLoading(true);

        const data = await checkBlockStatus(userId);

        setBlockedByMe(data.blockedByMe);
        setBlockedMe(data.blockedMe);
      } catch (err) {
        console.error("Error checking block status:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadBlockStatus();
    }
  }, [userId]);

  const handleBlock = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to block this user? They won't be able to interact with you.",
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await blockUser(userId);

      setBlockedByMe(true);
      onBlockStatusChange?.(true);
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Could not block this user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to unblock this user?",
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await unblockUser(userId);

      setBlockedByMe(false);
      onBlockStatusChange?.(false);
    } catch (err) {
      console.error("Error unblocking user:", err);
      alert("Could not unblock this user.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CircularProgress size={22} />;
  }

  if (blockedMe) {
    return null;
  }

  return (
    <Button
      variant="outlined"
      color="error"
      disabled={submitting}
      onClick={blockedByMe ? handleUnblock : handleBlock}
    >
      {submitting ? "Please wait..." : blockedByMe ? "Unblock" : "Block"}
    </Button>
  );
};

export default BlockButton;
