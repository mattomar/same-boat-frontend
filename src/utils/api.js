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
