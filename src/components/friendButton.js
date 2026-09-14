import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "../utils/api";
import { setFriendStatus } from "../store/friendSlice";

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
    return <button disabled>Requested</button>;
  }

  if (status === "pending_received") {
    return (
      <>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleDecline}>Decline</button>
      </>
    );
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
