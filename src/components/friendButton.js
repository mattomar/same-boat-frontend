import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendFriendRequest } from "../utils/api";
import { setFriendStatus } from "../store/friendSlice";

const FriendButton = ({ userId }) => {
  const dispatch = useDispatch();

  const status = useSelector(
    (state) => state.friends.relations[userId] || "none",
  );

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

  if (status === "pending_sent") {
    return <button disabled>Requested</button>;
  }

  if (status === "pending_received") {
    return <button>Respond</button>;
  }

  if (status === "friends") {
    return <button disabled>Friends</button>;
  }

  return (
    <button onClick={handleAddFriend} disabled={loading}>
      {loading ? "Sending..." : "Add Friend"}
    </button>
  );
};

export default FriendButton;
