import { useEffect, useState } from "react";
import {
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "../utils/api";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getFriendRequests();
      setRequests(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptFriendRequest(id);

      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDecline = async (id) => {
    try {
      await declineFriendRequest(id);

      setRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>Friend Requests</h2>

      {requests.length === 0 ? (
        <p>No requests</p>
      ) : (
        requests.map((request) => (
          <div key={request.id}>
            <p>{request.sender.username}</p>

            <button onClick={() => handleAccept(request.id)}>Accept</button>

            <button onClick={() => handleDecline(request.id)}>Decline</button>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
