import { useState } from "react";
import { sendFriendRequest } from "../utils/api";
import React from "react";

const FriendButton = ({ userId }) => {
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    try {
      setLoading(true);

      await sendFriendRequest(userId);

      setStatus("pending");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "friends") {
    return <button>Friends</button>;
  }

  if (status === "pending") {
    return <button disabled>Pending</button>;
  }

  return (
    <button onClick={handleAddFriend} disabled={loading}>
      {loading ? "Sending..." : "Add Friend"}
    </button>
  );
};

export default FriendButton;
