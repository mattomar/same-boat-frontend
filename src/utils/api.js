import axios from "axios";

const API_URL = "http://localhost:3079";

// Sign up API
export const signUp = async (formData) => {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const response = await axios.post(
    `${API_URL}/api/auth/signup`,
    formData,
    config,
  );

  return response.data;
};

// Log in API
export const logIn = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Get user data
export const getUserData = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get user data error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Start session
export const startSession = async () => {
  try {
    const response = await fetch(`${API_URL}/user/start-session`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Session start failed:", error);
    return null;
  }
};

// Fetch categories
export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/posts/categories`);

    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Create post
export const createPostApi = async (formData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(`${API_URL}/posts/createPost`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Create post error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Search gifs
export const searchGifs = async (query) => {
  const response = await axios.get(`${API_URL}/gifs/search?q=${query}`);

  return response.data;
};

// Send friend request
export const sendFriendRequest = async (receiverId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/friends/send/${receiverId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Send request error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Get pending friend requests
export const getFriendRequests = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/api/friends/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get requests error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/friends/accept/${requestId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Accept request error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/friends/decline/${requestId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Decline request error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Get accepted friends
export const getFriends = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/api/friends/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Get friends error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const searchUsers = async (username) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/api/friends/search`, {
      params: { username },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const getFriendStatus = async (userId) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_URL}/api/friends/status/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getNotifications = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

const dmAuth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// Always throw an object with a .message (and any extra fields like .code)
const dmError = (error) => {
  const data = error.response && error.response.data;
  if (data && typeof data === "object") throw data;
  throw {
    message: error.response
      ? "Request failed. Please try again."
      : "Network error. Check your connection.",
  };
};

export const getMessageStatus = async (userId) => {
  try {
    return (
      await axios.get(`${API_URL}/api/messages/status/${userId}`, dmAuth())
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const getConversations = async () => {
  try {
    return (await axios.get(`${API_URL}/api/messages/conversations`, dmAuth()))
      .data;
  } catch (e) {
    return dmError(e);
  }
};

export const openConversationWith = async (userId) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/conversations/with/${userId}`,
        {},
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const getConversationMessages = async (conversationId, params = {}) => {
  try {
    return (
      await axios.get(
        `${API_URL}/api/messages/conversations/${conversationId}/messages`,
        {
          ...dmAuth(),
          params,
        },
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const sendDirectMessage = async (conversationId, text) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/conversations/${conversationId}/messages`,
        { text },
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const getIncomingMessageRequests = async () => {
  try {
    return (
      await axios.get(`${API_URL}/api/messages/requests/incoming`, dmAuth())
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const getOutgoingMessageRequests = async () => {
  try {
    return (
      await axios.get(`${API_URL}/api/messages/requests/outgoing`, dmAuth())
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const sendMessageRequest = async (receiverId, text) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/requests/send/${receiverId}`,
        { text },
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const acceptMessageRequest = async (requestId) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/requests/accept/${requestId}`,
        {},
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const declineMessageRequest = async (requestId) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/requests/decline/${requestId}`,
        {},
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};

export const markConversationRead = async (conversationId) => {
  try {
    return (
      await axios.post(
        `${API_URL}/api/messages/conversations/${conversationId}/read`,
        {},
        dmAuth(),
      )
    ).data;
  } catch (e) {
    return dmError(e);
  }
};


export const removeFriend = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `${API_URL}/api/friends/remove/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Remove friend error:", error);
    throw error.response ? error.response.data : error.message;
  }
};
